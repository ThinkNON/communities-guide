var communitiesService = require('../services/communities_service');

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
            user: req.user || null
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
                    user: req.user || null
                });
            }
        });
    });

    //app.get('/communities/edit-temp/:id', function(req, res) {
    //    var communityId = req.params.id;
    //    communitiesService.findById(communityId, function(result) {
    //        if (result.success) {
    //            res.render('temp_edit_community', {
    //                community: result.community
    //            });
    //        }
    //    });
    //});
    //
    //app.get('/communities/about/:id', function(req, res) {
    //    var communityId = req.params.id;
    //    communitiesService.findById(communityId, function(result) {
    //        if (result.success) {
    //            res.render('temp_start_community', {
    //                community: result.community
    //            });
    //        }
    //    });
    //});

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
};
