var express = require("express"),
    app = express(),
    formidable = require('formidable'),
    util = require('util')
    fs   = require('fs-extra'),
    qt   = require('quickthumb'),
	 	walk    = require('walk'),
	 	files   = [];

// Use quickthumb
app.use(qt.static(__dirname + '/'));

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

    fs.copy(temp_path, new_location + file_name, function(err) {  
      if (err) {
        console.error(err);
      } else {
        console.log("success!")
				console.log('here is the path: ' + temp_path);
      }
    });
  });
});

// index home page
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/images', function(req, res) {
	// Walker options
	var walker  = walk.walk('./uploads', { followLinks: false });

	walker.on('file', function(root, stat, next) {
	    // Add this file to the list of files
	    files.push(root + '/' + stat.name);
	    next();
	});
// images to be sent back to view
	walker.on('end', function() {
	    console.log(files);
			var imageSelect = files[2];
			var image = '<img src="' + imageSelect + '"/>';
			console.log(image);
			res.send(image);
			
	});
});

// Show the upload form	
app.get('/upload-form', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  var form = '<form action="/upload" enctype="multipart/form-data" method="post">Add a title: <input name="title" type="text" /><br><br><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form><br><a href="/">Index</a>';
  res.end(form); 
}); 

// Serve static files
app.use(express.static('./public'));

app.listen(8080);
console.log("Running on port 8080...")
