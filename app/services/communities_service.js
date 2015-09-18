var Community = require('../models/community');

module.exports = {
    'findAll': function(callback) {
        Community.find({}).populate('members').exec(function(err, communities) {
            if (err) {
                callback(err);
            } else {
                callback({
                    success: true,
                    communities: communities
                });
            }
        });
    },
    'find': function(query, callback) {
        Community.find(query, function(err, communities) {
            if (err) {
                callback(err);
            } else {
                callback({
                    success: true,
                    communities: communities
                });
            }
        });
    },
    'findById': function(id, callback) {
        Community.findOne({_id: id}).populate('leaders members messages.user').exec(function(err, communities) {
            if (err) {
                callback(err);
            } else {
                callback({
                    success: true,
                    communities: communities
                });
            }
        });
    },
    'save': function(communityJSON, callback) {
        var community = new Community(communityJSON);
        community.save(function(err) {
            if (err) {
                callback(err);
            } else {
                callback({
                    success: true,
                    community: community
                });
            }
        });
    },
    'update': function(communityJSON, callback) {
        var id = communityJSON._id;
        delete communityJSON._id;
        Community.update({_id : id}, communityJSON, {runValidators: true}, function(err) {
            if (err) {
                callback(err);
            } else {
                callback({success: true});
            }
        });
    },
    'delete': function(id, callback) {
        Community.find({_id: id}).remove(function(err) {
            if (err) {
                callback(err);
            } else {
                callback({success: true});
            }
        });
    }
};
