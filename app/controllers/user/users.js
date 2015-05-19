var User      = require('../../../app/models/user');
var Community = require('../../../app/models/community');
var communities = require('../../../app/controllers/community/communities.js');
var AWS       = require('aws-sdk');
var config    = require('../../../resources/config');
var jQuery    = require('jquery');
var _         = require('lodash');
var debug     = require('debug');
//var mongoose  = require('mongoose');
//var ObjectId  = mongoose.Types.ObjectId();
var log       = debug('users:log');
var error     = debug('users:error');

module.exports = function (app, passport) {

    app.locals._ = _;
    app.locals.jQuery = jQuery;

    app.get('/', communities.getCommunities, function (req, res) {
        var user;
        if (req.isAuthenticated()) {
            user = req.user;
        } else {
            user = {};
        }
        res.render('index.ejs', {
            communities: req.communities,
            user: user
        });
    });


    app.get('/community/join/:id', function (req, res, next) {
        if (!req.isAuthenticated()) {
            return (res.json({status: 300, message: 'Not logged in'}));
        } else {
            Community.findOne({'_id' : req.params.id}).exec(function (err, community) {
                if (err) {
                    next(err);
                } else {
                    var isInCommunity = req.user.communityList.some(function (community) {
                        return community.equals(req.params.id);
                    });
                    if (!isInCommunity) {
                       req.user.communityList.push(req.params.id);
                    }
                    req.user.save();

                    var isMember = community.memberList.some(function (member) {
                        return member.equals(req.user._id);
                    });
                    if (!isMember) {
                        community.memberList.push(req.user);
                    }
                    community.save();
                }
            });
            return (res.json({status: 200, message: "Logged in"}));
        }
    });

    app.get('/community/leave/:id', function (req, res) {
        //should delete member from community and and update the memberList of that community
        Community.findOne({'_id' : req.params.id}).exec(function (err, community) {

            var isInCommunity = req.user.communityList.some(function (community) {
                return community.equals(req.params.id);
            });

            if (isInCommunity) {
                req.user.communityList.remove(community._id);
                req.user.save();
            }
            var isMember = community.memberList.some(function (member) {
                return member.equals(req.user._id);
            });

            if (isMember) {
                community.memberList.remove(req.user._id);
                community.save();
            }
        });
        res.json({status: 200, message: "You were successfully removed from the community"});
    });

    app.get('/error', function (req, res) {
        res.render('error.ejs', {
            user : req.user
        });
    });

    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));

    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/',
            failureRedirect: '/error'
        })
    );

    app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));

    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/',
            failureRedirect : '/error'
        })
    );

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/error'
        }));

    app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/error'
        }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/unlink/facebook', function (req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/');
        });
    });

    app.get('/unlink/twitter', function (req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/');
        });
    });
};

function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

