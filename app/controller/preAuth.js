var soap = require('soap');
var settings = require('../../settings');
var Time = require('./time');
var async = require('async');
var AUTH = require('../util/auth');


exports.preAuth = function(req,res){
	var startD = new Date();
	console.log('进来了');
	// var data = req.body;
	var data = req.query;
	console.log(data);
	try{
		var user = data.user;
		var mac = data.mac;
		var imei = data.imei;
		var ssid = data.ssid;
		var wifiMac = data.wifiMac;
		var device = data.device;
		if(!mac || mac == ''){
			return res.json({resultCode:'1',info:'mac地址不能为空'});
		}		
		if(!wifiMac || wifiMac == ''){
			return res.json({resultCode:'1',info:'wifimac地址不能为空'});
		}
		if(!ssid || ssid == ''){
			return res.json({resultCode:'1',info:'热点名称不能为空'});
		}
		if(!device || device == ''){
			return res.json({resultCode:'1',info:'使用设备不能为空'});
		}
		mac = mac.toLowerCase();
		var resultUser = {};
		var resUser = {};
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
    			console.log('*****************远程连接失败*****************');
    			return res.json({resultCode:'1',info:'连接远程服务器失败,请稍候重试'});
			}
			async.auto({
				user:function(callback){
					if(imei && imei != ''){
						qryUserData = {};
						qryUserData.imei = imei;
						qryUserData.client = client;
						AUTH.qryUser(qryUserData,function(err,data){
							if(err){
								return res.json({resultCode:'1',info:'查询用户失败，请稍后重试'});
							}
							if(data == null){//如果用户为空
								return res.json({resultCode:'2',info:'对不起，该imei号尚未注册用户'});
							}else{
								callback(null,data);
							}
						});
					}else if(user && user != '' && !imei && imei == ''){
						qryUserData = {};
						qryUserData.user = user;
						qryUserData.client = client;
						AUTH.qryUser(qryUserData,function(err,data){
							if(err){
								return res.json({resultCode:'1',info:'查询用户失败，请稍后重试'});
							}
							if(data == null){//如果用户为空
								return res.json({resultCode:'11',info:'对不起，该用户不存在'});
							}else{
								callback(null,data);
							}
						});
					}else{
						res.json({resultCode:'3',info:'imei和帐号不能同时为空'});
					}
				},
				userMac:['user',function(callback,results){//判断用户mac
					var userInfo = results.user;
					if(userInfo.new_man_opinion == 'True'){//mac地址判断
						if(device == 'pad'){//判断设备
							var padMac = userInfo.new_ipad_mac;
							if(padMac == null || padMac == '' || padMac.toLowerCase() == mac){
								callback(null,true);
							}else{
								res.json({resultCode:'5',info:'对不起,已有其他设备绑定SIM卡，如继续使用，请继续插入原SIM卡'});
							}	
						}else{
							var phoneMac = userInfo.new_mac;
							if(phoneMac == null || phoneMac == '' || phoneMac.toLowerCase() == mac){
								callback(null,true);
							}else{
								if(imei && imei != ''){//如果是手机，并且存在imei卡
									var updUserData = {};
									updUserData.new_jifei_customerid = userInfo.new_jifei_customerid;
									updUserData.phone_mac = mac;
									updUserData.client = client;
									AUTH.updUser(updUserData,function(err,data){
										if(err){
											return res.json({resultCode:'1',info:'更新用户mac地址失败，请稍后重试'});
										}
										if(data != null){
											callback(null,true);
										}else{
											return res.json({resultCode:'1',info:'更新用户mac地址失败，请稍后重试'});
										}
									});
								}else{
									res.json({resultCode:'5',info:'对不起,已有其他设备绑定SIM卡，如继续使用，请继续插入原SIM卡'});
								}
							}
						}
					}else{
						callback(null,true);
					}
				}],
				qryBlacklist:['user','userMac',function(callback,results){//查询黑名单
					var userInfo = results.user;
					var BlacklistData = {};
					BlacklistData.user = userInfo.new_useraccount;
					BlacklistData.client = client;
					AUTH.qryBlacklist(BlacklistData,function(err,flag){
						if(flag){
							callback(null,true);
						}else{
							res.json({resultCode:'6',info:'用户在黑名单，不能上网'});
						}
					});
				}],
				qryfactory:['user','userMac','qryBlacklist',function(callback,result){
					var userInfo = result.user;
					if(userInfo.new_jifei_factoryid == null || userInfo.new_jifei_factoryid == ''){//判断用户工厂为空
						var qryFacData = {};
						qryFacData.ssid = ssid;
						qryFacData.client = client;
						AUTH.qryFactory(qryFacData,function(err,fac){
							if(err){
								return res.json({resultCode:'1',info:'查询工厂失败,请稍候重试'});
							}
							if(fac == null){
								return res.json({resultCode:'7',info:'热点对应的工厂不存在,请稍候客服'});
							}else{
								//更新用户工厂信息
								var updUserData = {}; 
								updUserData.client = client;
								updUserData.new_jifei_customerid = userInfo.new_jifei_customerid;
								updUserData.new_jifei_factoryid = fac.new_jifei_factoryid;
								AUTH.updUser(updUserData,function(err,updResult){
									if(err){
										return res.json({resultCode:'1',info:'更新用户工厂失败,请稍候重试'});
									}
									if(updResult == null){
										res.json({resultCode:'1',info:'更新用户工厂失败,请稍候重试'});
									}else{  
										callback(null,fac);
									}
								});
							}
						});
					}else{
						//如果用户和用户工厂不为空
						var qryFacData = {};
						qryFacData.factoryid = userInfo.new_jifei_factoryid;
						qryFacData.client = client;
						AUTH.qryFactory(qryFacData,function(err,facInfo){
							if(err){
								return res.json({resultCode:'1',info:'查询工厂信息失败,请稍候重试'});
							}
							if(facInfo != null){
								callback(null,facInfo);
							}else{
								res.json({resultCode:'1',info:'查询工厂信息失败,请稍候重试'});
							}
						});
					}
				}],
				qryDomain:['user','userMac','qryBlacklist','qryfactory',function(callback,results){
					//判断用户域
					var userInfo = results.user;
					var factoryInfo = results.qryfactory;
					resUser.account = userInfo.new_useraccount;
					resUser.password = userInfo.new_userPssword;
					resUser.facId = factoryInfo.new_jifei_factoryid;
					resUser.userId = userInfo.new_jifei_customerid;
					if(userInfo.new_region_opinion != null && userInfo.new_region_opinion == 'True'){
						var qryDomainData = {};
						qryDomainData.client = client;
						qryDomainData.ssid = ssid;
						AUTH.qryDomain(qryDomainData,function(err,domainInfo){
							if(err){
								return res.json({resultCode:'1',info:'查询域名失败,请稍候重试'});
							}
							if(domainInfo != null && domainInfo != ''){
								//判断帐号是否为联通
								if(userInfo.new_recordtype != 'False'){
									if(domainInfo.new_doman == 'CZXSJ'){
										res.json({resultCode:'0',info:'预认证成功',data:resUser});
									}else{
										res.json({resultCode:'0',info:'预认证成功',data:resUser});
									}
								}else{
									if(domainInfo.new_doman != null && userInfo.new_man_opinion != null && factoryInfo.new_jifei_factiondomain == domainInfo.new_doman){
										callback(null,true);
									}else{
										res.json({resultCode:'8',info:'不能跨域使用，请联系客服'});
									}
								}
							}else{
								return res.json({resultCode:'9',info:'ap热点的域不存在,请联系客服'});
							}
						});
					}else{
						callback(null,true);
					}
				}],
				order:['user','userMac','qryBlacklist','qryfactory','qryDomain',function(callback,results){
					var userInfo = results.user;
					var facInfo = results.qryfactory;
					var userId = userInfo.new_jifei_customerid;
					var orderData = {};
					orderData.userId = userId;
					orderData.client = client;
					AUTH.qryOrder(orderData,function(err,orderInfo){
						if(err){
							return res.json({resultCode:'1',info:'查询订单失败,请稍候重试'});
						}
						if(orderInfo != null && orderInfo != ''){
							//判断订单是否可用
							// var startDate = Time.format(new Date(orderInfo.new_jifei_begintime),'yyyy-MM-dd');
							var startTime = new Date(orderInfo.new_jifei_begintime).getTime();
							// var stopDate = Time.format(new Date(orderInfo.new_jifei_endtime),'yyyy-MM-dd')+' 23:59:59';
							var stopTime = new Date(orderInfo.new_jifei_endtime).getTime();
							var nowTime = new Date().getTime();
							console.log(startTime+"：开始时间");
							console.log(stopTime+":结束时间");
							console.log(nowTime+":当前时间");
							if(nowTime>startTime && nowTime<stopTime){//判断用户订单是否开始启用并且订单是否过期
								callback(null,true);
							}else{
								callback(null,false);
							}
						}else{
							callback(null,false);
						}
					});
				}]
			},function(err,results){
				if(err){
					return res.json({resultCode:'1',info:'查询失败,请稍候重试'});
				}
				var facInfo = results.qryfactory;
				var orderFlag = results.order;
				var userInfo = results.user;
				console.log(facInfo);
				console.log(userInfo);
				console.log(orderFlag);
				
				if(orderFlag){
					res.json({resultCode:'0',info:'预认证成功',data:resUser});
				}else{
					if(userInfo.new_type != '1'){//判断不是体验用户
						res.json({resultCode:'12',info:'订单已经失效',data:resUser});
					}else{
						var userId = userInfo.new_jifei_customerid;
						//如果订单不通过,查询工厂，判断工厂免费上网时长
						var now = Time.format(new Date(),'yyyy-MM-dd');
						var facStartDate1 = new Date(facInfo.new_strdate);
						var facStartDate4 = new Date(Date.UTC(facStartDate1.getFullYear(),facStartDate1.getMonth(),facStartDate1.getDate(),facStartDate1.getHours(),facStartDate1.getMinutes(), facStartDate1.getSeconds()));
						var facStartDate2 = Time.format(facStartDate4,'yyyy-MM-dd');
						var facStartDate3 = now+" "+Time.format(facStartDate4,'HH:mm:ss');
						var facStartTime1 = new Date(facStartDate2).getTime();
						var facStartTime2 = new Date(facStartDate3).getTime();
						console.log(facStartTime2);
						var facStopDate1 = new Date(facInfo.new_enddate);
						var facStopDate4 = new Date(Date.UTC(facStopDate1.getFullYear(),facStopDate1.getMonth(),facStopDate1.getDate(),facStopDate1.getHours(),facStopDate1.getMinutes(), facStopDate1.getSeconds()));
						var facStopDate2 = Time.format(facStopDate4,'yyyy-MM-dd');
						var facStopDate3 = now+' '+Time.format(facStopDate4,'HH:mm:ss');
						var facStopTime1 = new Date(facStopDate1).getTime();
						var facStopTime2 = new Date(facStopDate2).getTime();
						console.log(facStopDate3);
						var nowTime1 = new Date(Time.format(new Date(),'yyyy-MM-dd')).getTime();
						var nowTime2 = new Date().getTime();
						console.log(nowTime2);
						if(nowTime1 > facStartTime1 && 
							nowTime2 > facStartTime2 && 
							nowTime1 < facStopTime1 &&
							nowTime2 < facStopTime2){
							var historyData = {};
							historyData.client = client;
							historyData.userId = userId;
							AUTH.qryDuration(historyData,function(err,time){
								if(err){
									return res.json({resultCode:'1',info:'预认证失败，请稍后重试'});
								}
								if(time <= 60*60){
									console.log('***************已经开始返回结果**********************');
									res.json({resultCode:'10',info:'用户可以免费上网',data:resUser});
								}else{
									res.json({resultCode:'14',info:'用户当天已经免费上网超过一小时',data:resUser});
								}
							});
						}else{
							res.json({resultCode:'13',info:'不在工厂的免费体验时间段之内',data:resUser});
						}
					}
				}
				var endD = new Date();
				console.log("总耗时"+(endD.getTime()-startD.getTime()));
			})
		});
	}catch(e){
		console.log(e);
		console.log('********************处理参数异常*******************88');
		res.json({resultCode:'1',info:'服务器忙，请重试'});
	}
}

