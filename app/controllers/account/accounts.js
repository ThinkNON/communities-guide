var Account = require('../../../app/models/account'),
    moment = require('moment'),
    jwt = require('jwt-simple'),
    jwtauth = require('../../../config/jwtauth.js'),
    AWS = require('aws-sdk'),
    config = require('../../../resources/config'),
    _ = require('lodash'),
    debug = require('debug'),
    log = debug('accounts:log'),
    error = debug('accounts:error');

module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    app.get('/signup', function (req, res) {
        res.render('signup.ejs');
    });

    app.get('/login', function (req, res) {
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
};

function isLoggedIn (req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

