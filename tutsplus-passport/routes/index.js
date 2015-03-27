var express = require('express');
var router = express.Router();
var qt   = require('quickthumb');
var	formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var mongoose = require('mongoose');
var walk    = require('walk');

var Gallery = require('../models/gallery');

var images = []; // array for gallery image uploads

// require gallery module
// var gallery = require('../galleries/creategallery.js');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home', // will be main dashboard for user
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/****************************************************************************************************************
		Gallery Routes
	*****************************************************************************************************************/
	
	// catch all auth for individual image routes
	router.all('/uploads/*', isAuthenticated);
	
	// GET the gallery create form - passing current user to the view 
	router.get('/gallery/create', isAuthenticated, function(req, res, next) {
		res.render('multer-form', { user: req.user, message: 'Welcome to Multer upload'});
	});	

	/* POST multer new Gallery and image uploads */
	router.post('/api/file', function(req, res){
		// array to hold uploaded images
		var images = [];
		// used to delete images from multer dir after they've been moved 
		var multer_path = 'uploads/multer';		
		var fileCount = req.files.upload.length;
		
		for(var i=0; i<fileCount; i++) {
			// var imgURL = req.files.upload[i].path;
			var file_name = req.files.upload[i].originalname;
			var temp_path = req.files.upload[i].path;
			// set up custom dir path - change dir name if necessary 
			var new_location = 'galleries/frost/' + req.body.title + '/' + file_name;
			
			// push full size and thumb locations to images array
			images.push( { path: new_location } );  // push new location into images array 
												   //  NB:actual image is not moved yet..
			// log new image path									   
			console.log('Images: ' +JSON.stringify(images[i].path));
				
			// move files to dynamically created directory in galleries folder 
			// new dir is named after title entered on form
			fs.copy(temp_path, new_location, function(err) {
			  	if (err) {
			    	console.error(err);
			  	} else {
					console.log('Completed move for ' + file_name);	
					// decrement file count to know when image transfer is finished
					fileCount--;
					if(fileCount<1) { // all files transferred
						// src dir for images
						var new_location = 'galleries/frost/' + req.body.title + '/';
						// thumbs dest dir
						var thumbDir = 'galleries/frost/' + req.body.title + '/thumbs/';
						
						// create thumbs from src dir images
						makeThumbs(new_location);
						function makeThumbs(path) {
							// check dir exists and read files synchronously - fs-walk might do better job
							if(fs.existsSync(path)) {
								fs.readdirSync(new_location).forEach(function(file, index) {
									var curImage = path + file;
									var destDir = thumbDir + file
							
									// create thumb and save to thumbs directory
									qt.convert({ src:curImage, dst:destDir, width:140, height:140 }, 
										function(err, path) {
										if(err) {
											console.log(err);
										} else
											console.log('Success!Thumb path:' +destDir);
									}); 
								}); // end for each
							} // end outer if	
						} // end makeThumbs

						// delete images from multer default directory 
						deleteFolderRecursive(multer_path);
						function deleteFolderRecursive(path) {
							// again read files in multer dir synchronously - try asynch but might break!
							if( fs.existsSync(path) ) {
							    fs.readdirSync(path).forEach(function(file,index){
							    	var curPath = path + "/" + file;
							      	if(fs.lstatSync(curPath).isDirectory()) { // recurse
							        	deleteFolderRecursive(curPath);
							      	} else { // delete file
							        	fs.unlinkSync(curPath);
							      	}
							    });
							    //fs.rmdirSync(path); this deletes the dir created by multer 
								// which breaks the image upoad after one pass VERY BAD MONKEY!
								// maybe useful for some use cases
						  	}
						}; // end deleteFolderRecursive
					} // end fileCount if
				} // end large else block
			}); // end fs.copy
		} // end outer fileCount for loop 
		
		// Create the new gallery in mongodb			
	    Gallery.create({
			title: req.body.title,
			description: req.body.description,
			uid: req.body.userId,
			images: images,
			created_at : Date.now()
	    }, function(err, file){
	        if(err){console.log(err)}
	        console.log(file)
			});
			res.redirect('/home'); // redirect user home 
	});

	// GET index of user galleries
	router.get('/user-galleries/:id', isAuthenticated, function(req, res) {
		console.log(req.params.id);
		mongoose.model('Gallery').find({uid: req.params.id}, function(err, galleries) {
			console.log(galleries);
			res.render('galleries/show', { galleries: galleries, title: "Gallery Index" } );
		});
	});

	// GET single gallery 
	router.get('/view-gallery/:id', isAuthenticated, function(req, res) {
		// if isAuth = true user logged in and can see Gallery Index 
		// update to be able to view only galleries with their id
		
		// get the gallery from mongodb
		mongoose.model('Gallery').find({_id: req.params.id}, function(err, gallery) {
			console.log(gallery);
			res.render('galleries/gallery', { gallery: gallery } );
		});

	});
	
	return router;
}