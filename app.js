var express = require("express"),
    app = express(),
    formidable = require('formidable'),
    util = require('util')
    fs = require('fs-extra'),
    qt = require('quickthumb'),
		walk = require('walk'),
		bodyParser = require('body-parser'),
		session = require('express-session'),
		mongoose = require('mongoose'),
		cookieParser = require('cookie-parser');
		
		
// Mongoose connection to MongoDB (ted/ted is readonly)
mongoose.connect('mongodb://ted:ted@ds061797.mongolab.com:61797/theenlighteneddeveloper', 
function (error) {
    if (error) {
        console.log(error);
    }
});
// Mongoose Schema definition
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    first_name: String,
    last_name: String,
    email: String
});
		
// Mongoose Model definition
var User = mongoose.model('users', UserSchema);
// Serve static files
// app.use(express.static('./public'));
// configure app
app.use(session({secret: 'ssshhhhh'}));
app.use(cookieParser());
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// Routes for mongodb 
// app.get('/', function (req, res) {
//     res.send("<a href='/users'>Show Users</a>");
// });

app.get('/users', function (req, res) {
    User.find({}, function (err, docs) {
			// render a view here to display the json from mongolab db
        res.json(docs);
    });
});

app.get('/users/:email', function (req, res) {
    if (req.params.email) {
        User.find({ email: req.params.email }, function (err, docs) {
            res.json(docs);
        });
    }
});


// index home page
// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/public/index.html');
// });


var sess;

app.get('/',function(req,res){
	sess=req.session;
	//Session set when user Request our app via URL
	if(sess.email)
	{
	/*
	* This line check Session existence.
	* If exists will do some action.
	*/
	res.redirect('/admin');
	}
	else{
	res.render('index.html');
	}
});

app.post('/login',function(req,res){
	sess=req.session;
	//In this we are assigning email to sess.email variable.
	//email comes from HTML page.
	sess.email=req.body.email;
	res.end('done');
});

app.get('/admin',function(req,res){
	sess=req.session;
	if(sess.email)
	{
	res.write('<h1>Hello '+sess.email+'</h1>');
	res.end('<a href="/logout">Logout</a>');
	}
	else
	{
	res.write('<h1>Please login first.</h1>');
	res.end('<a href="+">Login</a>');
	}
});

app.get('/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
		console.log(err);
		}
		else
		{
		res.redirect('/');
		}
	});
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
