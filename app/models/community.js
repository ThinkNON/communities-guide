var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var communitySchema = mongoose.Schema({
    title: {type: String, required: true},
    desc: {type: String},
    photoURL: String,
    category: String,
    isDeleted: Boolean,
    memberList: [{type: Schema.Types.ObjectId, ref : 'User'}]
});

module.exports = mongoose.model('Community', communitySchema);
