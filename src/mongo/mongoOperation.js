var md5 = require('../utils/md5.js');
var mongoose = require('mongoose');
var databaseconn = require('./databaseconn.js');
//数据
var management = require('./management.js');
//管理员
var authenticment = require('./authenticment.js');
//操作集合
var mongoOp = {};
//查询数据表数据
mongoOp.query = function (name,args,callback){
     management.management[name].query(args, callback);
}
/**
 *  保存修改
 * @param {String} name 修改的表名 
 * @param {String} objectid 单一项id
 * @param {Object} data 待保存数据对象
 */ 
mongoOp.modify = function (name,objectid,data,callback) {
    management.management[name].modify(objectid,data,callback);
}
/*
 * 登录
 * @param {String} name 修改的表名 
 * @param {Object} args
 * @param {Function} callback
 */ 
mongoOp.confirm = function (name, args, callback) {
    authenticment.authenticment[name].confirm(args, callback);
}
/*
 * 验证
 * @param {String} name 修改的表名 
 * @param {Object} args
 * @param {Function} callback
 */ 
mongoOp.verification = function (name, args,callback){
    authenticment.authenticment[name].verification(args,callback);
}
/*
 * 添加
 * @param {String} name 修改的表名 
 * @param {Object} data 符合数据库表字段的数据规范
 * @param {Function} callback
 */ 
mongoOp.add = function (name, data, callback) {
    management.management[name].add(data, callback);
}
//mongodb 操作对象导出
module.exports = mongoOp;