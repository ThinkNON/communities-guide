var FacebookStrategy    = require('passport-facebook').Strategy;
var TwitterStrategy     = require('passport-twitter').Strategy;
var User                = require('../app/models/user');
var moment              = require('moment');
var config              = require('../resources/config');
var debug               = require('debug');
var dotenv              = require('dotenv');
var log                 = debug('passport:log');
var error               = debug('passport:error');
dotenv.load();

var FACEBOOK_APP_ID         = process.env.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET     = process.env.FACEBOOK_APP_SECRET;
var TWITTER_CONSUMER_KEY    = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : FACEBOOK_APP_ID,
        clientSecret    : FACEBOOK_APP_SECRET,
        callbackURL     : config.facebookAuth.callbackURL,
        passReqToCallback: true

    },

    // facebook will send back the token and profile
    function (req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
            //check if the user is already logged in
            if (!req.user) {
                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function (err, user) {

                    if (err) {
                        return done(err);
                    }

                    if (user) {
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.avatar = "https://graph.facebook.com/" + profile.id + "/picture?type=square";
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.email = profile.emails[0].value;

                            user.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        var newUser = new User();
                        // set all of the facebook information in our user model
                        newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.profileUrl = profile.profileUrl;
                        newUser.avatar = "https://graph.facebook.com/" + profile.id + "/picture?type=square";
                        newUser.email  = profile.emails[0].value;
                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.avatar = "https://graph.facebook.com/" + profile.id + "/picture?type=square";
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                var user = req.user;
                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.avatar = "https://graph.facebook.com/" + profile.id + "/picture?type=square";
                user.facebook.email = profile.emails[0].value;

                user.save(function(err) {
                    if(err)
                        throw err;
                    return done(null,user);
                })
            }
        });
    }));

    // =========================================================================
    // TWITTER ================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

        // pull in our app id and secret from our auth.js file
        consumerKey         : TWITTER_CONSUMER_KEY,
        consumerSecret      : TWITTER_CONSUMER_SECRET,
        callbackURL         : config.twitterAuth.callbackURL,
        passReqToCallback: true

    },

    // facebook will send back the token and profile
    function (req, token, tokenSecret, profile, done) {

        // asynchronous
        process.nextTick(function () {
            if(!req.user) {
                User.findOne({ 'twitter.id' : profile.id }, function (err, user) {

                    if (err)
                        return done(err);

                    console.log("TWITTER PROFILE", profile);
                    if (user) {
                        if (!user.twitter.token) {
                            user.twitter.id    = profile.id;
                            user.twitter.token = token;
                            user.twitter.name  = profile.username;
                            user.twitter.avatar = profile._json.profile_image_url;
                            user.twitter.displayName = profile.displayName;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }
                        return done(null, user); // user found, return that user
                    } else {
                        var newUser = new User();

                        newUser.name = profile.displayName;
                        newUser.avatar = profile._json.profile_image_url;
                        newUser.profileUrl = 'https://twitter.com/intent/user?user_id='+ profile.id;
                        newUser.twitter.id    = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.name  = profile.username;
                        newUser.twitter.avatar = profile._json.profile_image_url;
                        newUser.twitter.displayName = profile.displayName;
                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                var user = req.user;
                user.twitter.id    = profile.id;
                user.twitter.token = token;
                user.twitter.name  = profile.username;
                user.twitter.avatar = profile._json.profile_image_url;
                user.twitter.displayName = profile.displayName;

                user.save(function(err) {
                    if(err)
                        throw err;
                    return done(null,user);
                })
            }
        });
    }));
};