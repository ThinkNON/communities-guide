var communitiesService = require('../services/communities_service');

module.exports = function(app) {
    app.get('/', function(req, res) {
        communitiesService.findAll(function(result) {
            if (result.success) {
                res.render('index', {
                    communities: result.communities,
                    user: req.user || {}
                });
            }
        });
    });

    app.get('/communities/:id', function(req, res) {
        var communityId = req.params.id;
        communitiesService.findById(communityId, function(result) {
            if (result.success) {
                res.render('view_community', {
                    community: result.community,
                    user: req.user || {}
                });
            }
        });
    });

    app.get('/communities/edit/:id', function(req, res) {
        var communityId = req.params.id;
        communitiesService.findById(communityId, function(result) {
            if (result.success) {
                res.render('edit_community', {
                    community: result.community
                });
            }
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
