var User = require('../models/user');

module.exports = {
    'findById': function(id, callback) {
        User.findOne({_id: id}, function(err, user) {
            if (err) {
                callback(err);
            } else {
                callback({
                    success: true,
                    user: user
                });
            }
        });
    },
    'findByFacebookId': function(id, callback) {
        User.findOne({'facebook.id': id}, function(err, user) {
            if (err) {
                callback(err);
            } else {
                callback({
                    success: true,
                    user: user
                });
            }
        });
    },
    'save': function(userJSON, callback) {
        var user = new User(userJSON);
        user.save(function(err) {
            if (err) {
                callback(err);
            } else {
                callback({
                    success: true,
                    user: user
                });
            }
        });
    },
    'update': function(userJSON, callback) {
        var id = userJSON.facebook.id;
        delete userJSON.facebook.id;
        User.update({'facebook.id': id}, userJSON, {runValidators: true}, function(err) {
            if (err) {
                callback(err);
            } else {
                callback({success: true});
            }
        });
    }
};
