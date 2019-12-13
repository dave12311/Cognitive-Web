const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const pg = require('pg');
const format = require('pg-format');

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
		console.log("Redirect");
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
		maxAge: 30 * 60 * 1000,
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
		var query = format('SELECT password FROM nginx.login WHERE username = %L', username);
		pool.query(query, function(err, result){
			if(err) throw new Error(err);
			if(result.rowCount === 1){
				bcrypt.compare(password, result.rows[0].password, function(err, res){
					if(err) throw new Error(err);
					if(res === true){
						req.session.loggedin = true;
						req.session.username = username;
						response.sendStatus(200);
					}else{
						response.sendStatus(403);
					}
				});
			}else{
				response.sendStatus(403);
			}
		});
	}else{
		response.sendStatus(403);
	}
});

app.post('/api/logout', function(req, res){
	if(req.session.loggedin === true){
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

		pool.query(query, arr, function(err, result){
			if(err) throw new Error(err);
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
		});
	}else{
		res.sendStatus(403);
	}
});

app.get('/api/checkpatient', function(req, res){
	if(req.session.loggedin === true){
		var query = format('SELECT EXISTS(SELECT 1 FROM patient_data.patients WHERE id=%L)', req.query.patientID);
		pool.query(query, function(err, result){
			if(err) throw new Error(err);
			if(result.rows[0].exists === true){
				res.sendStatus(200);
			}else{
				res.sendStatus(404);
			}
		});
	}else{
		res.sendStatus(403);
	}
});

app.use(function(req, res){
	res.sendStatus(404).sendFile('/usr/src/cognitive-node/html/404.html');
});

app.listen(8080);
console.log("Node JS server started!");
