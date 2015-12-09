var multiparty = require('multiparty');

//处理发送请求的参数
exports.reqConversion = function(req,res,next){
    //生成multiparty对象，并配置下载目标路径
    var form = new multiparty.Form({uploadDir: './public/files/'});
    //下载后处理
    form.parse(req, function(err, fields, files) {
        req.body = fields;
        next();
    });
}

exports.judgementIP = function(req,res,next){
    var userIp = req.connection.remoteAddress;
    if(userIp.indexOf('61.147.89.228') != -1){
        next();
    }else{
        var _err = {'issuccess':false,'data':'对不起，没有访问的权限'};
        res.send(_err);
    }
}