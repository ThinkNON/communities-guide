var User      = require('../../../app/models/user');
var Community = require('../../../app/models/community');
var moment    = require('moment');
var AWS       = require('aws-sdk');
var config    = require('../../../resources/config');
var _         = require('lodash');
var debug     = require('debug');
var log       = debug('communities:log');
var error     = debug('communities:error');

exports.getCommunities = function (req, res, done) {
    Community.find(function (err, communities) {
        if (err)
            res.send(err);
        req.communities = communities;

        if (req.isAuthenticated()) {
            return done();
        }
        done();
    });
}

exports.getCommunity = function (req, res, done) {
    Community.find(function (err, communities) {
        if (err)
            res.send(err);
        req.communities = communities;
        done();
    });
}

