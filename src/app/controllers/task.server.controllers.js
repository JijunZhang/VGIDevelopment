var Task = require('../models/task.server.model')
var User = require('../models/user.server.model')
    //处理mongoose错误
var getErrorMessage = require('../../utils/utils').getErrorMessage

//创建任务，有专业人士进行创建
exports.addTask = function(req, res) {
    //由token值提取
    var user = req.user

    //特定人士登录后才可发布任务
    //前台传入的字段要跟后台的字段匹配
    var task = new Task(req.body)

    //保存任务
    task.save(function(err) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '用户' + user.username + '创建任务失败'
                }
            })
        } else {
            //创建任务成功则返回刚才创建的任务信息，可根据需要提取字段
            res.json({
                status: {
                    code: 200,
                    message: '用户' + user.username + '创建任务成功'
                },
                data: task
            })
        }
    })
}

//列出所有任务，所有用户都可查看
exports.listTask = function(req, res) {
    //查找所有任务，
    //返回任务的简单描述，任务关键词，以及此任务的_id
    Task.find({}, { _id: 1, introduction: 1, keyword: 1 })
        .sort({ _id: -1 })
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

}

exports.updateTask = function(req, res) {

}

//任务创建者可移除该任务
exports.removeTask = function(req, res) {

}