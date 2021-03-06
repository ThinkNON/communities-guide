var communitiesService = require('../services/communities_service');
var authService = require('../services/auth_service');
var config = require('../../resources/config');
var moment = require('moment');
var AWS = require('aws-sdk');
var fs = require('fs');
var categories = [
    {id: 'technology', text: 'tehnologie'},
    {id: 'management', text: 'management'},
    {id: 'fun', text: 'distracție'},
    {id: 'creative', text: 'creație'},
    {id: 'business analysis', text: 'analiză de business'},
    {id: 'educational', text: 'educație'},
    {id: 'testing', text: 'testare'},
    {id: 'mobile', text: 'mobil'},
    {id: 'social', text: 'social'},
    {id: 'environment', text: 'mediu'},
    {id: 'philanthropy', text: 'filantropie'}
];
var nl2br = function(str, isXhtml) {
    var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};
moment.lang('ro');

module.exports = function(app) {
    app.get('/', function(req, res) {
        communitiesService.findAll(function(result) {
            if (result.success) {
                res.render('index', {
                    communities: result.communities,
                    user: req.user || null
                });
            }
        });
    });

    app.get('/api/communities/latestMessages', function(req, res) {
        var latestMessages = [],
            limit = req.query.limit || 10;
        communitiesService.findAll(function(result) {
            if (result.success) {
                result.communities.forEach(function (community) {
                    community.messages.forEach(function (message) {
                        latestMessages.push({
                            communityTitle: community.title,
                            communityId: community._id,
                            message: message.message,
                            date: message.date
                        });
                    });
                });
            }

            latestMessages.sort(function(a, b) {
                return a.date.getTime() - b.date.getTime();
            });
            latestMessages.reverse();
            latestMessages = latestMessages.slice(0, limit);
            res.json(latestMessages);
        });
    });

    app.get('/about', function(req, res) {
        res.render('about', {user: req.user || null});
    });

    app.get('/terms-and-conditions', function(req, res) {
        res.render('terms_conditions', {user: req.user || null});
    });

    app.get('/communities/new', authService.isLoggedIn, function(req, res) {
        res.render('start_community', {
            user: req.user || null,
            categories: categories
        });
    });

    app.get('/communities/:id', function(req, res) {
        var communityId = req.params.id;
        communitiesService.findById(communityId, function(result) {
            console.log("community", result);
            if (result.success) {
                var community = result.community;
                var messages = [];

                community.desc = nl2br(result.community.desc);
                community.messages.forEach(function(elem) {
                    messages.unshift({
                        _id: elem._id,
                        user: elem.user,
                        message: elem.message,
                        date: moment(elem.date).fromNow()
                    });
                });
                res.render('view_community', {
                    community: community,
                    messages: messages,
                    user: req.user || null
                });
            }
        });
    });

    app.get('/communities/edit/:id', authService.isLeader(), function(req, res) {
        var communityId = req.params.id;
        communitiesService.findById(communityId, function(result) {
            if (result.success) {
                var community = result.community;
                community.desc = nl2br(result.community.desc);
                res.render('edit_community', {
                    community: community,
                    user: req.user || null,
                    categories: categories
                });
            }
        });
    });

    app.get('/api/communities/findById', authService.isLoggedIn, function(req, res) {
        var communityId = req.query.id;
        communitiesService.findById(communityId, function(result) {
            res.json(result);
        });
    });

    app.post('/api/communities/save', authService.isLoggedIn, function(req, res) {
        var communityJSON = req.body.communityJSON;
        if (communityJSON.webLink) {
            if (!(communityJSON.webLink.substring(0,7)=="http://") && !((communityJSON.webLink.substring(0,8)=="https://"))) {
                communityJSON.webLink = "http://" + communityJSON.webLink;
            }
        }
        communityJSON.leaders = [req.user];
        communityJSON.active = false;
        communitiesService.save(communityJSON, function(result) {
            if (result.success) {
                req.user.communities.push(result.community.id);
                req.user.save();
            }
            result.user = req.user;
            res.json(result);
        });
    });

    app.post('/api/communities/update', authService.isLeader(), function(req, res) {
        var communityJSON = req.body.communityJSON;
        communitiesService.update(communityJSON, function(result) {
            res.json(result);
        });
    });

    app.post('/api/communities/add-message', authService.isLeader(), function(req, res) {
        var messageJSON = req.body.messageJSON;
        messageJSON.user = req.user;
        messageJSON.date = new Date();
        communitiesService.addMessage(messageJSON, function(result) {
            res.json(result);
        });
    });

    app.post('/api/communities/delete-message', authService.isLeader(), function(req, res) {
        var communityId = req.body.communityId;
        var messageId = req.body.messageId;
        communitiesService.deleteMessage(communityId, messageId, function(result) {
            res.json(result);
        });
    });

    app.post('/api/communities/add-file', authService.isLoggedIn, function(req, res) {

        if (req.files.file.size > config.assets.s3.uploadLimit) {
            res.send(403).json({message: 'Upload limit exceeded!'});
            next();
        }
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: config.assets.s3.region
        });

        var s3Bucket = new AWS.S3({
            params: {
                Bucket: config.assets.s3.bucketName,
                ACL: config.assets.s3.acl
            }
        });

        var file = req.files.file;

        fs.readFile(file.path, function(err, file_buffer) {
            var data = {
                Key: 'images/' + file.originalFilename,
                Body: file_buffer
            };

            s3Bucket.upload(data, function(err, data) {
                if (err) {
                    res.send(err);
                } else {
                    var url = config.assets.s3.publicUrl + file.originalFilename;
                    url = url.replace(/^https:\/\//i, 'http://');
                    res.json(url);
                }
            });
        });
    });

    app.post('/api/communities/unset-field', authService.isLeader(), function(req, res) {
        var communityId = req.body.id;
        var field = req.body.field;
        communitiesService.findById(communityId, function(result) {
            if (result.success) {
                var community = result.community;
                community[field] = undefined;
                community.save();
                res.json(result);
            } else {
                res.send(err);
            }
        });
    });

    app.post('/api/communities/delete-file', authService.isLeader(), function(req, res) {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: config.assets.s3.region
        });
        var s3Bucket = new AWS.S3({
            params: {
                Bucket: config.assets.s3.bucketName
            }
        });

        var key = req.body.key;

        s3Bucket.deleteObject({
            Bucket: config.assets.s3.bucketName,
            Key :'images/' + key
        }, function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.json(data);
            }
        });
    });

    app.post('/send-email', function(req, res) {
        var emailJSON = req.body.emailJSON;
        var template = req.body.template;
        if (emailJSON.url) emailJSON.url = config.serverURL + emailJSON.url;
        app.mailer.send(template, emailJSON, function (err) {
            if (err) {
                // handle error
                console.log(err);
                res.json({'error': err});
                return;
            }
            res.json({'success': true});
        });
    });
};
