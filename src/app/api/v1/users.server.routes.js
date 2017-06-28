const router = require('express').Router()
const users = require('../../controllers/users.server.controller')
const passport = require('passport')

//  处理用户相关的路由请求
router.route('/register') // 用户注册
    .post(users.register)

router.route('/login/local') // 本地用户登录
    .post(passport.authenticate('local', { session: false }), users.login)

// 本地用户登出
// 首先使用token令牌取出用户信息
router.route('/logout/local') // 本地用户登出
    .post(users.jwtAuth, users.requireAuth, users.logout)

router.route('/forgot/local') // 本地用户忘记密码
    .post(users.forgot)

router.route('/forgotandreset/local') // 本地用户忘记并重置密码
    .post(users.forgotAndReset)

router.route('/reset/password') // 本地用户重置密码
    .post(users.jwtAuth, users.requireAuth, users.resetPassword)

//获取该用户所做的所有地图标记
router.route('/info/getAllMapLabels')
    .post(users.jwtAuth, users.requireAuth, users.getAllMapLabel)

//获取某个用户的单个地图标记
router.route('/info/getSingleMaplabel/:username/:mapLabelId')
    .post(users.jwtAuth, users.requireAuth, users.getSingleMapLabel)

module.exports = router