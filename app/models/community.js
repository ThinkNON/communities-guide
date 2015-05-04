var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var communitySchema = mongoose.Schema({
    title: {type: String, required: true},
    desc: {type: String},
    photoURL: String,
    isDeleted: Boolean,
    memberList: [{type: Schema.Types.ObjectId, ref : 'Account'}]
});

module.exports = mongoose.model('Community', communitySchema);
