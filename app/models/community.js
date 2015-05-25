var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var communitySchema = mongoose.Schema({
    title: {type: String, required: true},
    desc: {type: String},
    photoURL: String,
    category: [String],
    isDeleted: Boolean,
    leaders : [{type: Schema.Types.ObjectId, ref : 'User'}],
    memberList: [{type: Schema.Types.ObjectId, ref : 'User'}],
    fbLink : String,
    linkedinLink : String,
    meetupLink: String,
    webLink : String
});

module.exports = mongoose.model('Community', communitySchema);
