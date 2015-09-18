var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var communitySchema = mongoose.Schema({
    title: {type: String, required: true},
    desc: {type: String},
    photoURL: {type: String},
    isDeleted: {type: Boolean},
    founded: {type: Date},
    categories: [{type: String}],
    leaders: [{type: Schema.Types.ObjectId, ref : 'User'}],
    members: [{type: Schema.Types.ObjectId, ref : 'User'}],
    messages: [{
        message: {type: String},
        user: {type: Schema.Types.ObjectId, ref : 'User'},
        date: {type: Date}
    }],
    fbLink: {type: String},
    linkedinLink: {type: String},
    meetupLink: {type: String},
    webLink: {type: String}
});

module.exports = mongoose.model('Community', communitySchema);
