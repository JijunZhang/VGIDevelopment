var users = require('../../app/controllers/users.server.controller')
var mapLabels = require('../../app/controllers/mapLabel.server.controller')


module.exports = function(app) {

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization, token')
        next()
    })

    //创建地图标记       method:post
    //返回地图标记列表  method:get
    app.route('/mapLabels')
        .get(mapLabels.mapLabelList)
        .post(users.jwtAuth, users.requireAuth, mapLabels.mapLabelCreate)


}