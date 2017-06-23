var MapLabel = require('../models/maplabel.server.model')

// 处理mongoose错误
var getErrorMessage = function (err) {
  if (err.errors) {
        // 返回第一个有message属性的的错误message
        // 避免抛给用户一大堆错误
    for (var errName in err.errors) {
      if (err.errors[errName].message) return err.errors[errName].message
    }
  } else {
    return 'Unknow server error'
  }
}

// 创建地图标记
exports.mapLabelCreate = function (req, res) {
    // 前台提供body中的数据，
    // 包括中文地址address，geojson坐标，标注信息
  var mapLabel = new MapLabel(req.body)
        // 将经过passport身份验证的当前用户设置为此地图标记的创建者
  mapLabel.labelPerson = req.user
        // 保存新创建的地图标记
        // 出现错误则返回第一个有message属性的的错误message
        // 成功则将新创建的地图标记返回
  mapLabel.save(function (err) {
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
        data: mapLabel
      })
    }
  })
}

// 使用populate返回地图标记列表
exports.mapLabelList = function (req, res) {
    // 为0表示不填充，为1时表示填充。
  MapLabel.find().sort('-date_created').populate({ path: 'labelPerson', select: { token: 0, _id: 0 } })
    .exec(function (err, mapLabels) {
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
exports.mapLabelRead = function (req, res) {
  if (!req.mapLabel) {
    return res.json({
      status: {
        code: 400,
        message: '没有找到对应的地图标记' + req.params.mapLabelId
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
exports.mapLabelUpdate = function (req, res) {
  var mapLabel = req.mapLabel
        // 更新字段信息
  mapLabel.address = req.body.address
  mapLabel.coordinate = req.body.coordinate
  mapLabel.labelMessage = req.body.labelMessage

    // 将修改后的地图标记保存到数据库中
  mapLabel.save(function (err) {
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
exports.mapLabelDelete = function (req, res) {
  var mapLabel = req.mapLabel
  mapLabel.remove(function (err) {
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
exports.mapLabelByID = function (req, res, next, id) {
  MapLabel.findById(id).populate({ path: 'labelPerson', select: { token: 0 } })
    .exec(function (err, mapLabel) {
      if (err) return next(err)
            // 地图标记没找到时的处理方法
      if (!mapLabel) return next(new Error('没有找到所要查找的地图标记' + id))
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
exports.hasAuthorization = function (req, res, next) {
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
