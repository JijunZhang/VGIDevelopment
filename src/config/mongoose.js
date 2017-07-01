var config = require('./config')
var mongoose = require('mongoose')

module.exports = function() {
    // 用于处理此类警告
    // (node:27632) DeprecationWarning: Mongoose: mpromise (mongoose's default promise
    // library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
    mongoose.Promise = global.Promise

    var db = mongoose.connect(config.db)

    require('../app/models/user.server.model')
    require('../app/models/maplabel.server.model')
    require('../app/models/task.server.model')

    return db
}