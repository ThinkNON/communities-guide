var User      = require('../../../app/models/user');
var Community = require('../../../app/models/community');
var config    = require('../../../resources/config');
var _         = require('lodash');
var debug     = require('debug');
var log       = debug('communities:log');
var error     = debug('communities:error');


exports.getCommunities = function (req, res, done) {
    Community.find({}).populate('memberList')
        .exec(function (err, communities) {
            if (err)
                res.send(err);
            req.communities = communities;
            done();
        });
};


