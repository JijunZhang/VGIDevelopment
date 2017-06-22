const router = require('express').Router()
const users = require('../../controllers/users.server.controller')
const mapLabels = require('../../controllers/mapLabel.server.controller')

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization, token')
    next()
})

router.route('/mapLabels')
    .get(mapLabels.mapLabelList)
    .post(users.jwtAuth, users.requireAuth, mapLabels.mapLabelCreate)


module.exports = router