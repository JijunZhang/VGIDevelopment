var users = require('../../app/controllers/users.server.controller')
var mapLabels = require('../../app/controllers/mapLabel.server.controller')

module.exports = function(app) {
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization, token')
        next()
    })

    app.route('/mapLabels')
        // 返回地图标记列表  method:get
        .get(mapLabels.listMapLabel)
        // 创建地图标记，只有用户登陆了才能创建地图标记       method:post
        .post(users.jwtAuth, users.requireAuth, mapLabels.addMapLabel)

    app.route('/mapLabels/:mapLabelId')
        // 用于请求特定单个地图标记
        .get(mapLabels.listSingleMapLabel)
        // 用于更新并返回地图标记
        // users.jwtAuth, users.requireAuth认证用户是否登录
        // mapLabels.hasAuthorization认证用户是否为创建者
        .put(users.jwtAuth, users.requireAuth, mapLabels.hasAuthorization, mapLabels.updateMapLabel)
        // 用于删除并返回地图标记
        .delete(users.jwtAuth, users.requireAuth, mapLabels.hasAuthorization, mapLabels.removeMapLabel)

    // 让包含mapLabelId路由参数的请求经过特定的中间件处理
    // 查找出对应的mapLabel对象，并赋值给req.mapLabel
    app.param('mapLabelId', mapLabels.mapLabelByID)
}