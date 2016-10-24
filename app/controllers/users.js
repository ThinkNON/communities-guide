var communityService = require('../services/communities_service');
var authService = require('../services/auth_service');
var config    = require('../../resources/config');
var jQuery    = require('jquery');
var _         = require('lodash');
var debug     = require('debug');
var log       = debug('users:log');
var error     = debug('users:error');

module.exports = function(app, passport) {

    app.get('/community/join/:id', authService.isLoggedIn, function(req, res, next) {
        if (!req.isAuthenticated()) {
            return (res.status(401).json({ message: 'Not logged in'}));
        } else {
            communityService.findById(req.params.id, function(result) {
                if (!result.success) {
                    next(result);
                } else {
                    var community = result.community;
                    var isInCommunity = req.user.communities.some(function(community) {
                        return (community._id.equals(req.params.id));
                    });
                    if (!isInCommunity) {
                        req.user.communities.push(req.params.id);
                        req.user.save();
                    } else {
                        return (res.send(500).json({message : 'Already a member!'}));
                    }

                    var isMember = community.members.some(function(member) {
                        return (member._id.equals(req.user._id));
                    });
                    if (!isMember) {
                        community.members.push(req.user.id);
                        community.save();
                    } else {
                        return (res.send(500).json({message : 'Already a member!'}));
                    }
                    return (res.json({user: req.user}));
                }
            });
        }
    });

    app.get('/community/leave/:id', authService.isLoggedIn, function(req, res) {
        //should delete member from community and and update the members of that community
        if (!req.isAuthenticated()) {
            return (res.status(401).json({ message: 'Not logged in'}));
        } else {
            communityService.findById(req.params.id, function(result) {
                if (!result.success) {
                    next(result);
                } else {
                    var community = result.community;
                    var isInCommunity = req.user.communities.some(function(community) {
                        return (community._id.equals(req.params.id));
                    });
                    if (isInCommunity) {
                        req.user.communities.remove(community._id);
                        req.user.save();
                    } else {
                        return (res.send(500).json({message: 'Not a member!'}));
                    }
                    var isMember = community.members.some(function(member) {
                        return (member._id.equals(req.user._id));
                    });
                    var isLeader = community.leaders.some(function(leader) {
                        return (leader._id.equals(req.user._id));
                    });

                    if (isMember) {
                        community.members.remove(req.user._id);
                        community.save();
                    } else if (isLeader) {
                        community.leaders.remove(req.user._id);
                        community.save();
                    } else {
                        return (res.send(500).json({message: 'Not a member!'}));
                    }
                    res.json({user: req.user});
                }
            });
        }
    });

    app.get('/error', function(req, res) {
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

    app.get('/logout', function(req, res) {
        req.cookies = '';
        req.logout();
        res.redirect('/');
    });

    app.get('/api/user/latestMessages', authService.isLoggedIn, function(req, res) {
        var latestMessages = [],
            limit = req.query.limit || 5;
        if (req.user) {
            req.user.communities.forEach(function(community) {
                community.messages.forEach(function(message) {
                    latestMessages.push({
                        communityTitle: community.title,
                        communityId: community._id,
                        message: message.message,
                        date: message.date
                    });
                });
            });
            latestMessages.sort(function(a, b) {
                return a.date.getTime() - b.date.getTime();
            });
            latestMessages.reverse();
            latestMessages = latestMessages.slice(0, limit);
        }
        res.json(latestMessages);
    });
};
