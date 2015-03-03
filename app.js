var express = require('express'),
    app = express(),
    formidable = require('formidable'),
    util = require('util')
    fs = require('fs-extra'),
    qt = require('quickthumb'),
		walk = require('walk'),
		bodyParser = require('body-parser'),
		session = require('express-session'),
		mongoose = require('mongoose'),
		path = require('path'),
		cookieParser = require('cookie-parser');
		
		
// Mongoose connection to MongoDB (ted/ted is readonly)
mongoose.connect('mongodb://****:****@ds049651.mongolab.com:49651/node-image-upload', 		
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
app.use(session({secret: 'this is a secret'}));
app.use(cookieParser());
// View config
app.set('views', path.join( __dirname + '/views'));
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'bower_components/foundation')));
// Body parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Root URL - sign up form
app.get('/', function (req, res) {
    // res.send("<a href='/users'>Show Users</a>");
		res.render('index.html');
});

// Routes for mongodb 
// app.get('/', function (req, res) {
//     res.send("<a href='/users'>Show Users</a>");
// });

app.get('/users', function (req, res) {
    User.find({}, function (err, docs) {
			// render a view here to display the json from mongolab db
      //res.json(docs);
			res.render('users.html', {users: docs} ); 
    });
});

// Create new user 
app.post('/users', function(req, res){
	console.log('User added: ' + JSON.stringify(req.body));
	var user = new User(req.body);
  user.save(function(err) {
    if (err) {
      return res.send(err);
    }
		var data = 'success';
    res.send(data);
  });
	
});

// Get specific user 
app.get('/users/:id', function (req, res) {
    if (req.params.id) {
        User.findOne({ _id: req.params.id }, function (err, doc) {
					// render a view here to display the user from mongolab db
					// var user = docs;
					//res.json(doc);
		       res.render('user.html', {user:doc} ); 
        });
    }
});
	
// index home page
// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/public/index.html');
// });


app.listen(3040);
console.log("Running on port 3040...")
