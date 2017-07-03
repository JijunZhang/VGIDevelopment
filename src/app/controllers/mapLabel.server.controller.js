var MapLabel = require('../models/maplabel.server.model')
var User = require('../models/user.server.model')
var getErrorMessage = require('../../utils/utils').getErrorMessage

// 处理mongoose错误
// var getErrorMessage = function(err) {
//     if (err.errors) {
//         // 返回第一个有message属性的的错误message
//         // 避免抛给用户一大堆错误
//         for (var errName in err.errors) {
//             if (err.errors[errName].message) return err.errors[errName].message
//         }
//     } else {
//         return 'Unknow server error'
//     }
// }

// 创建地图标记
exports.addMapLabel = function(req, res) {
    // 前台提供body中的数据，
    // 包括中文地址address，geojson坐标，标注信息
    //console.log(req.body)

    var file = req.file
    var body = req.body
    console.log('文件类型：%s', file.mimetype)
    console.log('原始文件名：%s', file.originalname)
    console.log('文件大小：%s', file.size)
    console.log('=============')
    console.log('body:' + body)
    console.log('===========')
    var mapLabel = new MapLabel(req.body)

    // 将经过passport身份验证的当前用户设置为此地图标记的创建者
    mapLabel.labelPerson = req.user
        //用req.user创建用户，用于为用户添加新字段
        // var userMaplabel = new User(req.user)
    var userMaplabel = req.user

    //将地图标记的索引放在此字段中，使用数组栈方法push
    //push() 方法可向数组的末尾添加一个或多个元素，并返回新的长度。
    //虽然关联地图标记的索引没有保存在用户当中，但是user_mapLabel字段push之后长度已经发生变化
    //即pushNewLen===userMaplabel.user_mapLabel.length，故使用pushNewLen > userMaplabel.user_mapLabel.length - 1
    var pushNewLen = userMaplabel.user_mapLabel.push(mapLabel)
    if (!(pushNewLen > userMaplabel.user_mapLabel.length - 1)) {
        return res.json({
            status: {
                code: 400,
                message: '用户user_mapLabel字段中插入地图标记索引失败'
            }
        })
    } else {
        //在保存地图标记的信息之前，先保存用户信息
        userMaplabel.save(function(err) {
            if (err) {
                return res.json({
                    status: {
                        code: 400,
                        message: '在用户中关联地图标记的索引失败'
                    }
                })
            }
        })
    }
    // 在保存新创建的地图标记之前，先保存用户中关联地图标记索引的信息，如果失败，地图标记不会被创建
    // 出现错误则返回第一个有message属性的的错误message
    // 成功则将新创建的地图标记返回
    mapLabel.save(function(err) {
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
                    message: '成功创建地图标记'
                },
                data: {
                    id: mapLabel['_id'],
                    address: mapLabel.address,
                    labelMessage: mapLabel.labelMessage,
                    coordinate: mapLabel.coordinate
                }
            })
        }
    })
}

// 使用populate返回地图标记列表
//将所有的地图标记按照其_id进行排序
exports.listMapLabel = function(req, res) {
    // 为0表示不填充，为1时表示填充。
    MapLabel.find({}, { _id: 1, labelMessage: 1, labelPerson: 1 }).sort({ _id: -1 }).populate({
            path: 'labelPerson',
            select: { _id: 0, username: 1 }
        })
        .exec(function(err, mapLabels) {
            if (err) {
                return res.json({
                    status: {
                        code: 400,
                        message: getErrorMessage(err)
                    }
                })
            } else {
                // console.log('地图标记：' + mapLabels[0].labelPerson.username)
                res.json({
                    status: {
                        code: 200,
                        message: '成功返回地图标记列表'
                    },
                    data: mapLabels
                })
            }
        })
}

// 返回mapLabel对象，获取单一文档
// 利用mapLabelByID中间件
exports.listSingleMapLabel = function(req, res) {
    if (!req.mapLabel) {
        return res.json({
            status: {
                code: 400,
                message: '赋值给req.mapLabel中的信息丢失'
            }
        })
    } else {
        // 返回要查找的地图标记
        res.json({
            status: {
                code: 200,
                message: '成功找到对应的地图标记'
            },
            data: req.mapLabel
        })
    }
}

