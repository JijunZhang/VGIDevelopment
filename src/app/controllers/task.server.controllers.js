var Task = require('../models/task.server.model')
var User = require('../models/user.server.model')
    //处理mongoose错误
var getErrorMessage = require('../../utils/utils').getErrorMessage

//创建任务，有专业人士进行创建
exports.addTask = function(req, res) {
    //特定人士登录后才可发布任务
    //前台传入的字段要跟后台的字段匹配
    var task = new Task(req.body)

    //任务模型中关联任务创建者的信息
    task.taskCreator = req.user

    //由token值提取
    var userTask = req.user

    //将用户创建的任务索引放在用户的tasks此字段中
    //获取tasks字段添加任务索引之后的长度
    //在保存任务之前，先在用户中保存任务的索引，防止任务索引未在用户中保存，任务已经创建成功
    var taskPushlen = userTask.tasks.push(task)

    if (!(taskPushlen > userTask.tasks.length - 1)) {
        return res.json({
            status: {
                code: 400,
                message: '用户tasks字段中插入任务索引失败'
            }
        })
    } else {
        //在保存任务信息之前，保存用户关联的任务索引信息
        userTask.save(function(err) {
            if (err) {
                return res.json({
                    status: {
                        code: 400,
                        message: '用户关联自己创建的任务索引失败'
                    }
                })
            }
        })
    }
    //保存任务
    task.save(function(err) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '用户' + userTask.username + '创建任务失败'
                }
            })
        } else {
            //创建任务成功则返回刚才创建的任务信息，可根据需要提取字段
            res.json({
                status: {
                    code: 200,
                    message: '用户' + userTask.username + '创建任务成功'
                },
                //根据前台需要调整返回数据
                data: {
                    id: task['_id'],
                    introduction: task.introduction,
                    keyWord: task.keyWord
                }
            })
        }
    })
}

//列出所有任务，所有用户都可查看
exports.listTask = function(req, res) {
    //查找所有任务，
    //返回任务的简单描述，任务关键词，以及此任务的_id,任务创建者,根据需要返回字段信息
    //到时候根据需要可实现分页查询，利用skip，limit，where
    //关联创建者信息，只显示创建者用户名
    Task.find({}, { _id: 1, introduction: 1, keyWord: 1, taskCreator: 1 })
        .sort({ date_created: -1 })
        .populate({
            path: 'taskCreator',
            select: { _id: 0, username: 1 }
        })
        .exec(function(err, tasks) {
            if (err) {
                return res.json({
                    status: {
                        code: 400,
                        message: getErrorMessage(err)
                    }
                })
            } else {
                res.json({
                    status: {
                        code: 200,
                        message: '成功返回任务列表'
                    },
                    data: tasks
                })
            }
        })
}

//通过任务列表查看单个任务的详细信息
//此时返回此任务的所有信息，特别是任务状态，任务所需人数，
exports.listSingleTask = function(req, res) {
    if (!req.task) {
        return res.json({
            status: {
                code: 400,
                message: '赋值给req.task中的信息丢失'
            }
        })
    } else {
        //返回要查找的任务信息
        res.json({
            status: {
                code: 200,
                message: '成功找到对应的任务'
            },
            data: req.task
        })
    }
}

//任务创建者更新任务信息，还是将所有内容通过body进行请求
exports.updateTask = function(req, res) {
    var task = req.task

    //更新字段信息
    task.address = req.body.address
    task.coordinate = req.body.coordinate
    task.introduction = req.body.introduction
    task.details = req.body.details
    task.personNumMax = req.body.personNumMax || 3
    task.personNumMin = req.body.personNumMin || 1
    task.taskStatus = req.body.taskStatus || '未开始'
    task.keyWord = req.body.keyWord

    //将修改后的信息保存到数据库中
    task.save(function(err) {
        if (err) {
            return res.json({
                status: {
                    code: 200,
                    message: '任务更新失败'
                }
            })
        } else {
            //返回更新的地图标记
            res.json({
                status: {
                    code: 200,
                    message: '任务更新成功'
                },
                //根据前台需要返回更新数据
                data: {
                    id: task['_id'],
                    introduction: task.introduction,
                    keyWord: task.keyWord
                }
            })
        }
    })
}

//任务创建者可移除该任务
exports.removeTask = function(req, res) {
    var task = req.task
    var user = req.user

    //在用户的tasks字段中删除该任务的索引
    for (i = 0, n = user.tasks.length; i < n; i++) {
        if (task.id === user.tasks[i].toString()) {
            //找到后利用splice方法进行删除
            //splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目。
            var removeTaskId = user.tasks.splice(i, 1)
            break
        }
    }

    if (!removeTaskId) {
        return res.json({
            status: {
                code: 400,
                message: '用户tasks字段中删除任务索引失败'
            }
        })
    } else {
        //tasks字段中的任务索引删除后，保存用户信息
        user.save(function(err) {
            if (err) {
                return res.json({
                    status: {
                        code: 400,
                        message: 'tasks字段中的任务索引删除失败'
                    }
                })
            }
        })
    }

    //先进行再用户tasks字段中删除任务索引，再在task模型中删除任务信息
    //防止用户中任务索引没有被删除，而任务已被删除
    task.remove(function(err) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '任务删除失败'
                }
            })
        } else {
            // 返回删除的任务，可考虑不返回，看前台要求
            res.json({
                status: {
                    code: 200,
                    message: '任务删除成功'
                },
                data: task
            })
        }
    })
}

exports.taskById = function(req, res, next, id) {
    Task.findById(id).populate({
        path: 'taskCreator',
        select: { username: 1 }
    }).exec(function(err, task) {
        //任务没有找到时的处理方法
        if (err || !task) {
            return res.json({
                status: {
                    code: 400,
                    message: "没有找到所要查找的任务：" + id
                }
            })
        }
        // 将获取的对象传给请求对象，便于后续操作进行调用
        req.task = task
        next()
    })
}

exports.hasAuthorization = function(req, res, next) {
    if (req.task.taskCreator.id !== req.user.id) {
        return res.json({
            status: {
                code: 403,
                message: '用户不是该任务的创建者，不能修改或者删除该任务'
            }
        })
    }
    next()
}