var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
    name: {type: String},
    email: {type: String},
    avatar: {type: String},
    profileUrl: {type: String},
    facebook: {
        id: {type: String},
        token: {type: String},
        email: {type: String},
        name: {type: String},
        avatar: {type: String}
    },
    twitter: {
        id: {type: String},
        token: {type: String},
        displayName: {type: String},
        name: {type: String},
        avatar: {type: String}
    },
    communities: [{type: Schema.Types.ObjectId, ref : 'Community'}]
});

module.exports = mongoose.model('User', userSchema);
