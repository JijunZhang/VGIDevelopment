var mongoose = require('mongoose')
var Maplabel = mongoose.model('MapLabel')


//处理mongoose错误
var getErrorMessage = function(err) {
    if (err.errors) {
        //返回第一个有message属性的的错误message
        //避免抛给用户一大堆错误
        for (var errName in err.errors) {
            if (err.errors[errName].message) return err.errors[errName].message;
        }
    } else {
        return 'Unknow server error';
    }
};

//创建地图标记
exports.mapLabelCreate = function(req, res) {
    //前台提供body中的数据，
    //包括中文地址address，geojson坐标，标注信息
    var mapLabel = new Maplabel(req.body)
        //将经过passport身份验证的当前用户设置为此地图标记的创建者
    mapLabel.labelPerson = req.user
        //保存新创建的地图标记
        //出现错误则返回第一个有message属性的的错误message
        //成功则将新创建的地图标记返回
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
                data: mapLabel
            })
        }
    })
}

//使用populate返回地图标记列表
exports.mapLabelList = function(req, res) {
    MapLabel.find().sort('-date_created').populate('labelPerson', 'username').
    exec(function(err, mapLabels) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: getErrorMessage(err)
                }
            })
        } else {
            console.log('地图标记：' + mapLabels[0])
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