var ArticlesSchema = require('./tables/ArticlesSchema');             //热门文章
var BianMinsSchema = require('./tables/BianMinsSchema');       //便民服务
var FansWelSchema = require('./tables/FansWelSchema');          //粉丝福利
var FridaySchema = require('./tables/FridaySchema');                 //乐活星期五
var NewsSchema = require('./tables/NewsSchema');                   //本地新闻
var VideosSchema = require('./tables/VideosSchema');               //本土视频
var WeiQunSchema = require('./tables/WeiQunSchema');            //微群
var usersSchema=require('./tables/userSchema');
var management = {
    // Articles: ArticlesSchema,
    // BianMins: BianMinsSchema,
    // FansWel: FansWelSchema,
    // Friday: FridaySchema,
    // News: NewsSchema,
    // Videos: VideosSchema,
    // WeiQun: WeiQunSchema
    users:usersSchema,
};
/**
 * 输出和数据库操作库
 */ 
var _inilization = function (conn) {
    for (var name in management) {
        management[name] = management[name].InilizationModel&&management[name].InilizationModel(conn);
    }
    console.log('管理数据映射完成');
}

module.exports = {
    management:management,
    inilization:_inilization,
};
