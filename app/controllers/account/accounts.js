var Account = require('../../../app/models/account'),
    moment = require('moment'),
    jwt = require('jwt-simple'),
    jwtauth = require('../../../config/jwtauth.js'),
    AWS = require('aws-sdk'),
    config = require('../../../resources/config'),
    _ = require('lodash'),
    debug = require('debug'),
    log = debug('accounts:log'),
    error = debug('accounts:error');

module.exports = function (app, passport) {
    app.post('/accounts/register', function (req, res, next) {
        passport.authenticate('local-signup', function (err, account) {
            if (err) {
                return next(err);
            }
            log("account",account);
            req.logIn(account, function (err) {
                var expires = moment().add('days', 7).valueOf();
                var token = jwt.encode({
                    iss: account.id,
                    exp: expires
                }, app.get('jwtTokenSecret'));
                if (err) {
                    return next(err);
                }
                account.password = null;
                return res.json(
                    {   success: true,
                        token: token,
                        account: account.toJSON()
                    });
            });
        })(req, res, next);
    });


    app.post('/accounts/login', function (req, res, next) {
        passport.authorize('local-login', function (err, account) {
            if (err) {
                return next(err);
            }
            if (!account) {
                return req.clientErrorHandler.handle(404, {global: "RESOURCE_NOT_FOUND"});
            }
            req.logIn(account, function (err) {
                var expires = moment().add('days', 7).valueOf();
                var token = jwt.encode({
                    iss: account.id,
                    exp: expires
                }, app.get('jwtTokenSecret'));
                if (err) {
                    return next(err);
                }
                account.password = null;
                log("recently logged user", account);
                return res.json(
                    {   success: true,
                        token: token,
                        account: account
                    });
            });
        })(req, res, next);
    });
};

