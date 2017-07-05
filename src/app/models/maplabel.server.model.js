var mongoose = require('mongoose')
var Schema = mongoose.Schema

var MapLabelSchema = new Schema({
    // 地图标记时间
    data_created: {
        type: Date,
        default: Date.now
    },
    // 地图标注中文地址说明
    address: {
        type: String
    },
    // 标注位置：经纬度信息，地理坐标模型（基于GeoJSON）
    coordinate: {
        type: {
            type: String,
            default: 'Point'
        },
        // 元素顺序为地理坐标经度、纬度
        coordinates: {
            type: [Number],
            index: { type: '2dsphere', sparse: true }
        }
    },
    // 标注信息，具体的标注内容
    labelMessage: {
        type: String,
        required: true,
        trim: true
    },
    //在进行地图标记时，用户可进行地图图片上传，提供图片信息
    //此字段存储地图图片的名称，支持多图上传，存储多张图片
    mapImage: [{
        type: String
    }],
    // 标注人 表明此地理位置由某人标注
    //一个 mapLabel--has one-->user
    labelPerson: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('MapLabel', MapLabelSchema)