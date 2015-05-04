var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'), REQUIRED_PASSWORD_LENGTH = 6;

function emailValidator(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var accountSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    isDeleted: Boolean,
    resetExpireDate : {type: Date}
});


accountSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

accountSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

accountSchema.statics.validatePswdLength = function validatePswdLength(value) {
    return value.length == REQUIRED_PASSWORD_LENGTH;
};

//accountSchema.statics.generateHash = function (password, fn) {
//    return bcrypt.hash(password, bcrypt.genSaltSync(8), null, fn);
//};

accountSchema.statics.validPassword = function (password, passwordHash, fn) {
    return bcrypt.compare(password, passwordHash, fn);
};
//
//accountSchema.plugin(timestamps);

module.exports = mongoose.model('Account', accountSchema);
