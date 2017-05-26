var usersSchema=require('./tables/MapLabelSchema');
var management = {
    MapLable: MapLabelSchema,
};
/**
 * 输出和数据库操作库
 */ 
var _inilization = function (conn) {
    for (var name in management) {
        management[name] = management[name].InilizationModel && management[name].InilizationModel(conn);
    }
    console.log('管理数据映射完成');
}

module.exports = {
    management:management,
    inilization:_inilization,
};
