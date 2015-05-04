//var jwt = require('jsonwebtoken');

var jwt = require('jwt-simple');
var Account = require('../app/models/account');

module.exports.restrict = function (req, res, next) {

    if (process.env.NODE_ENV === 'local' && req.header('Local-User')) {
        var username = req.header('Local-User');

        Account.findOne({username: username}, function (err, account) {
            if (account) {
                req.account = account;
                next();
            } else {
                res.end('We couldn\'t find a valid username from the local user', 400);
            }
        });
        return ;
    }

    var token = req.header('Authorization') || (req.body && req.body.access_token) || (req.query && req.query.access_token);

    if (token && (typeof token !== 'undefined')) {
        try {
            var decoded = jwt.decode(token, 'YOUR_SUPER_SECRET_VOWLT_STRING');

            if (decoded.exp <= Date.now()) {
                res.end('Access token has expired', 400);
            }

            Account.findOne({_id: decoded.iss}, function (err, account) {
                if (account) {
                    //add the user to the request
                    req.account = account;
                    next();
                } else {
                    res.end('We couldn\'t find a valid username from the received token', 400);
                }
            });

        } catch (err) {
            res.status(400).send({global: err.message});
        }
    } else {
        res.status(401).send({global: "NOT_AUTHORIZED"});
    }
};