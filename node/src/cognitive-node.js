const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const pg = require('pg');

var app = express();

app.enable('trust proxy');

var pool = new pg.Pool({
	user: 'postgres',
	host: 'postgres',
	database: 'postgres',
	password: 'example',
	max: 10,
	idleTimeoutMillis: 30000
});

function auth(req, res, next){
	if(req.session.loggedin === true){
		next();
	}else{
		res.status = 403;
		res.redirect('/');
	}
}

app.use(bodyParser.json());

app.use(session({
	store: new pgSession({
		pool: pool,
		schemaName: "nginx"
	}),
	secret: "keyboard cat",
	rolling: true,
	saveUninitialized: false,
	resave: true,
	cookie: {
		maxAge: 5 * 60 * 60 * 1000,
		secure: true,
		sameSite: true
	}
}));

app.use('/users', auth);
app.use('/users', express.static('/usr/src/cognitive-node/html/private/', { extensions: 'html', redirect: false }));

app.post('/api/login', function(req, response){
	var username = req.body.username;
	var password = req.body.password;

	if(username && password){
		var query = 'SELECT password FROM nginx.login WHERE username = $1';
		pool
		.query(query, [username])
		.then(result => {
			if(result.rowCount === 1){
				return bcrypt
				.compare(password, result.rows[0].password)
				.then(res => {
					if(res === true){
						req.session.loggedin = true;
						req.session.username = username;
						response.sendStatus(200);
						console.log('User ' + username + ' logged in.');
					}else{
						response.sendStatus(403);
					}
				})
				.catch(err => {
					console.log(err.stack);
					response.sendStatus(500);
				})
			}else{
				response.sendStatus(403);
			}
		})
		.catch(err => {
			console.log(err.stack);
			response.sendStatus(500);
		})
	}else{
		response.sendStatus(403);
	}
});

app.post('/api/logout', function(req, res){
	if(req.session.loggedin === true){
		console.log('User ' + req.session.username + ' logged out.');
		req.session.destroy(function(err){
			if(err) throw new Error(err);
			res.redirect('/');
		});
	}else{
		res.redirect('/');
	}
});

app.get('/api/checklogin', function(req, res){
	if(req.session.loggedin === true){
		res.setHeader('Location', '/users/dashboard');
		res.sendStatus(302);
	}else{
		res.sendStatus(403);
	}
});

app.post('/api/newpatient', function(req, res){
	if(req.session.loggedin === true){
		var arr = [];

		for(var val in req.body){
			if(req.body[val]){arr.push(req.body[val])}else{arr.push(null)}
		}

		var query = 'INSERT INTO patient_data.patients' + 
		'(patient_group,age,height,sex,marital_status,employment_status,financial_status,first_diag,hosp_no,alcohol,nart,panss_pos,panss_neg,cgi_s,cgi_i) ' +
		'VALUES((SELECT id FROM enum.patient_groups WHERE name=$1),$2,$3,$4,' +
		'(SELECT id FROM enum.marital_status WHERE name=$5),' +
		'(SELECT id FROM enum.employment_status WHERE name=$6),' +
		'$7,$8,$9,' +
		'(SELECT id FROM enum.amounts WHERE name=$10),' +
		'$11,$12,$13,$14,$15' +
		') RETURNING id';

		pool
		.query(query, arr)
		.then(result => {
			var sql_resp;
			if(result.rowCount === 1){
				sql_resp = {
					status: 'OK',
					id: result.rows[0].id
				};
			}else{
				sql_resp = {
					status: 'ERR',
					id: null
				};
			}
			res.send(JSON.stringify(sql_resp));
		})
		.catch(err => {
			console.log(err.stack);
			var sql_resp = {
				status: 'ERR',
				id: null
			};
			res.send(JSON.stringify(sql_resp));
		})
	}else{
		res.sendStatus(403);
	}
});

