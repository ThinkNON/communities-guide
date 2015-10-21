var FacebookStrategy = require('passport-facebook').Strategy;
var usersService = require('../app/services/users_service');
var config = require('../resources/config');
var debug = require('debug');
var dotenv = require('dotenv');
var log = debug('passport:log');
var error = debug('passport:error');
dotenv.load();

var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

module.exports = function (app, passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        usersService.findById(id, function(result) {
            if (!result.success) {
                done(result, null);
            } else {
                done(null, result.user);
            }
        });
    });

    passport.use(new FacebookStrategy({
            // pull in our app id and secret from our auth.js file
            clientID        : FACEBOOK_APP_ID,
            clientSecret    : FACEBOOK_APP_SECRET,
            callbackURL     : config.facebookAuth.callbackURL,
            passReqToCallback: true

        },
        // facebook will send back the token and profile
        function(req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function () {
                //check if the user is already logged in
                if (!req.user) {
                    // find the user in the database based on their facebook id
                    usersService.findByFacebookId(profile.id, function(result) {
                        if (!result.success) {
                            return done(result);
                        }
                        var user = result.user;

                        if (user) {
                            if (user.facebook && user.facebook.token) return done(null, user);

                            user.facebook = {
                                id: profile.id,
                                token: token,
                                avatar: 'https://graph.facebook.com/' + profile.id + '/picture?type=square',
                                name: profile.name.givenName + ' ' + profile.name.familyName,
                                email: profile.emails[0].value
                            };

                            usersService.update(user, function(result) {
                                if (!result.success) throw result;
                                return done(null, user);
                            });
                        } else {
                            var userJSON = {
                                name: profile.name.givenName + ' ' + profile.name.familyName,
                                profileUrl: profile.profileUrl,
                                avatar: 'https://graph.facebook.com/' + profile.id + '/picture?type=square',
                                email: profile.emails[0].value,
                                facebook: {
                                    id: profile.id,
                                    token: token,
                                    avatar: 'https://graph.facebook.com/' + profile.id + '/picture?type=square',
                                    name: profile.name.givenName + ' ' + profile.name.familyName,
                                    email: profile.emails[0].value
                                }
                            };

                            usersService.save(userJSON, function(result) {
                                if (!result.success) {
                                    throw result;
                                } else {
                                    var template = 'new_user_email',
                                        emailJSON = {
                                            from: 'Communities Guide <noreply@communities.guide>',
                                            to: 'office@communities.guide',
                                            subject: 'Utilizator nou',
                                            name: result.user.name,
                                            profileUrl: result.user.profileUrl
                                        };
                                    app.mailer.send(template, emailJSON, function(err) {
                                        return done(null, result.user);
                                    });
                                }
                            });
                        }
                    });
                } else {
                    var user = req.user;
                    user.facebook = {
                        id: profile.id,
                        token: token,
                        name: profile.name.givenName + ' ' + profile.name.familyName,
                        avatar: 'https://graph.facebook.com/' + profile.id + '/picture?type=square',
                        email: profile.emails[0].value
                    };

                    usersService.update(user, function(result) {
                        if (!result.success) throw result;
                        return done(null, user);
                    });
                }
            });
        }
    ));
};
