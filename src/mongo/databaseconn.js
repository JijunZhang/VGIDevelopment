/**
 * 多数据库连接
 * @module databaseconn
 */ 
var mongoose = require('mongoose');
//数据映射
var management = require('./management.js');
//管理员映射
var authenticment = require('./authenticment.js');
//导出对象
var databaseconn = {
    //认证接口
    auth: {},
    //初始化接口
    data: {},
};
//用户认证
var authorUri = {
    //Data: 'mongodb://admin:!admin_1@120.26.205.190:27017/Data',
    Data: 'mongodb://172.16.101.153:27017/mean-book',
};
//数据库连接字符串
var dataUri = {
    //jiayu: 'mongodb://admin:!admin_2@120.26.205.190:27017/jiayu',
    Data: 'mongodb://172.16.101.153:27017/mean-book',
};
//认证接口初始化
// for (var authorName in authorUri) {
//     (function (name) {
//         databaseconn.auth[name] = mongoose.createConnection(authorUri[name], {
//             server: {
//                 socketOptions: {
//                     keepAlive: 1
//                 }
//             },
//             replset: {
//                 socketOptions : {
//                     keepAlive: 1
//                 }
//             }
//         }, function (err, data) {
//             if (!!err) {
//                 console.log('连接数据库失败' + JSON.stringify(err));
//             } else {
//                 console.log(name + ' 数据库连接成功');
//                 authenticment.inilization(databaseconn.auth[name]);
//             }
//         });
//     })(authorName);
// }
//数据接口初始化
for (var dataName in dataUri) {
    (function (name) {
        databaseconn.data[name] = mongoose.createConnection(dataUri[name], {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            },
            replset: {
                socketOptions : {
                    keepAlive: 1
                }
            }
        }, function (err, data) {
            if (!!err) {
                console.log('连接数据库失败' + JSON.stringify(err));
            } else {
                console.log(name + ' 数据库连接成功');
                management.inilization(databaseconn.data[name]);
            }
        });
    })(dataName);
};
//
module.exports = databaseconn;