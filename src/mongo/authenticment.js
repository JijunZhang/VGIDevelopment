/**
 * 用户认证机制
 * @author yellow
 */

var AuthenticationSchema = require('./tables/AuthenticationSchema.js');

var authenticment = {
    Auth: AuthenticationSchema,
}

var _inilization = function (conn) {
    for (var name in authenticment) {
        authenticment[name] = authenticment[name].InilizationModel && authenticment[name].InilizationModel(conn);
    }
    console.log('用户认证数据映射完成');
}

module.exports = {
    authenticment: authenticment,
    inilization: _inilization,
};