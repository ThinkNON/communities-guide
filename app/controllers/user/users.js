var User      = require('../../../app/models/user');
var Community = require('../../../app/models/community');
var communities = require('../../../app/controllers/community/communities.js');
var AWS       = require('aws-sdk');
var config    = require('../../../resources/config');
var _         = require('lodash');
var debug     = require('debug');
var log       = debug('users:log');
var error     = debug('users:error');

module.exports = function (app, passport) {

    app.get('/', communities.getCommunities, function (req, res) {
        console.log("COMMUNITIES", req.communities);

        if (req.user) {
            log(req.user);
            res.render('index.ejs', {
                communities: req.communities,
                user: req.user
            });
        }

        res.render('index.ejs', {
            communities: req.communities,
            user: {}
        });
    });



    app.param('community', function (req, res, next, id) {
        Community.find(id, function (err, community) {
            if (err) {
                next(err);
            } else if (community) {
                req.community = community;
                next();
            } else {
                next(new Error('failed to load user'));
            }
        });
    });

    app.get('/community/join/:id', function (req, res) {
        var communityId = req.params.id;
        //if authenticated update db adn return success and disable join button ->already a member
        //else alert with Fb/Twitter connect message

        //Fb/Twitter connect  -> /login route
//        console.log("community", req.query.community);
//        console.log("COMMUNITY", req.body.community);
//        console.log("COMMUNITY", req.communities);
        console.log(req.community);
    });


    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));

    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/',
            failureRedirect : '/error'
        })
    );

    app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));

    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/',
            failureRedirect : '/error'
        })
    );

    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/error'
        }));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/error'
        }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });
};

function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

