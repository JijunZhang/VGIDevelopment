var mongoose = require('mongoose')
var Schema = mongoose.Schema

var TaskSchema = new Schema({
    //任务创建时间，创建时即显示为当前创建时间
    date_created: {
        type: Date,
        default: Date.now
    },
    //任务集合地点文字说明,必须
    address: {
        type: String,
        required: true
    },

    //创建任务时所在位置的经纬度,必须
    coordinate: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: { type: '2dsphere', sparse: true },
            required: true
        }
    },
    //任务的简要描述（必填）
    introduction: {
        type: String,
        required: true
    },

    //任务的详细描述
    details: {
        type: String,
        required: true
    },
    //任务所需最大人数
    personNumMax: {
        type: Number,
        default: 3
    },
    //任务所需最小人数
    personNumMin: {
        type: Number,
        default: 1
    },
    //任务状态，未开始，进行中，已完成，
    taskStatus: {
        type: String,
        default: '未开始'
    },
    //任务状态，暂时无用，任务分级时考虑此字段
    category: {
        type: String
    },
    //任务关键词
    keyWord: {
        type: String,
        required: true
    },
    //保存做此任务的用户索引，
    //便于通过任务查找做任务的用户
    //一个任务对应于多个用户，使用[]
    //一个 task--has many-->user
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    //关联任务创建者信息
    taskCreator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

})

module.exports = mongoose.model('Task', TaskSchema)