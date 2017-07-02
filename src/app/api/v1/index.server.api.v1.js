const router = require('express').Router()

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization, x-access_token')
    next()
})

router.use('/users', require('./users.server.routes'))
router.use('/maps', require('./mapLabel.server.routes'))
router.use('/tasks', require('./task.server.routes'))

module.exports = router