//IOS预认证接口
exports.IOSpreAuth = function(req,res){
	console.log('进来了');
	var data = req.body;
	// var data = req.query;
	console.log(data);
	try{
		var user = data.user;
		var password = data.password;
		var ssid = data.ssid;
		var wifiMac = data.wifiMac;
		var device = data.device;
		if(!user || user == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}
		if(!password || password == ''){
			return res.json({resultCode:'1',info:'密码不能为空'});
		}
		if(!wifiMac || wifiMac == ''){
			return res.json({resultCode:'1',info:'wifimac地址不能为空'});
		}
		if(!ssid || ssid == ''){
			return res.json({resultCode:'1',info:'热点名称不能为空'});
		}
		if(!device || device == ''){
			return res.json({resultCode:'1',info:'使用设备不能为空'});
		}
		var resultUser = {};
		var resUser = {};
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
    			console.log('*****************远程连接失败*****************');
    			return res.json({resultCode:'1',info:'连接远程服务器失败,请稍候重试'});
			}
			async.auto({
				user:function(callback){//查询用户
					qryUserData = {};
					qryUserData.user = user;
					qryUserData.client = client;
					AUTH.qryUser(qryUserData,function(err,data){
						if(err){
							return res.json({resultCode:'1',info:'查询用户失败，请稍后重试'});
						}
						if(data == null){//如果用户为空
							return res.json({resultCode:'2',info:'对不起，该用户不存在'});
						}else{
							if(data.new_userPssword != password){
								return  res.json({resultCode:'3',info:'对不起，密码不正确'});
							}else{
								callback(null,data);
							}
						}
					});
				},
				qryBlacklist:['user',function(callback,results){//查询黑名单
					var userInfo = results.user;
					var BlacklistData = {};
					BlacklistData.user = userInfo.new_useraccount;
					BlacklistData.client = client;
					AUTH.qryBlacklist(BlacklistData,function(err,flag){
						if(flag){
							callback(null,true);
						}else{
							res.json({resultCode:'4',info:'用户在黑名单，不能上网'});
						}
					});
				}],
				qryfactory:['user','qryBlacklist',function(callback,result){//查询工厂
					var userInfo = result.user;
					if(userInfo.new_jifei_factoryid == null || userInfo.new_jifei_factoryid == ''){//判断用户工厂为空
						var qryFacData = {};
						qryFacData.ssid = ssid;
						qryFacData.client = client;
						AUTH.qryFactory(qryFacData,function(err,fac){
							if(err){
								return res.json({resultCode:'1',info:'查询工厂失败,请稍候重试'});
							}
							if(fac == null){
								return res.json({resultCode:'5',info:'热点对应的工厂不存在,请稍候客服'});
							}else{
								//更新用户工厂信息
								var updUserData = {}; 
								updUserData.client = client;
								updUserData.new_jifei_customerid = userInfo.new_jifei_customerid;
								updUserData.new_jifei_factoryid = fac.new_jifei_factoryid;
								AUTH.updUser(updUserData,function(err,updResult){
									if(err){
										return res.json({resultCode:'1',info:'更新用户工厂失败,请稍候重试'});
									}
									if(updResult == null){
										res.json({resultCode:'1',info:'更新用户工厂失败,请稍候重试'});
									}else{  
										callback(null,fac);
									}
								});
							}
						});
					}else{
						//如果用户和用户工厂不为空
						var qryFacData = {};
						qryFacData.factoryid = userInfo.new_jifei_factoryid;
						qryFacData.client = client;
						AUTH.qryFactory(qryFacData,function(err,facInfo){
							if(err){
								return res.json({resultCode:'1',info:'查询工厂信息失败,请稍候重试'});
							}
							if(facInfo != null){
								callback(null,facInfo);
							}else{
								res.json({resultCode:'1',info:'查询工厂信息失败,请稍候重试'});
							}
						});
					}
				}],
				qryDomain:['user','qryBlacklist','qryfactory',function(callback,results){
					//判断用户域
					var userInfo = results.user;
					var factoryInfo = results.qryfactory;
					resUser.account = userInfo.new_useraccount;
					resUser.password = userInfo.new_userPssword;
					resUser.facId = factoryInfo.new_jifei_factoryid;
					resUser.userId = userInfo.new_jifei_customerid;
					if(userInfo.new_region_opinion != null && userInfo.new_region_opinion == 'True'){
						var qryDomainData = {};
						qryDomainData.client = client;
						qryDomainData.ssid = ssid;
						AUTH.qryDomain(qryDomainData,function(err,domainInfo){
							if(err){
								return res.json({resultCode:'1',info:'查询域名失败,请稍候重试'});
							}
							if(domainInfo != null && domainInfo != ''){
								//判断帐号是否为联通
								if(userInfo.new_recordtype != 'False'){
									if(domainInfo.new_doman == 'CZXSJ'){
										res.json({resultCode:'0',info:'预认证成功',data:resUser});
									}else{
										res.json({resultCode:'0',info:'预认证成功',data:resUser});
									}
								}else{
									if(domainInfo.new_doman != null && userInfo.new_man_opinion != null && factoryInfo.new_jifei_factiondomain == domainInfo.new_doman){
										callback(null,true);
									}else{
										res.json({resultCode:'7',info:'不能跨域使用，请联系客服'});
									}
								}
							}else{
								return res.json({resultCode:'6',info:'ap热点的域不存在,请联系客服'});
							}
						});
					}else{
						callback(null,true);
					}
				}],
				order:['user','qryBlacklist','qryfactory','qryDomain',function(callback,results){
					var userInfo = results.user;
					var facInfo = results.qryfactory;
					var userId = userInfo.new_jifei_customerid;
					var orderData = {};
					orderData.userId = userId;
					orderData.client = client;
					AUTH.qryOrder(orderData,function(err,orderInfo){
						if(err){
							return res.json({resultCode:'1',info:'查询订单失败,请稍候重试'});
						}
						if(orderInfo != null && orderInfo != ''){
							//判断订单是否可用
							// var startDate = Time.format(new Date(orderInfo.new_jifei_begintime),'yyyy-MM-dd');
							var startTime = new Date(orderInfo.new_jifei_begintime).getTime();
							// var stopDate = Time.format(new Date(orderInfo.new_jifei_endtime),'yyyy-MM-dd')+' 23:59:59';
							var stopTime = new Date(orderInfo.new_jifei_endtime).getTime();
							var nowTime = new Date().getTime();
							console.log(startTime+"：开始时间");
							console.log(stopTime+":结束时间");
							console.log(nowTime+":当前时间");
							if(nowTime>startTime && nowTime<stopTime){//判断用户订单是否开始启用并且订单是否过期
								callback(null,true);
							}else{
								callback(null,false);
							}
						}else{
							callback(null,false);
						}
					});
				}]
			},function(err,results){
				if(err){
					return res.json({resultCode:'1',info:'查询失败,请稍候重试'});
				}
				var facInfo = results.qryfactory;
				var orderFlag = results.order;
				var userInfo = results.user;
				console.log(facInfo);
				console.log(userInfo);
				console.log(orderFlag);
				
				if(orderFlag){
					res.json({resultCode:'0',info:'预认证成功',data:resUser});
				}else{
					if(userInfo.new_type != '1'){//判断不是体验用户
						res.json({resultCode:'8',info:'订单已经失效'});
					}else{
						var userId = userInfo.new_jifei_customerid;
						//如果订单不通过,查询工厂，判断工厂免费上网时长
						var now = Time.format(new Date(),'yyyy-MM-dd');
						var facStartDate1 = new Date(facInfo.new_strdate);
						var facStartDate4 = new Date(Date.UTC(facStartDate1.getFullYear(),facStartDate1.getMonth(),facStartDate1.getDate(),facStartDate1.getHours(),facStartDate1.getMinutes(), facStartDate1.getSeconds()));
						var facStartDate2 = Time.format(facStartDate4,'yyyy-MM-dd');
						var facStartDate3 = now+" "+Time.format(facStartDate4,'HH:mm:ss');
						var facStartTime1 = new Date(facStartDate2).getTime();
						var facStartTime2 = new Date(facStartDate3).getTime();
						console.log(facStartTime2);
						var facStopDate1 = new Date(facInfo.new_enddate);
						var facStopDate4 = new Date(Date.UTC(facStopDate1.getFullYear(),facStopDate1.getMonth(),facStopDate1.getDate(),facStopDate1.getHours(),facStopDate1.getMinutes(), facStopDate1.getSeconds()));
						var facStopDate2 = Time.format(facStopDate4,'yyyy-MM-dd');
						var facStopDate3 = now+' '+Time.format(facStopDate4,'HH:mm:ss');
						var facStopTime1 = new Date(facStopDate1).getTime();
						var facStopTime2 = new Date(facStopDate2).getTime();
						console.log(facStopDate3);
						var nowTime1 = new Date(Time.format(new Date(),'yyyy-MM-dd')).getTime();
						var nowTime2 = new Date().getTime();
						console.log(nowTime2);
						if(nowTime1 > facStartTime1 && 
							nowTime2 > facStartTime2 && 
							nowTime1 < facStopTime1 &&
							nowTime2 < facStopTime2){
							var historyData = {};
							historyData.client = client;
							historyData.userId = userId;
							AUTH.qryDuration(historyData,function(err,time){
								if(err){
									return res.json({resultCode:'1',info:'预认证失败，请稍后重试'});
								}
								if(time <= 60*60){
									console.log('***************已经开始返回结果**********************');
									res.json({resultCode:'10',info:'用户可以免费上网',data:resUser});
								}else{
									res.json({resultCode:'11',info:'用户当天已经免费上网超过一小时'});
								}
							});
						}else{
							res.json({resultCode:'9',info:'不在工厂的免费体验时间段之内'});
						}
					}
				}
			})
		});
	}catch(e){
		console.log(e);
		console.log('********************处理参数异常*******************');
		res.json({resultCode:'1',info:'服务器忙，请重试'});
	}
}
