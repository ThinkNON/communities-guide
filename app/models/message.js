var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = {
    message: {type: String},
    user: {type: Schema.Types.ObjectId, ref : 'User'},
    date: {type: Date}
};

module.exports = {
    'Message': Message
};
