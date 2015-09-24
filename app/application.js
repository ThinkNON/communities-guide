var mongoose = require('mongoose');
var express = require('express');
var events = require('events');
var util = require('util');
var bytes = require('bytes');
var path = require('path');
var multipart = require('connect-multiparty');
var config = require('../resources/config');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var debug = require('debug');
var hbs = require('hbs');
var log = debug('application:log');
var error = debug('application:error');
var customHelpers = require('../app/public/js/custom_helpers');

var Application = function (options) {
    if (typeof options === 'undefined') options = {};
    this.options = options;
    events.EventEmitter.call(this);
};

util.inherits(Application, events.EventEmitter);

Application.prototype.boot = function (cb) {

    if (typeof cb === 'undefined') cb = function () {
    };
    var _this = this;

    // get the express application
    var app = express();

    function configureApp() {

        // set the configuration to the app
        app.set('config', config);
        require('../config/passport')(passport);

        // init general middleware
        //app.use(clientErrorHandler());

        // body parsers
        app.use(bodyParser.json({limit: bytes(config.application.uploadLimit)}));
        app.use(bodyParser.urlencoded({extended: true, limit: bytes(config.application.uploadLimit)}));
        app.use(multipart({limit: bytes(config.application.uploadLimit)}));
        app.use(cookieParser());
        app.use(session({secret: config.session.secret}));

        // auth middleware

        // express validator exposes api like
        //  req.assert('field', 'message').isEmpty()
        // app.use(validator());
        app.use(express.static(path.join(__dirname, 'public')));
        app.set('view engine', 'hbs'); // set up hbs for templating
        app.set('views', __dirname + '/views/templates');
        hbs.registerPartials(__dirname + '/views/partials');
        app.use(passport.initialize());
        app.use(passport.session());
        customHelpers.init();
        require('./controllers/users.js')(app, passport);
        require('./controllers/communities.js')(app);
    }

    // connect to mongodb
    var connectToMongoDb = function () {
        var mongoOptions = {
            server: { socketOptions: { keepAlive: 1 } }
        };
        mongoose.connect(_this.options.db.connectionString, mongoOptions);
        // _this.emit('ready');
    };
    connectToMongoDb();

    mongoose.connection.on('error', function (error) {
        log('[app mongoose] not able to connect to mongodb ' + error.message);
    });
    mongoose.connection.on('disconnected', function callback() {
        //connectToMongoDb();
    });

    mongoose.connection.once('open', function callback() {
        // if db is ready, boot application

        configureApp();
        // require('./jobs/email.js')();
        cb();
        _this.emit('ready');
    });

    return app;
};

Application.prototype.stop = function (cb) {
    mongoose.disconnect(function () {
        cb();
    });
};

module.exports = Application;

process.on('uncaughtException', function (err) {
    log('Caught exception: ' + err);
    log(err.stack);
});