app.get('/api/checkpatient', function(req, res){
	if(req.session.loggedin === true){
		if(Number.isInteger(Number.parseInt(req.query.patientID, 10)) && req.query.patientID > 0){
			var query = 'SELECT EXISTS(SELECT 1 FROM patient_data.patients WHERE id=$1)';
			pool
			.query(query, [req.query.patientID])
			.then(result => {
				if(result.rows[0].exists === true){
					res.sendStatus(200);
				}else{
					res.sendStatus(404);
				}
			})
			.catch(err => {
				console.log(err.stack);
				res.sendStatus(500);
			})
		}else{
			res.sendStatus(404);
		}
	}else{
		res.sendStatus(403);
	}
});

app.get('/api/patient', function(req, res){
	if(req.session.loggedin === true){
		if(Number.isInteger(Number.parseInt(req.query.patientID, 10)) && req.query.patientID > 0){
			pool
			.connect()
			.then(client => {
				var query = 'SELECT * FROM patient_data.patients WHERE id=$1';
				return client
					.query(query, [req.query.patientID])
					.then(result => {
						var subquery = '(SELECT name FROM enum.patient_groups WHERE id=$1)' +
						'UNION ALL (SELECT name FROM enum.marital_status WHERE id=$2)' +
						'UNION ALL (SELECT name FROM enum.employment_status WHERE id=$3)' +
						'UNION ALL (SELECT name FROM enum.amounts WHERE id=$4)';
						var params = [
							result.rows[0].patient_group,
							result.rows[0].marital_status,
							result.rows[0].employment_status,
							result.rows[0].alcohol
						];
						return client
							.query(subquery, params)
							.then(subresult => {
								client.release();

								var data = result.rows[0];
								data.patient_group = subresult.rows[0].name;
								data.marital_status = subresult.rows[1].name;
								data.employment_status = subresult.rows[2].name;
								data.alcohol = subresult.rows[3].name;

								res.send(JSON.stringify(data));
							})
							.catch(err => {
								client.release();
								console.log(err.stack);
								res.sendStatus(404);
							})
					})
					.catch(err => {
						client.release();
						console.log(err.stack);
						res.sendStatus(404);
					})
			})
			.catch(err => {
				console.log(err.stack);
				res.sendStatus(500);
			})
		}else{
			res.sendStatus(404);
		}
	}else{
		res.sendStatus(403);
	}
});

app.post('/api/patient', function(req, res){
	if(req.session.loggedin === true){
		if(Number.isInteger(Number.parseInt(req.body.id, 10)) && req.body.id > 0){
			var arr = [];

			for(var val in req.body){
				if(req.body[val]){arr.push(req.body[val])}else{arr.push(null)}
			}

			var query = 'UPDATE patient_data.patients SET ' +
			'patient_group=(SELECT id FROM enum.patient_groups WHERE name=$1),' +
			'age=$2,height=$3,sex=$4,' +
			'marital_status=(SELECT id FROM enum.marital_status WHERE name=$5),' +
			'employment_status=(SELECT id FROM enum.employment_status WHERE name=$6),' +
			'financial_status=$7,first_diag=$8,hosp_no=$9,' +
			'alcohol=(SELECT id FROM enum.amounts WHERE name=$10),' +
			'nart=$11,panss_pos=$12,panss_neg=$13,cgi_s=$14,cgi_i=$15 ' +
			'WHERE id=$16';

			pool
			.query(query, arr)
			.then(result => {
				if(result.rowCount === 1){
					res.sendStatus(200);
				}else{
					res.sendStatus(404);
				}
			})
			.catch(err => {
				console.log(err.stack);
				res.sendStatus(500);
			})
		}else{
			res.sendStatus(404);
		}
	}else{
		res.sendStatus(403);
	}
});

app.use(function(req, res){
	res.sendStatus(404).sendFile('/usr/src/cognitive-node/html/404.html');
});

app.listen(8080);
console.log("Node JS server started!");
