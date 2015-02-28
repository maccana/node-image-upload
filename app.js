var express = require("express"),
    app = express(),
    formidable = require('formidable'),
    util = require('util')
    fs   = require('fs-extra'),
    qt   = require('quickthumb'),
		walk    = require('walk'),
		cookieParser = require('cookie-parser');
		

app.use(cookieParser());
// Serve static files
app.use(express.static('./public'));
// configure app
app.set('view engine', 'ejs' );

// index home page
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// logging out json to the browser via api url
app.get('/api/:name', function(req, res) {
  res.json(200, { "hello": req.params.name });
});

// test route for cookie parser in browser
app.get('/name/:name', function(req, res) {
	res.cookie('name', req.params.name)
	.send('<p>To see cookie, <a href="/name">Go Here!</a></p>')
});
app.get('/name', function(req, res) {
	res.clearCookie('name').send(req.cookies.name);
});


app.listen(8080);
console.log("Running on port 8080...")
