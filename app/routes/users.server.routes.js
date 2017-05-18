var users = require('../../app/controllers/users.server.controller');
var passport = require('passport');

module.exports = function(app) {

    //  处理用户相关的路由请求
    app.route('/users/register')    //用户注册
        .post(users.register);
    
    app.route('/users/login/local')    //本地用户登录
        .post(passport.authenticate('local', {session: false}), users.login);

    app.route('/users/logout/local')    //本地用户登出
        .get(users.logout);

    app.route('/users/forgot/local')    //本地用户忘记密码
        .get(users.forgot);

};