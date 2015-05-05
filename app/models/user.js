var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var userSchema = mongoose.Schema({
    isDeleted: Boolean,
    facebook        : {
        id          : String,
        token       : String,
        email       : String,
        name        : String,
        avatar      : String
    },
    twitter         : {
        id          : String,
        token       : String,
        displayName : String,
        username    : String,
        avatar      : String
    }
});

//
//accountSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);
