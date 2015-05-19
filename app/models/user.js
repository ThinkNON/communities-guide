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
        name        : String,
        avatar      : String
    },
    communityList: [{type: Schema.Types.ObjectId, ref : 'Community'}]
});

//
//accountSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);
