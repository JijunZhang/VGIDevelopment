const multer = require('multer')
const config = require('./config')
const fs = require('fs')

var storage = multer.diskStorage({
    //设置上传文件路径,以后可以扩展成上传至七牛,文件服务器等等
    //Note:如果你传递的是一个函数，你负责创建文件夹，如果你传递的是一个字符串，multer会自动创建
    destination: config.upload.path,

    filename: function(req, file, cb) {

        // 将保存文件名设置为 字段名 + 时间戳，比如 logo_1478521468943
        //file.originalname:*.jpg或者其他，此处用于提取后缀名
        var fileFormat = file.originalname.split('.')
        cb(null, file.fieldname + '_' + Date.now() + '.' + fileFormat[fileFormat.length - 1])

        //也可使用如下方式，但是后续要使用switch判断图片的后缀名
        //cb(null, file.fieldname + '_' + Date.now())
    }
})

//添加配置文件到muler对象。
var upload = multer({
    storage: storage

    //其他设置请参考multer的limits
    //limits:{}
})

module.exports = upload