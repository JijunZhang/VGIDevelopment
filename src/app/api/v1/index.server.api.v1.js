const router = require('express').Router()

router.use('/users', require('./users.server.routes'))

module.exports = router
