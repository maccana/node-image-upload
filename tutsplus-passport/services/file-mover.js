'use-strict'

var	emptyFolder 	= require('./empty-folder'),
		thumber 	= require('./thumber'),
		fs   		= require('fs-extra');

exports.fileMove = function(temp_path, destPath, filesTransfered, fileCount, callback) {

	console.log("File Mover....");
	fs.move(temp_path, destPath, function(err) {
	  	if (err) {
	    	console.error(err);
	  	} else {
			console.log('Completed move for ' + destPath);	

			if(filesTransfered == fileCount) {
				console.log("Transfers to gallery folder finished...");
				var success = "Callback received from file mover...";
				callback(success);
			} 
		} 
	}); 
}
