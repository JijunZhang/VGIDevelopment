var users = require('../controllers/users.server.controller')
var upload = require('../../config/uploadConfig')
var passport = require('passport')

module.exports = function(app) {
    app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization, token')
            next()
        })
        //  处理用户相关的路由请求
    app.route('/users/register') // 用户注册
        .post(users.register)

    app.route('/users/login/local') // 本地用户登录
        .post(passport.authenticate('local', { session: false }), users.login)

    // 本地用户登出
    // 首先使用token令牌取出用户信息
    app.route('/users/logout/local') // 本地用户登出
        .get(users.jwtAuth, users.requireAuth, users.logout)

    app.route('/users/forgot/local') // 本地用户忘记密码
        .post(users.forgot)

    app.route('/users/forgotandreset/local') // 本地用户忘记并重置密码
        .post(users.forgotAndReset)

    app.route('/users/reset/password') // 本地用户重置密码
        .post(users.jwtAuth, users.requireAuth, users.resetPassword)

    //获取该用户所做的所有地图标记
    app.route('/users/info/getAllMapLabels')
        .post(users.jwtAuth, users.requireAuth, users.getAllMapLabel)

    //获取某个用户的单个地图标记
    app.route('/info/getSingleMaplabel/:mapLabelId')
        .post(users.jwtAuth, users.requireAuth, users.getSingleMapLabelFromAnyOne)

    //更新用户信息，
    app.route('/info/updateUserInfo')
        .post(users.jwtAuth, users.requireAuth, users.updateUserInfo)

    //取出用户信息，剔除掉敏感字段
    app.route('/info/getUserInfo')
        .post(users.jwtAuth, users.requireAuth, users.getUserInfo)

    //上传头像，upload.single('avatar')，此处single引号内名称必须与表单上传的图片name属性的名称一致
    //根据判断可进行修改头像操作
    app.route('/upload/avatar')
        .post(users.jwtAuth, users.requireAuth, upload.single('avatar'), users.uploadAvatar)

    //获取头像
    app.route('/upload/getAvatar/:avatarName')
        .post(users.jwtAuth, users.requireAuth, users.getAvatar)
}