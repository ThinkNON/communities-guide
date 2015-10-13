var communitiesService = require('../services/communities_service');
var authService = require('../services/auth_service');
var config = require('../../resources/config');
var moment = require('moment');
var AWS = require('aws-sdk');
var fs = require('fs');
var categories = [
    {id: 'tehnologie', text: 'Tehnologie'},
    {id: 'management', text: 'Management'},
    {id: 'distracție', text: 'Distracție'},
    {id: 'creație', text: 'Creație'},
    {id: 'business analysis', text: 'Business Analysis'},
    {id: 'educație', text: 'Educație'},
    {id: 'testare', text: 'Testare'},
    {id: 'mobil', text: 'Mobil'}
];
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
            if (result.success) {
                var community = result.community;
                var messages = [];
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
                res.render('edit_community', {
                    community: result.community,
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
        communityJSON.leaders = [req.user];
        communityJSON.active = false;
        communitiesService.save(communityJSON, function(result) {
            if (result.success) {
                req.user.communities.push(result.community.id);
                req.user.save();
            }
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
