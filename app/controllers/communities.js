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

    app.get('/api/communities/findById', function(req, res) {
        var communityId = req.query.id;
        communitiesService.findById(communityId, function(result) {
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
