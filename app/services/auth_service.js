var communitiesService = require('../services/communities_service');

module.exports = {
    'isLoggedIn': function(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect('/');
    },
    'isLeader': function() {
        return function (req, res, next) {
            var communityId = req.params.id,
                isLeader = false;
            if (req.isAuthenticated()) {
                communitiesService.findById(communityId, function(result) {
                    if (result.success && result.community && result.community.leaders) {
                        result.community.leaders.forEach(function(leader) {
                            if (leader._id.equals(req.user._id)) isLeader = true;
                        });
                    }
                    if (isLeader) {
                        return next();
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                res.redirect('/');
            }
        };
    }
};
