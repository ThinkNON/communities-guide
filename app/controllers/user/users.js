var User      = require('../../../app/models/user');
var Community = require('../../../app/models/community');
var communities = require('../../../app/controllers/community/communities.js');
var AWS       = require('aws-sdk');
var config    = require('../../../resources/config');
var jQuery    = require('jquery');
var _         = require('lodash');
var debug     = require('debug');
var log       = debug('users:log');
var error     = debug('users:error');

module.exports = function (app, passport) {

    app.locals._ = _;
    app.locals.jQuery = jQuery;

    app.locals.getAvatarFromServices = function (service, userid, size) {
        // this return the url that redirects to the according user image/avatar/profile picture
        // implemented services: facebook, twitter, default fallback
        // for facebook use get_avatar_from_service('facebook', vanity url or user-id , size-in-px or size-as-word )
        // for twitter  use get_avatar_from_service('twitter', username, size-in-px or size-as-word )
        // everything else will go to the fallback
        var url = '';

        switch (service) {

            case "facebook":
                // see https://developers.facebook.com/docs/reference/api/
                // available sizes: square (50x50), small (50xH) , normal (100xH), large (200xH)
                var sizeparam = '';
                if (size) {
                    if (size >= 200) {
                        sizeparam = 'large';
                    };
                    if (size >= 100 && size < 200) {
                        sizeparam = 'normal';
                    };
                    if (size >= 50 && size < 100) {
                        sizeparam = 'small';
                    };
                    if (size < 50) {
                        sizeparam = 'square';
                    };
                } else {
                    sizeparam = size;
                }
                url = "https://graph.facebook.com/" + userid + "/picture?type=" + sizeparam;
                break;

            case "twitter":
                // see https://dev.twitter.com/docs/api/1/get/users/profile_image/%3Ascreen_name
                // available sizes: bigger (73x73), normal (48x48), mini (24x24), no param will give you full size
                var sizeparam = '';
                if (size) {
                    if (size >= 73) {
                        sizeparam = 'bigger';
                    };
                    if (size >= 48 && size < 73) {
                        sizeparam = 'normal';
                    };
                    if (size < 48) {
                        sizeparam = 'mini';
                    };
                } else {
                    sizeparam = size;
                }

                url = "http://api.twitter.com/1/users/profile_image?screen_name=" + userid + "&size=" + sizeparam;
                break;

            default:
                // http://www.iconfinder.com/icondetails/23741/128/avatar_devil_evil_green_monster_vampire_icon
                // find your own
                url = "http://i.imgur.com/RLiDK.png"; // 48x48
        }


        return url;
    };

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
            if (err) {
                next(err);
            } else {
                console.log("req.user.communityList BEFORE", req.user.communityList);
                var isInCommunity = req.user.communityList.some(function (community) {
                    return community.equals(req.params.id);
                });
                console.log("isInCommunity", isInCommunity);
                if (isInCommunity) {
                   // req.user.update({_id: req.user._id},{$pull : {communityList : req.params.id}}, false, true);
                    console.log("pull req.user.communityList",req.user);
                }
                req.user.save();
                console.log("req.user.communityList AFTER", req.user.communityList);
                console.log("community.memberList BEFORE", community.memberList);
                var isMember = community.memberList.some(function (member) {
                    return member.equals(req.user._id);
                });
                console.log("isMember", isMember);
                if (isMember) {
                   // _.pull(community.memberList, req.user);
                    community.update({$pull : {memberList : req.user}});
                    console.log("community updated", community);
                }
                community.save();
                console.log("community.memberList AFTER", community.memberList);
            }
        });
        res.json({status: 200, message: "You were successfully removed from the community"});
    });

    app.get('/profile', function (req, res) {
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

