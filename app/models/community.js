var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Message = require('./message').Message;

var communitySchema = mongoose.Schema({
    title: {type: String, required: true},
    desc: {type: String, required: true},
    photoURL: {type: String},
    logoURL: {type: String},
    isDeleted: {type: Boolean},
    founded: {type: Date},
    categories: [{type: String}],
    leaders: [{type: Schema.Types.ObjectId, ref : 'User'}],
    members: [{type: Schema.Types.ObjectId, ref : 'User'}],
    messages: [Message],
    fbLink: {type: String},
    linkedinLink: {type: String},
    meetupLink: {type: String},
    webLink: {type: String}
});

module.exports = mongoose.model('Community', communitySchema);