// 使用mapLabelUpdate方法修改已有文档
// 使用http请求主体中的address、coordinate、labelMessage字段来进行更新
// 利用mapLabelByID中间件
exports.updateMapLabel = function(req, res) {
    var mapLabel = req.mapLabel
        // 更新字段信息
    mapLabel.address = req.body.address
    mapLabel.coordinate = req.body.coordinate
    mapLabel.labelMessage = req.body.labelMessage

    // 将修改后的地图标记保存到数据库中
    mapLabel.save(function(err) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: getErrorMessage(err)
                }
            })
        } else {
            // 返回更新的地图标记
            res.json({
                status: {
                    code: 200,
                    message: '地图标记更新成功'
                },
                data: mapLabel
            })
        }
    })
}

/**
 * 删除地图标记，使用mapLabelByID中间件
 * 使用remove()方法从数据库中删除mapLabel对象
 */
exports.removeMapLabel = function(req, res) {
    var mapLabel = req.mapLabel
    var user = req.user

    //在用户的user_mapLabel字段中删除该地图标记的索引
    //user.user_mapLabel[i]类型为object
    //mapLabel.id 类型为string
    for (i = 0, n = user.user_mapLabel.length; i < n; i++) {
        if (mapLabel.id === user.user_mapLabel[i].toString()) {
            //splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目。   
            var removeMapLabelId = user.user_mapLabel.splice(i, 1)
            break
        }
    }
    if (!removeMapLabelId) {
        return res.json({
            status: {
                code: 400,
                message: '用户user_mapLabel字段中删除地图标记索引失败'
            }
        })
    } else {
        //user_mapLabel字段中的任务索引删除后，保存用户信息
        user.save(function(err) {
            if (err) {
                return res.json({
                    status: {
                        code: 400,
                        message: 'user_mapLabel字段中的地图标记索引删除失败'
                    }
                })
            }
        })
    }

    //先进行再用户user_maoLabel字段中删除地图标记索引，再在MapLabel模型中删除地图标记
    //防止用户中地图标记索引没有被删除，而地图标记已被删除
    mapLabel.remove(function(err) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: getErrorMessage(err)
                }
            })
        } else {
            // 返回删除的地图标记，可考虑不返回，看前台要求
            res.json({
                status: {
                    code: 200,
                    message: '地图标记删除成功'
                },
                data: mapLabel
            })
        }
    })
}

// 使用req.param()方法，让包含mapLabelId路由参数的请求经过特定的中间件处理
// 用于检索出一个已存在的单一文档
// 处理路由参数id的中间件
// 通过id在mongodb中检索出对应的mapLabel对象，并将其添加到请求对象中
// 所以，所以针对已有文档进行操作的控制器方法，就可以方便通过请求
// 对象获取MapLabel对象
exports.mapLabelByID = function(req, res, next, id) {
    //地图标记labelPerson字段中只显示username字段信息
    MapLabel.findById(id).populate({
            path: 'labelPerson',
            select: { username: 1 }
        })
        .exec(function(err, mapLabel) {
            // 地图标记没找到时的处理方法
            if (err || !mapLabel) {
                return res.json({
                    status: {
                        code: 400,
                        message: '没有找到所要查找的地图标记:' + id
                    }
                })
            }
            // 将获取的对象传给请求对象，便于后续操作进行调用
            req.mapLabel = mapLabel
            next()
        })
}

/**
 * 实现授权的中间件，update和delete方法都有使用限制，只有创建者可以调用
 * 利用mapLabelByID中间件
 * req.mapLabel和req.user来确定当前操作的用户是否为该地图标记的创建者
 */
exports.hasAuthorization = function(req, res, next) {
    //在进行mapLabelByID操作时，不要将_id设置为0.否则无法进行此操作
    if (req.mapLabel.labelPerson.id !== req.user.id) {
        return res.json({
            status: {
                code: 403,
                messsage: '用户不是该地图标记的创建者，不能修改或者删除该地图标记'
            }
        })
    }
    next()
}

//上传地图标记图片时，要考虑
//1、跟创建地图标记一起，同时上传图片，（没想到好的实现方法）
//2、创建完地图标记之后，再上传地图标记图片，使用中间件mapLabelByID
//3、支持同时上传多张图片，后台接收，后台传送给前台问题
exports.uploadMapImage = function(req, res) {
    //通过中间件mapLabelByID获取
    var mapLabel = req.mapLabel
    var file = req.file


}