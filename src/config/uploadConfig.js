const multer = require('multer')
const fs = require('fs')

//上传文件配置
exports.uploadConfig = function() {
    var uploadFolder = './upload/image/'
        //创建保存路径
    createFolder(uploadFolder)
        //配置文件名与保存路径
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, uploadFolder)
        },
        filename: function(req, file, cb) {
            cb(null, file.filename + '_' + Date.now())
        }
    })
    var upload = multer({ storage: storage })
    return upload
}


//创建存储图片的文件夹
var createFolder = function(folder) {
    try {
        fs.accessSync(folder)
    } catch (e) {
        fs.mkdirSync(folder)
    }
}