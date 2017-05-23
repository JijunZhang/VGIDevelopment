var mongoose = require('mongoose');
var mongoBase = require('../mongoBase');
var Schema = mongoose.Schema;
//表-新闻
var NewsSchema = new Schema({
    _id: Schema.Types.ObjectId,
    Fid: String,
    Date: String,
    Content: String,
    Ttile: String,
    Description: String,
    ImgUrl: String
});
//新闻缓存
var _tableName = "News",
    //单页显示个数
    _pageCount = 10,
    _mongoBase = new mongoBase(_tableName, _pageCount);
//查询
NewsSchema.methods.query = function (args, callback) {
    var model = this.model(_tableName);
    _mongoBase.query(model, args, callback);
};
//修改
NewsSchema.methods.modify = function (objId, newObject, callback) {
    //http://mongoosejs.com/docs/api.html#query_Query-findOneAndRemove
    var model = this.model(_tableName);
    _mongoBase.modify(model, objId, newObject, callback);
};
//增
NewsSchema.methods.add = function (newObject,callback) {
    var model = this.model(_tableName);
    _mongoBase.add(model, newObject, callback);
};
//删
NewsSchema.methods.remove = function (objId,callback) {
    var model = this.model(_tableName);
    _mongoBase.remove(model, objId, callback);
};
//注册模型
var _inilizationModel = function (conn) {
    var modelType= conn.model(_tableName, NewsSchema, _tableName);
    return new modelType();
};
//表结构导出
module.exports = {
    //初始化
    InilizationModel: _inilizationModel,
};
