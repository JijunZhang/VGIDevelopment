/**
 *  mongo database 方法
 *  提供基础mongo操作
 */

var mongoBase = function (tableName, pageCount) {
    if (!tableName || tableName.length == 0) {
        console.log('数据表名不存在，初始化失败');
        return null;
    }
    this._tableName = tableName;
    this._pageCount = pageCount || 10;
}
//基础查询
mongoBase.prototype.query = function (model, args, callback) {
    var pageNumber = args.pageNumber || 0;
    model.find(null, null, { skip: pageNumber * this._pageCount, limit: this._pageCount }).exec(function (err, data) { 
        if (!err && !!data) {``
            callback && callback(data);
        }
    });
}
//修改数据
mongoBase.prototype.modify= function (model,objId, newObject, callback) {
    //http://mongoosejs.com/docs/api.html#query_Query-findOneAndRemove
    var newdoc = model(newObject);
    model.findOneAndUpdate({ _id: objId }, newdoc, null, function (err, doc, result) {
        if (!!err) {
            callback('修改失败，错误原因:' + JSON.stringify(err));
        } else {
            callback('修改成功');
        }
    });
};
//增加记录
mongoBase.prototype.add = function (model, newObject, callback) {
    var newdoc = model(newObject);
    newdoc.save(function (err, data) {
        if (!!err) {
            callback('新增失败，错误原因:' + JSON.stringify(err));
        } else {
            callback('修改成功');
        }
    });
};
//删除记录
mongoBase.prototype.remove = function (model, objId, callback) {
    model.findOneAndRemove({ _id: objId }, null, function (err, doc) {
        if (!!err) {
            callback('修改失败，错误原因:' + JSON.stringify(err));
        } else {
            callback('修改成功');
        }
    });
};

module.exports = mongoBase;