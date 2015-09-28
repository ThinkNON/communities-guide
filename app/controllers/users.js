var Community = require('../models/community');
var config    = require('../../resources/config');
var jQuery    = require('jquery');
var _         = require('lodash');
var debug     = require('debug');
var log       = debug('users:log');
var error     = debug('users:error');

module.exports = function (app, passport) {

    app.get('/community/join/:id', function (req, res, next) {
        if (!req.isAuthenticated()) {
            return (res.status(401).json({ message: 'Not logged in'}));
        } else {
            Community.findOne({'_id' : req.params.id}).exec(function (err, community) {
                if (err) {
                    next(err);
                } else {
                    var isInCommunity = req.user.communities.some(function (community) {
                        return community.equals(req.params.id);
                    });
                    if (!isInCommunity) {
                       req.user.communities.push(req.params.id);
                    } else {
                        return (res.send(500).json({message : 'Already a member!'}));
                    }
                    req.user.save();

                    var isMember = community.members.some(function (member) {
                        return member.equals(req.user._id);
                    });
                    if (!isMember) {
                        community.members.push(req.user);
                        if (community.leaders.length) {
                            var sortedMembers = [];
                            sortedMembers = _.sortBy(community.members, function (member) {
                                return _.find(community.leaders, function (leader) {
                                    return leader.toString() == member.toString();
                                });
                            });
                            community.members = sortedMembers;
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
        //should delete member from community and and update the members of that community
        if (!req.isAuthenticated()) {
            return (res.status(401).json({ message: 'Not logged in'}));
        } else {
            Community.findOne({'_id' : req.params.id}).exec(function (err, community) {

                var isInCommunity = req.user.communities.some(function (community) {
                    return community.equals(req.params.id);
                });

                if (isInCommunity) {
                    req.user.communities.remove(community._id);
                    req.user.save();
                } else {
                    return (res.send(500).json({message: 'Not a member!'}));
                }
                var isMember = community.members.some(function (member) {
                    return member.equals(req.user._id);
                });

                if (isMember) {
                    community.members.remove(req.user._id);
                    community.save();
                } else {
                    return (res.send(500).json({message: 'Not a member!'}));
                }
            });
            res.json({user: req.user});
        }
    });

    app.get('/error', function (req, res) {
        res.render('error', {
            user : req.user
        });
    });

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: 'back',
            failureRedirect : '/error'
        })
    );

    app.get('/logout', function (req, res) {
        req.cookies = '';
        req.logout();
        res.redirect('/');
    });
};
