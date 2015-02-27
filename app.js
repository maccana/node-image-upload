var express = require("express"),
    app = express(),
    formidable = require('formidable'),
    util = require('util')
    fs   = require('fs-extra'),
    qt   = require('quickthumb'),
		walk    = require('walk');
		
// Array to hold gallery images  		
var	images   = [];

// Use quickthumb
app.use(qt.static(__dirname + '/'));

// add ejs 
app.set('view engine', 'ejs' );

// route to upload form
app.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });
  form.on('end', function(fields, files) {
    /* Temporary location of our uploaded file */
    var temp_path = this.openedFiles[0].path;
    /* The file name of the uploaded file */
    var file_name = this.openedFiles[0].name;
    /* Location where we want to copy the uploaded file */
    var new_location = 'uploads/';
		// use fs to copy images to uploads dir
    fs.copy(temp_path, new_location + file_name, function(err) {  
      if (err) {
        console.error(err);
      } else {
        console.log("success!")
				console.log('Temp path: ' + temp_path);
      }
    });
  });
});

// index home page
app.get('/', function(req, res) {
	// clear the images array to avoid dupe images when returning to gallery - temp fix
	images = [];
  res.sendFile(__dirname + '/public/index.html');
});

// route to return images from uploads dir to gallery view
app.get('/gallery', function(req, res) {
	// temp fix to stop dupe images from browser cache
	images = [];
	// Walker options
	var walker  = walk.walk('./uploads', { followLinks: false });
	// if file found add to files array
	walker.on('file', function(root, stat, next) {
		// grab files extension
		var fileExt = stat.name.split('.').pop();
		// make sure file is image format before pushing to images array
		if(fileExt === 'jpg' || fileExt === 'jpeg' 
				|| fileExt === 'png' || fileExt === 'gif'){
	    images.push(root + '/' + stat.name);
		
		} else { 
				console.log(stat.name + ' is not an image file..');
		}
		next();
	});
	// images to be sent back to view
	walker.on('end', function() {
			// make images accessible to the view
		 	res.locals.images = images;
			// render the images view
			res.render('gallery', images);
	
	    // send one image to browser
			// var imageSelect = files[2];
			// var image = '<img src="' + imageSelect + '"/>';
			// console.log(image);
			// res.send(image);
	});
});

// Show basic upload form	
app.get('/upload-form', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  var form = '<form action="/upload" enctype="multipart/form-data" method="post">Add a title: <input name="title" type="text" /><br><br><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form><br><a href="/">Index</a>';
  res.end(form); 
}); 

// api test route logging out json to the browser 
app.get('/api/:name', function(req, res) {
  res.json(200, { "hello": req.params.name });
});

// Serve static files
app.use(express.static('./public'));

app.listen(8080);
console.log("Running on port 8080...")
