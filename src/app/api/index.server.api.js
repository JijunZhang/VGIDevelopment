const router = require('express').Router()

router.use('/v1', require('./v1/index.server.api.v1'))

module.exports = router
