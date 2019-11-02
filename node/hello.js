var express = require('express');
var app = express();

app.get('/node', function(req, res){
	res.send("Hello World!");
});

app.listen(8080);
