var communitiesService = require('../services/communities_service');
var config = require('../../resources/config');
var AWS = require('aws-sdk');
var fs = require('fs');
var categories = [
    {id: 'technology', text: 'Technology'},
    {id: 'management', text: 'Management'},
    {id: 'fun', text: 'Fun'},
    {id: 'creative', text: 'Creative'},
    {id: 'business analysis', text: 'Business Analysis'},
    {id: 'technologies', text: 'Technologies'},
    {id: 'educational', text: 'Educational'},
    {id: 'testing', text: 'Testing'},
    {id: 'mobile', text: 'Mobile'}
];

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

    app.get('/communities/new', function(req, res) {
        res.render('temp_start_community', {
            user: req.user || null,
            categories: categories
        });
    });

    app.get('/communities/:id', function(req, res) {
        var communityId = req.params.id;
        communitiesService.findById(communityId, function(result) {
            if (result.success) {
                res.render('view_community', {
                    community: result.community,
                    user: req.user || null
                });
            }
        });
    });

    app.get('/communities/edit/:id', function(req, res) {
        var communityId = req.params.id;
        communitiesService.findById(communityId, function(result) {
            if (result.success) {
                res.render('temp_edit_community', {
                    community: result.community,
                    user: req.user || null,
                    categories: categories
                });
            }
        });
    });

    app.get('/communities/about-guide/:id', function(req, res) {
        var communityId = req.params.id;
        communitiesService.findById(communityId, function(result) {
            if (result.success) {
                res.render('temp_about_community', {
                    community: result.community
                });
            }
        });
    });

    app.get('/communities/logged-user/:id', function(req, res) {
        var communityId = req.params.id;
        communitiesService.findById(communityId, function(result) {
            if (result.success) {
                res.render('temp_logged_user', {
                    community: result.community
                });
            }
        });
    });

    app.post('/api/communities/save', function(req, res) {
        var communityJSON = req.body.communityJSON;
        communitiesService.save(communityJSON, function(result) {
            res.json(result);
        });
    });

    app.post('/api/communities/update', function(req, res) {
        var communityJSON = req.body.communityJSON;
        communitiesService.update(communityJSON, function(result) {
            res.json(result);
        });
    });

    app.post('/api/communities/add-message', function(req, res) {
        var messageJSON = req.body.messageJSON;
        messageJSON.user = req.user;
        messageJSON.date = new Date();
        communitiesService.addMessage(messageJSON, function(result) {
            res.json(result);
        });
    });

    app.post('/api/communities/add-file', function(req, res) {
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

    app.post('/api/communities/unset-field', function(req, res) {
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

    app.post('/api/communities/delete-file', function(req, res) {
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
};
