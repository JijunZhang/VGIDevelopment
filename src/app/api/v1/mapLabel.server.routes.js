const router = require('express').Router()
const users = require('../../controllers/users.server.controller')
const mapLabels = require('../../controllers/mapLabel.server.controller')

router.route('/mapLabels')
    .get(mapLabels.mapLabelList)
    .post(users.jwtAuth, users.requireAuth, mapLabels.mapLabelCreate)

router.route('/mapLabels/:mapLabelId')
    // 用于请求特定单个地图标记
    .get(mapLabels.mapLabelRead)
    // 用于更新并返回地图标记
    // users.jwtAuth, users.requireAuth认证用户是否登录
    // mapLabels.hasAuthorization认证用户是否为创建者
    .put(users.jwtAuth, users.requireAuth, mapLabels.hasAuthorization, mapLabels.mapLabelUpdate)
    // 用于删除并返回地图标记
    .delete(users.jwtAuth, users.requireAuth, mapLabels.hasAuthorization, mapLabels.mapLabelDelete)

// 让包含mapLabelId路由参数的请求经过特定的中间件处理
// 查找出对应的mapLabel对象，并赋值给req.mapLabel
router.param('mapLabelId', mapLabels.mapLabelByID)

module.exports = router
