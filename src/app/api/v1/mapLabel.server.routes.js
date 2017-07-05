const router = require('express').Router()
const users = require('../../controllers/users.server.controller')
const mapLabels = require('../../controllers/mapLabel.server.controller')
const upload = require('../../../config/uploadConfig')

router.route('/mapLabels')
    //创建地图标记，支持多张图片的上传
    .post(users.jwtAuth, users.requireAuth, upload.array('mapImage'), mapLabels.addMapLabel)
    //列出所有地图标记
    .get(mapLabels.listMapLabel)

//不支持上传图片，使用json传输
router.route('/mapLabels1')
    .post(users.jwtAuth, users.requireAuth, mapLabels.addMapLabel1)

router.route('/mapLabels/:mapLabelId')
    // 用于更新并返回地图标记
    // users.jwtAuth, users.requireAuth认证用户是否登录
    // mapLabels.hasAuthorization认证用户是否为创建者
    //支持多张图片更新
    .put(users.jwtAuth, users.requireAuth, mapLabels.hasAuthorization, upload.array('mapImage'), mapLabels.updateMapLabel)
    // 用于请求特定单个地图标记
    .get(mapLabels.listSingleMapLabel)
    // 用于删除并返回地图标记
    .delete(users.jwtAuth, users.requireAuth, mapLabels.hasAuthorization, mapLabels.removeMapLabel)

// 让包含mapLabelId路由参数的请求经过特定的中间件处理
// 查找出对应的mapLabel对象，并赋值给req.mapLabel
router.param('mapLabelId', mapLabels.mapLabelByID)


//获取地图图片
router.route('/mapLabels/getMapImage/:mapImageId')
    .post(users.jwtAuth, users.requireAuth, mapLabels.getMapImage)

module.exports = router