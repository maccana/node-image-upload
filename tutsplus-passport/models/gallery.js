
var mongoose = require('mongoose');

module.exports = mongoose.model('Gallery',{
	title: String,
	description: String,
	thumbURL: String,
	uid: String
});