
var mongoose = require('mongoose');

module.exports = mongoose.model('Gallery',{
	title: String,
	description: String,
	uid: String,
	images: [
		{ path: String }
	]
});