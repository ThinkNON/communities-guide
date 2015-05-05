var config  = require('./resources/config');
var express = require('express');
var morgan  = require('morgan');
var debug   = require('debug');
var dotenv  = require('dotenv');
var log     = debug('server:log');
var error   = debug('server:error');
    dotenv.load();

var MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING_LOCAL;
server = express();

/*enable morgan logger*/
server.use(morgan({
    "format": config.log.morgan.format
}));

//get the apiApp
var Api = require('./app/application');

var api = new Api({
    db: {
        connectionString: MONGODB_CONNECTION_STRING
    }
});

var apiApp = api.boot();

//pass the apiApp to the main express app
server.use(apiApp);


var port = process.env.PORT;
if (!port) {
    port = config.application.port;
}

log("Listening on port " + port);

api.on('ready', function () {
    server.listen(port);
});

process.on('uncaughtException', function (err) {
    error('uncaughtException ' + err);
    error(err.stack);
    process.exit(1);
});

module.exports = server;