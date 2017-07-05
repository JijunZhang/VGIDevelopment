function flash(info, error) {
    return {
        info: info,
        err: error
    }
}

// 处理mongoose错误
function getErrorMessage(err) {
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

module.exports.flash = flash
module.exports.getErrorMessage = getErrorMessage