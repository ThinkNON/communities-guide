// load all the things we need
var LocalStrategy = require('passport-local').Strategy,
    moment = require('moment'),
    debug = require('debug'),
    log = debug('passport:log'),
    error = debug('passport:error'),
    Account = require('../app/models/account');

// expose this function to our app using module.exports
module.exports = function (passport) {
    // used to serialize the user for the session
    passport.serializeUser(function (account, done) {
        if (account._id) {
            done(null, account._id);
        } else {
            done(account, null)
        }
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        Account.findById(id, function (err, account) {
            if(!err) done(null, account);
            else done(null, false)
        });
    });
};