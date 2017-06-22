const router = require('express').Router()

router.use('/users', require('./users.server.routes'))
router.use('/users', require('./mapLabel.server.routes'))

module.exports = router