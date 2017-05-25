/**
 *  md5加密功能，
 *  解决中文不一致问题。
 *  返回字母为大写
 */
var Buffer = require("buffer").Buffer;
var crypto = require("crypto");

function md5(data) {
    var buf = new Buffer(data);
    var str = buf.toString("binary");
    return crypto.createHash("md5").update(str).digest("hex").toLocaleUpperCase();
}

module.exports = md5;