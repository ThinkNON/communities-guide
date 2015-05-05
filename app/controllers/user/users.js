var User      = require('../../../app/models/user');
var Community = require('../../../app/models/community');
var communities = require('../../../app/controllers/community/communities.js');
var moment    = require('moment');
var AWS       = require('aws-sdk');
var config    = require('../../../resources/config');
var _         = require('lodash');
var debug     = require('debug');
var log       = debug('users:log');
var error     = debug('users:error');

module.exports = function (app, passport) {

    app.get('/', communities.getCommunities, function (req, res) {
        console.log("COMMUNITIES", req.communities);
        res.render('index.ejs', {
            communities: req.communities
        });
    });

    app.post('/login', function (req, res) {
        console.log("community", req.query.community);
        console.log("COMMUNITY", req.body.community);
        console.log("COMMUNITY", req.communities);
        res.render('login.ejs');
    });


    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
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

