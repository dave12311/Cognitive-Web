const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const pg = require('pg');
const format = require('pg-format');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var pool = new pg.Pool({
	user: 'postgres',
	host: 'postgres',
	database: 'postgres',
	password: 'example',
	max: 10,
	idleTimeoutMillis: 30000
});

app.use(session({
	store: new pgSession({
		pool: pool,
		schemaName: "nginx"
	}),
	secret: "keyboard cat",
	rolling: true,
	resave: false,
	cookie: { maxAge: 3 * 60 * 1000 }
}));

app.use('/users', auth);
app.use('/users', express.static('/usr/src/cognitive-node/html/private', { extensions: ['html'] }));

function auth(req, res, next){
	if(req.session.loggedin === true){
		next();
	}else{
		res.redirect('/');
	}
}

app.post('/api', function(req, response){
	var action = req.query.action;
	switch(action){
		case "login":
			var username = req.body.username;
			var password = req.body.password;

			if(username && password){
				pool.connect(function(err, client){
					if(err) throw new Error(err);
					var query = format('SELECT password FROM nginx.login WHERE username = %L', username);
					client.query(query, function(err, result){
						client.release();
						if(err) throw new Error(err);
						if(result.rowCount === 1){
							bcrypt.compare(password, result.rows[0].password, function(err, res){
								if(err) throw new Error(err);
								if(res === true){
									req.session.loggedin = true;
									req.session.username = username;
									response.redirect('/users/dashboard');
								}else{
									response.sendFile('/usr/src/cognitive-node/html/loginerror.html');
								}
							});
						}else{
							response.sendFile('/usr/src/cognitive-node/html/loginerror.html');
						}
					});
				});
			}else{
				//TODO: Not enough data html
				response.send("Not enough stuff to log in");
			}
			break;
		case "logout":
			if(req.session.loggedin === true){
				req.session.destroy(function(err){
					if(err) throw new Error(err);
					response.redirect('/');
				});
			}else{
				response.redirect('/');
			}
			break;
		case "newpatient":

			break;
	}
});

app.use(function(req, res, next){
	res.status = 404;
	res.sendFile('/usr/src/cognitive-node/html/404.html');
});

app.listen(8080);
console.log("Node JS server started!");
