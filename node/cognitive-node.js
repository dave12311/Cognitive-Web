const express = require('express');
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

app.post('/api', function(req, response){
	var action = req.query.action;
	switch(action){
		case "login":
			var username = req.body.username;
			var password = req.body.password;

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
								response.send("Logged in");
							}else{
								response.send("Incorrect password!");
							}
						});
					}else{
						response.send("Incorrect username!");
					}
				});
			});
			break;
	}
});

app.get('/node', function(req, res){
	res.send("Hello World!");
});

app.listen(8080);
console.log("Node JS server started!");
