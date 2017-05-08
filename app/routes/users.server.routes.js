var users = require('../../app/controllers/users.server.controller');
var passport = require('passport');

module.exports = function(app) {
    app.route('/users')
        .post(users.create)
        .get(users.list);

    app.route('/users/:userId')
        .get(users.read)
        .put(users.update)
        .delete(users.delete);

    app.param('userId', users.userByID);

    //  处理用户相关的路由请求
    app.route('/users/register')    //用户注册
        .post(users.register);
    
    app.route('/users/login')
        .post(passport.authenticate('local', {
            failureFlash: true
        }));

};