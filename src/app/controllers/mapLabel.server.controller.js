var MapLabel = require('../models/maplabel.server.model')
var User = require('../models/user.server.model')
var getErrorMessage = require('../../utils/utils').getErrorMessage
var config = require('../../config/config')
var fs = require('fs')

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

    var files = req.files
    var body = req.body

    //从formdata的req.body中提取address，coordinate，labelMessage信息
    var mapLabel = new MapLabel()
    var coordinates = body.coordinates.split(',')

    // console.log('coordinates[0]:' + coordinates[0])
    // console.log('coordinates:' + typeof(coordinates))
    //如果body.type有传入，则使用；默认为Point
    var coordinate = {
            coordinates: coordinates,
            type: body.type ? body.type : 'Point'
        }
        // console.log('type:' + typeof(coordinate))
        // console.log('coordinate:' + coordinate)

    mapLabel.address = body.address
    mapLabel.coordinate = coordinate
    mapLabel.labelMessage = body.labelMessage

    //提取labelPerson信息
    // 将经过passport身份验证的当前用户设置为此地图标记的创建者
    mapLabel.labelPerson = req.user

    //提取上传的多张图片的名称信息
    if (files) {
        for (i = 0, n = files.length; i < n; i++) {
            var file = files[i]

            //使用push将图片的，名称放入mapImage字段中
            mapLabel.mapImage.push(file.filename)
        }
    } else {
        console.log('地图图片上传失败或者没有上传图片')

        //此处使用return，如果没有传入图片，地图标记将无法创建
        // return res.json({
        //     status: {
        //         code: 200,
        //         message: '地图图片上传失败或者没有上传图片'
        //     }
        // })
    }

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

//原始使用json格式传输数据的方法，没有传输图片
exports.addMapLabel1 = function(req, res) {
    // 前台提供body中的数据，
    // 包括中文地址address，geojson坐标，标注信息
    //console.log(req.body)


    var body = req.body

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
    var files = req.files
    var mapLabel = req.mapLabel

    //取出原有的地图图片的名称
    var oldMapImage = mapLabel.mapImage
        //console.log('oldMapImage[0]:' + oldMapImage[0])

    //原始图片存在，进行删除
    if (oldMapImage.length > 0) {

        //使用forEach可以避免文件删除错误
        oldMapImage.forEach(function(oldPath) {
            var oldMapImagePath = config.upload.path + '/' + oldPath
            oldMapImagePath = oldMapImagePath.replace(/\//g, '\\')

            //console.log('oldMapImagePath:' + oldMapImagePath)
            fs.exists(oldMapImagePath, function(existMapImage) {
                if (existMapImage) {
                    fs.unlink(oldMapImagePath, function(err) {
                        if (err) {
                            console.log('没有删除原始地图图片，修改地图图片失败')
                        }
                    })
                } else {
                    console.log('原始地图图片不存在')
                }
            })
        })
    }

    // 更新字段信息

    var coordinates = req.body.coordinates.split(',')
    var coordinate = {
        coordinates: coordinates,
        type: req.body.type ? body.type : 'Point'
    }
    mapLabel.coordinate = coordinate
    mapLabel.address = req.body.address
    mapLabel.labelMessage = req.body.labelMessage
        //console.log('labelMessage:' + req.body.labelMessage)

    //提取上传的多张图片的名称信息
    if (files) {
        //更新地图图片信息，要把原有地图图片名称删除，再向其内添加更新的图片信息
        mapLabel.mapImage = []
        for (j = 0, m = files.length; j < m; j++) {
            var file = files[j]

            //使用push将图片的，名称放入mapImage字段中
            mapLabel.mapImage.push(file.filename)
        }
    } else {
        //更新地图图片时，没有传入地图图片，则需要把原有地图图片名称删除
        //此处不能设置为null，或者‘’，否则后面无法进行push操作
        mapLabel.mapImage = []
    }

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

//没有更新图片的方法
exports.updateMapLabel1 = function(req, res) {

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

    //删除图片文件
    var oldMapImage = mapLabel.mapImage

    if (oldMapImage.length > 0) {
        oldMapImage.forEach(function(oldPath) {

            var oldMapImagePath = config.upload.path + '/' + oldPath
            oldMapImagePath = oldMapImagePath.replace(/\//g, '\\')

            //console.log('oldMapImagePath:' + oldMapImagePath)
            fs.exists(oldMapImagePath, function(existMapImage) {
                if (existMapImage) {
                    fs.unlink(oldMapImagePath, function(err) {
                        if (err) {
                            console.log('没有删除原始地图图片，修改地图图片失败')
                        }
                    })
                } else {
                    console.log('原始地图图片不存在')
                }
            })
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


//根据图片名称获取单张图片，在用户查找单个地图标记的信息时，调用此方法传输图片
//路由为/mapLabels/getMapImage/:mapImageId 把图像处理一下在传输
exports.getMapImage = function(req, res) {
    //获取所需图片的名称
    var mapImageId = req.params.mapImageId

    //将路径中的‘/’修改为‘\’
    var rootPath = config.upload.path.replace(/\//g, '\\')

    //此处可根据需要进行修改，设置根路径之类的参数
    var options = {
        root: rootPath,
        dotfile: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }

    //根据路径，传送地图图片文件给前台
    //获取图片，考虑是否先读取出图片，存为二进制或者什么形式，传给前台
    res.sendFile(mapImageId, options, function(err) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '传输图片失败'
                }
            })
        } else {
            console.log('请求的头像' + mapImageId + '传输成功')
        }
    })

}