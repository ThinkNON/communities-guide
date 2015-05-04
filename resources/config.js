var yaml = require('js-yaml'),
    fs = require('fs'),
    path = require('path'),
    dotenv = require('dotenv');
dotenv.load();

//get the apps configuration

var environment = process.env.NODE_ENV || 'development';
var config = {};

console.log("ENVIRONMENT NODE_ENV", process.env.NODE_ENV);
function loadConfig(filename) {
    try {
        var config = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
        return config;
    } catch (error) {
        console.log("[config] cannot load " + filename + ": " + error);
        return null;
    }
}

config = loadConfig(path.join(__dirname, 'config.' + environment + ".yml"));
if (!config) {
    config = loadConfig((path.join(__dirname, 'config.yml')));
}
if (!config) {
    throw new Error('Unable to read configuration');
}

module.exports = config;