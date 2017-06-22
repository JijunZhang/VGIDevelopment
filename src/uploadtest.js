const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

var app = express()


//创建存储图片的文件夹
var createFolder = function(folder) {
    try {
        fs.accessSync(folder)
    } catch (e) {
        //fs.mkdirSync(folder)
        //创建多层文件夹
        mkdirsSync(folder)
    }
}

var now = new Date();
//上传文件配置
//var uploadFolder = './upload/' + 'image/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate()
var uploadFolder = './upload/' + 'avatars/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate()
    //创建保存路径
createFolder(uploadFolder)
    //配置文件名与保存路径
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadFolder)
    },
    filename: function(req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo_1478521468943
        //file.originalname:*.jpg或者其他，此处用于提取后缀名
        // var fileformat = file.originalname.split('.')
        // cb(null, file.fieldname + '_' + Date.now() + '.' + fileformat[fileformat.length - 1])
        cb(null, file.fieldname + '_' + Date.now())
    }
})
var upload = multer({ storage: storage })

app.post('/upload', upload.single('avatar'), function(req, res) {
    var file = req.file;
    var extName = '' //后缀名
        //判断上传文件的后缀名
    switch (file.mimetype) {
        case 'image/jpeg':
            extName = 'jpg'
            break
        case 'image/pjpeg':
            extName = 'jpg'
            break
        case 'image/png':
            extName = 'png'
            break
        case 'image/x-png':
            extName = 'png'
            break
    }
    if (extName.length === 0) {
        res.json({
            status: {
                code: 202,
                message: '只支持png和jpg格式图片'
            }
        })
        return
    } else {
        //上传头像加上后缀名
        var avatarName = file.filename + '.' + extName
        var avatarNewPath = file.destination + '/' + avatarName
            //该路径可保存在数据库的avatar字段中
            //file.destination:./upload/avatars/2017/5/21/avatar_1498051167715.jpg
            //此步骤去除‘./’
        var avatarUrl = avatarNewPath.replace(/^\.\//, '')

        //重命名上传的头像
        fs.renameSync(file.path, avatarNewPath)
        console.log('avatarUrl:' + avatarUrl)
            //console.log('file.path:' + file.path)
            //console.log('file.destination' + file.destination)
        res.json({
            status: {
                code: 200,
                message: '头像上传成功'
            }
        })
    }
})

app.post('/test', function(req, res) {
    console.log('just test')
    res.send('test')
})

app.listen(3000, function() {
    console.log('Server running at http://localhost:' + 3000 + '/')
})


//创建多层文件夹 同步
function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split('/').forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            } else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}