var Community = require('../models/community');

module.exports = {
    'findAll': function(callback) {
        Community.find({active: true}).populate('leaders members').sort('-founded').exec(function(err, communities) {
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
        Community.findOne({_id: id}).populate('leaders members messages.user').exec(function(err, community) {
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
        if (!communityJSON.categories) {
            communityJSON.categories = [];
        }
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
    },
    'addMessage': function(messageJSON, callback) {
        var id = messageJSON._id;
        delete messageJSON._id;
        Community.update({_id: id}, {$push: {'messages': messageJSON}}, function(err) {
            if (err) {
                callback(err);
            } else {
                callback({success: true});
            }
        });
    },
    'deleteMessage': function(communityId, messageId, callback) {
        Community.findByIdAndUpdate(
            communityId,
            {$pull: {'messages': {_id: messageId} } }, function(err) {
                if (err) {
                    callback(err);
                } else {
                    callback({success: true});
                }
            }
        );
    }
};
