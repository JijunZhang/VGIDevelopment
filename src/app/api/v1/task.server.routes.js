const router = require('express').Router()
const users = require('../../controllers/users.server.controller')
const tasks = require('../../controllers/task.server.controllers')



router.route('/task')
    //返回任务列表，method：get
    .get(tasks.listTask)
    //创建任务，只有特定的用户登录了才能创建任务
    .post(users.jwtAuth, users.requireAuth, tasks.addTask)


router.route('/task/:taskId')
    //用于请求单个任务信息
    .get(tasks.listSingleTask)
    //用于更新任务
    .put(users.jwtAuth, users.requireAuth, tasks.hasAuthorization, tasks.updateTask)
    //用于删除任务
    .delete(users.jwtAuth, users.requireAuth, tasks.hasAuthorization, tasks.removeTask)

//让包含taskId路由参数的请求经过特定的中间件处理
router.param('taskId', tasks.taskById)

module.exports = router