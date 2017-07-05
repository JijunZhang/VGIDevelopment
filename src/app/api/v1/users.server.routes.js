const router = require('express').Router()
const users = require('../../controllers/users.server.controller')
const upload = require('../../../config/uploadConfig')
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
router.route('/info/getSingleMaplabel/:mapLabelId')
    .post(users.jwtAuth, users.requireAuth, users.getSingleMapLabelFromAnyOne)


//更新用户信息，
router.route('/info/updateUserInfo')
    .post(users.jwtAuth, users.requireAuth, users.updateUserInfo)

//取出用户信息，剔除掉敏感字段
router.route('/info/getUserInfo')
    .post(users.jwtAuth, users.requireAuth, users.getUserInfo)

//上传头像，upload.single('avatar')，此处single引号内名称必须与表单上传的图片name属性的名称一致
//根据判断可进行修改头像操作
router.route('/upload/avatar')
    .post(users.jwtAuth, users.requireAuth, upload.single('avatar'), users.uploadAvatar)

router.route('/upload/updateAvatar')
    .post(users.jwtAuth, users.requireAuth, upload.single('avatar'), users.updateAvatar)

//获取头像
router.route('/upload/getAvatar/:avatarName')
    .post(users.jwtAuth, users.requireAuth, users.getAvatar)


module.exports = router