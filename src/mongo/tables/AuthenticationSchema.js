var mongoose = require('mongoose');
var md5 = require('../../utils/md5.js');
var guid = require('../../utils/guid.js');
var Schema = mongoose.Schema;
//
var _tableName = 'Authentication',
    regex = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g,
    userCache = {};
//表-用户信息
var AuthenticationSchema = new Schema({
    _id: Schema.Types.ObjectId,
    MailAddress: String,
    UserName: String,
    PassWord: String,
    LeHuoId: String,
    Token: String,
    Verification: String,
    FaceIcon: String,
    NickName: String,
    RealName: String,
    Gender: String,
    Birthday: String,
    PhoneNumber: String,
    QQ: String
});
//用户登录
AuthenticationSchema.methods.confirm = function (args, callback){
    //认证object对象
    var cfmObj = {};
    var un = args.name,
        pwd = args.pwd;
    if (regex.test(un)) {
        cfmObj = {
            MailAddress: un,
            PassWord: md5(pwd),
        }
    } else {
        cfmObj = {
            UserName: un,
            PassWord: md5(pwd),
        }
    }
    //
    var responseObj = {
        status: 'fail',
        content: null,
        token: null,
        userInfo: null,
    }
    var _callback = function (err, data){
        //查找到对象
        if (!err & !!data) {
            //根据用户名创建token字典
            var token = guid();
            userCache[data._doc.UserName]= userCache[data._doc.MailAddress] = token;
            //
            responseObj.status = 'ok';
            responseObj.content = '登录成功';
            responseObj.token = token;
            responseObj.userInfo = {
                UserName: data._doc.UserName,
                MailAddress: data._doc.MailAddress,
                LeHuoId: data._doc.LeHuoId,
                FaceIcon: data._doc.FaceIcon,
                NickName: data._doc.NickName,
                RealName: data._doc.RealName,
                Gender: data._doc.Gender,
                Birthday: data._doc.Birthday,
                PhoneNumber: data._doc.PhoneNumber,
                QQ: data._doc.QQ,
            };
            callback(responseObj);
        } else {
            responseObj.content='登录失败，请检查用户名和密码是否正确';
            callback(responseObj);
        }
    }

    return this.model(_tableName).findOne(cfmObj).exec(_callback);
}
//验证用户信息
AuthenticationSchema.methods.verification = function (args, callback) {
    var responseObj = {
            status: 'fail',
            content: null,
            token: null,
            userInfo: null
        },
        name = args.name || "",
        token = args.token || "";
    if (userCache[name] && userCache[name] === token) {
        responseObj.status = 'ok';
    }
    callback(responseObj);
}
//模型初始化
var _inilizationModel = function (conn) {
    var modelType = conn.model(_tableName, AuthenticationSchema, _tableName);
    return new modelType();
};
//表结构导出
module.exports = {
    AuthenticationSchema: AuthenticationSchema,
    InilizationModel: _inilizationModel
};
