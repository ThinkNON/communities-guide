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

    var hasCookies = function (req, res, next) {
        if (req.cookies == '') {
            console.log("no cookies set");
            next();
        }
        if (req.cookies.communityId && req.cookies.userMethod == 'join') {
            Community.findOne({'_id' : req.cookies.communityId}).exec(function (err, community) {
                if (err) {
                    next(err);
                } else {
                    var isInCommunity = req.user.communityList.some(function (community) {
                        return community.equals(req.cookies.communityId);
                    });
                    if (!isInCommunity) {
                        req.user.communityList.push(req.cookies.communityId);
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
                req.cookies = '';
                next();
            });
        } else {
            next();
        }
    };

    app.get('/', communities.getCommunities, function (req, res) {

        res.render('index.ejs', {
            communities: req.communities,
            user: req.user || {}
        });
    });


    app.get('/community/join/:id', function (req, res, next) {
        if (!req.isAuthenticated()) {
            return (res.status(401).json({ message: 'Not logged in'}));
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
                    } else {
                        return (res.send(500).json({message : 'Already a member!'}));
                    }
                    req.user.save();

                    var isMember = community.memberList.some(function (member) {
                        return member.equals(req.user._id);
                    });
                    if (!isMember) {
                        community.memberList.push(req.user);
                        if (community.leaders.length) {
                            console.log("LEADERS", community.leaders);
                            console.log("MEMBERLIST", community.memberList);
                            var sortedMemberList = [];
                            sortedMemberList = _.sortBy(community.memberList, function (member) {
                                return _.find(community.leaders, function (leader) {
                                    return leader.toString() == member.toString();
                                });
                            });
                            community.memberList = sortedMemberList;
                            console.log("sortedMemberList", community.memberList);
                        }
                    } else {
                        return (res.send(500).json({message : 'Already a member!'}));
                    }
                    community.save();
                }
            });
            return (res.json({user: req.user}));
        }
    });

    app.get('/community/leave/:id', function (req, res) {
        //should delete member from community and and update the memberList of that community
        if (!req.isAuthenticated()) {
            return (res.status(401).json({ message: 'Not logged in'}));
        } else {
            Community.findOne({'_id' : req.params.id}).exec(function (err, community) {

                var isInCommunity = req.user.communityList.some(function (community) {
                    return community.equals(req.params.id);
                });

                if (isInCommunity) {
                    req.user.communityList.remove(community._id);
                    req.user.save();
                } else {
                    return (res.send(500).json({message: 'Not a member!'}));
                }
                var isMember = community.memberList.some(function (member) {
                    return member.equals(req.user._id);
                });

                if (isMember) {
                    community.memberList.remove(req.user._id);
                    community.save();
                } else {
                    return (res.send(500).json({message: 'Not a member!'}));
                }
            });
            res.json({user: req.user});
        }
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
        passport.authenticate('facebook', {failureRedirect : '/error'}), hasCookies, function (req,res) {
                console.log("REQuest in callback", req.user);
                res.redirect('/');
            }
        );

    app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/error'
        }));

    app.get('/logout', function (req, res) {
        console.log("req.cookies before logout", req.cookies);
        req.cookies = '';
        req.logout();
        console.log("req.cookies after logout", req.cookies);
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
