var Alipay = require('../app/controller/alipay');
var Order = require('../app/controller/order');
var Factory = require('../app/controller/factory');
var Card = require('../app/controller/cardpay');
var Qiye = require('../app/controller/qiye');
var LTutil = require('../app/util/LT_util');
var SMSCore = require('../app/controller/smscore');
var User = require('../app/controller/user');
var YouMi = require('../app/controller/youmi');
var PreAuth = require('../app/controller/preAuth');
var AppUser = require('../app/controller/user_app');
var ImgFile = require('../app/controller/imgfile');

module.exports = function(app){

    
    //webservice 跨域请求
    app.get('/order/webcardRech',Card.webcardRech);
    //卡密兑换接口
    app.post('/order/cardRech', Card.cardRech);
    //查询用户卡密充值的记录
    app.post('/order/qryOrders', Card.qryUserCards);

    //用户预认证接口
    app.post('/user/preAuth',PreAuth.preAuth);
    // app.get('/user/preAuth',PreAuth.preAuth);
    //IOS预认证接口
    app.post('/user/IOSpreAuth',PreAuth.IOSpreAuth);
    // app.get('/user/IOSpreAuth',PreAuth.IOSpreAuth);
    //生成帐号
    app.post('/user/generate',User.generateUser);
    // app.get('/user/generate',User.generateUser);//根据imei生成上网帐号
    //38帐号注册接口
    app.post('/user/wifiUserRegist',User.wifiUserRegist);
    // app.get('/user/wifiUserRegist',User.wifiUserRegist);
    //38帐号修改密码
    app.post('/user/editWifiPassword',User.editWifiUserPassword);
    // app.get('/user/editWifiPassword',User.editWifiUserPassword);



    //生成alipay的订单
    app.post('/order/createOrder',Order.createOrder);
    //获取工厂套餐
    app.post('/order/findFacPlans', Factory.findFacPack);
    //查询系统公告或者工厂公告
    app.post('/getAnnouncement', Factory.announcement);
    // app.get('/getAnnouncement', Factory.announcement);
    //查询用户订单信息
    app.post('/order/finduserorder', Order.findAllOrder);
    // app.get('/order/finduserorder', Order.findAllOrder);
    //更新用户工厂信息接口
    app.post('/order/updAccountFac', Factory.updAccountFacId);


    //alipay支付回调
    app.post('/order/alipay_notify',Alipay.notify);
    // app.get('/order/alipay_notify',Order.notify);



    /*联通数据互通接口*/
    // app.post('/corp', LTutil.judgementIP, LTutil.reqConversion, Qiye.corp); 
    // app.post('/staf', LTutil.judgementIP, LTutil.reqConversion, Qiye.staff); 
    app.post('/corp', LTutil.reqConversion, Qiye.corp); 
    app.post('/staf', LTutil.reqConversion, Qiye.staff); 

    /*发送短信的接口*/
    app.get('/sendMessage', SMSCore.sendMsg);


    /*用户相关接口*/
    //用户签到
    app.post('/user/sign',AppUser.sign);
    // app.get('/user/sign',AppUser.sign);
    //查询用户积分
    app.post('/user/qryUserIntegra',AppUser.userIntegral);
    // app.get('/user/qryUserIntegra',AppUser.userIntegral);
    //查询用户签到历史记录
    app.post('/user/usersignhisory',AppUser.userSigns);
    // app.get('/user/usersignhisory',AppUser.userSigns);
    //查询积分规则积分
    app.post('/integral/qryIntegral',AppUser.qryIntegral);
    // app.get('/integral/qryIntegral',AppUser.qryIntegral);
    //查询用户在线信息的接口
    app.post('/user/qryUserAccessInfo',User.qryUserAccessInfo);
    // app.get('/user/qryUserAccessInfo',User.qryUserAccessInfo);
    //有米积分回调地址
    app.get('/user/youmi/notify', YouMi.youminotify);



    /*29APP用户相关接口*/
    //用户修改密码接口
    app.post('/user/editpwd',User.editUserPassword);
    //APP登录
    app.post('/user/applogin',AppUser.appLogin);
    //APP查询用户相关信息
    app.post('/user/qryUserInfo',AppUser.qryUserInfo);
    // app.get('/user/qryUserInfo',AppUser.qryUserInfo);
    //APP用户注册
    app.post('/user/appRegist',AppUser.registAppUser);
    // app.get('/user/appRegist',AppUser.registAppUser);
    //App更新用户
    app.post('/user/updUserInfo',AppUser.updUserInfo);
    // app.get('/user/updUserInfo',AppUser.updUserInfo);
    //查询广告位
    app.post('/qryAdvert',AppUser.qryAdvert);
    //app意见反馈
    app.post('/appFeedBack',AppUser.AppFeedback);
    //图片上传
    app.post('/user/imgUpload',ImgFile.imgUpload);



    // app.get('/',function(req,res){
    //     res.render('index',{title:'图片上传'});
    // });
}