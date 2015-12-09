var soap = require('soap');
var settings = require('../../settings');
var Time = require('./time');
var AUTH = require('../util/auth');
var MD5 = require('md5');
var async = require('async');



//修改密码接口
exports.editUserPassword = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var appUserId = data.appUserid;
		var user = data.user;
		var oldPassword = data.oldPwd;
		var newPassword = data.newPwd;
		var methodCode = data.methodCode;
		if((!appUserId  && methodCode == 1) || (appUserId == ''  && methodCode == 1)){
			return res.json({resultCode:'1',info:'登录用户不能为空'});
		}
		if(!user || user == ''){
			return res.json({resultCode:'1',info:'帐号不能为空'});
		}
		if((!oldPassword && methodCode == 1) || (oldPassword == '' && methodCode == 1)){
			return res.json({resultCode:'1',info:'原始密码不能为空'});
		}
		if(!newPassword || newPassword == ''){
			return res.json({resultCode:'1',info:'新密码不能为空'});
		}
		var url = settings.CRMSERVICE_WSDL29;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('****************远程连接异常**************');
				return res.json({resultCode:'1',info:'远程连接异常，请重试'});
			}
			var qryUserData = {};
			qryUserData.client = client;
			qryUserData.user = user;
			AUTH.qryAppUser(qryUserData,function(err,userInfo){
				if(err){
					return res.json({resultCode:'1',info:'查询用户失败，请稍后重试'});
				}
				if(userInfo != null){
					if(userInfo.new_pwd != oldPassword && methodCode == 1){
	    				return res.json({resultCode:'2',info:'原密码不正确'});
	    			}
	    			updUserData = {};
	    			updUserData.userId = userInfo.new_jyuserid;
	    			updUserData.pwd = newPassword;
	    			updUserData.client = client;
	    			AUTH.updAppUser(updUserData,function(err,flag){
	    				if(err){
	    					return res.json({resultCode:'1',info:'更新用户失败，请稍后重试'});
	    				}
	    				if(flag){
	    					// if(!userId || appUserId == ''){
	    					res.json({resultCode:'0',info:'修改密码成功'});
			    			// }else{
		    				// 	var url2 = settings.url;
		    				// 	soap.createClient(url2,function(err,client2){
		    				// 		if(err){
		    				// 			console.log(err);
		    				// 			console.log('*********************更新38用户出错********************');
		    				// 		}
		    				// 		var upd38UserData = {};
		    				// 		upd38UserData.client = client2;
		    				// 		upd38UserData.new_jifei_customerid = userId;
		    				// 		upd38UserData.password = newPassword;
		    				// 		AUTH.updUser(upd38UserData,function(err,updInfo){
		    				// 			if(err){
		    				// 				console.log(err);
		    				// 				console.log('*****************更新38用户失败*****************');
		    				// 				return res.json({resultCode:'2',info:'远程连接超时，请稍后重试'});
		    				// 			}
		    				// 			if(updInfo != null){
										// 	res.json({resultCode:'0',info:'修改密码成功'});
		    				// 			}else{
		    				// 				res.json({resultCode:'2',info:'修改密码失败，请稍候重试'});
		    				// 			}
		    				// 		});
		    				// 	});
			    			// }
	    				}else{
	    					return res.json({resultCode:'1',info:'更新用户失败，请稍后重试'});
	    				}
	    			});
				}else{
					res.json({resultCode:'4',info:'用户不存在'});
				}
			});
		});
	}catch(e){
		console.log(e);
		console.log('*********************处理数据出错*****************');
		res.json({resultCode:'1',info:'查询失败，请重试'});
	}
}


//生成帐号和密码
exports.generateUser = function(req,res){
	// var data = req.body;
	var data = req.query;
	try{
		var mobile= data.mobile;
		var imei = data.imei;
		var mac = data.mac;
		var sig = data.sig;
		var timestamp = data.timestamp;
		var deviceType = data.deviceType;
		var appKey = settings.appKey;
		var ssid = data.ssid;
		if(!mac || mac == ''){
			return res.json({resultCode:'1',info:'手机mac地址不能为空'});
		}
		if(!ssid || ssid == ''){
			return res.json({resultCode:'1',info:'热点名称不能为空'});
		}
		if(!deviceType || deviceType == ''){
			return res.json({resultCode:'1',info:'设备不能为空'});
		}
		if(!timestamp || timestamp == ''){
			return res.json({resultCode:'1',info:'当前时间戳不能为空'});
		}
		if(!sig || sig == ''){
			return res.json({resultCode:'1',info:'签名不能为空'});
		}
		var signature = MD5(deviceType + "||" + timestamp + "||" + mac + "||" + appKey).substring(12, 20);
		if(signature.toLowerCase() != sig.toLowerCase()){
			return res.json({resultCode:'3',info:'签名验证错误'});
		}
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('**********************远程连接超时，请稍后重试*************************');
				return res.json({resultCode:'1',info:'远程连接超时，请稍后重试'});
			}
			if(imei != null && imei != ''){
				//判断imei是否已经存在
				var qryArgs = {};
				qryArgs.client = client;
				qryArgs.imei = imei;
				AUTH.qryUser(qryArgs,function(err,userInfo){
					if(err){
						console.log(err);
						console.log('*****************判断用户是否存在出错**********************');
						return res.json({resultCode:'1',info:'生成用户失败，请重试'});
					}
					if(userInfo == null){
						if(!mobile || mobile == ''){
							return res.json({resultCode:'1',info:'imei对应的手机号不能为空'});
						}
						if(mobile.length != 11){
							return res.json({resultCode:'1',info:'手机号格式不正确'});
						}
						var qryArgs2 = {};
						qryArgs2.client = client;
						qryArgs2.user = mobile;
						AUTH.qryUser(qryArgs2,function(err,userInfo2){
							if(err){
								console.log(err);
								console.log('*****************判断用户是否存在出错**********************');
								return res.json({resultCode:'1',info:'生成用户失败，请重试'});
							}
							if(userInfo2 != null){//如果用户存在，则更新imei
								var userId = userInfo2.new_jifei_customerid;
								var updUserData = {};
								updUserData.client = client;
								updUserData.new_jifei_customerid = userId;
								updUserData.imei = imei;
								updUserData.phone_mac = mac;
								AUTH.updUser(updUserData,function(err,result){
									if(err){
										console.log(err);
										console.log('*****************更新用户imei出错**********************');
										return;
									}
									if(result){
										console.log('*****************更新用户imei成功**********************');
										//更新imei成功后更新用户体验时长
										AUTH.addAppExperiencetime(userInfo2,function(flag1){
											//无论更新是否成功，都需要返回给用户正确信息
											var resData = {};
											resData.account = mobile;
											resData.password = userInfo2.new_userPssword;
											resData.userId = userId;
											// var resStr = JSON.stringify(resData);
											res.json({resultCode:'0',info:'创建用户成功',data:resData});
											console.log("*********************用户第一次增加app体验时长结果"+imei+":"+flag1);
											if(!flag1){
												AUTH.addAppExperiencetime(userInfo2,function(flag2){
													console.log("*********************用户第二次增加app体验时长结果"+imei+":"+flag2);
													if(!flag2){
														AUTH.addAppExperiencetime(userInfo2,function(flag3){
															console.log("*********************用户第三次增加app体验时长结果"+imei+":"+flag3);														
														});
													}													
												});
											}
										});
									}else{
										res.json({resultCode:'1',info:'获取用户信息失败,请重试'});
										console.log('*****************更新用户imei失败**********************');
									}
								});
								// //无论更新是否成功，都需要返回给用户正确信息
								// var resData = {};
								// resData.account = mobile;
								// resData.password = userInfo2.new_userPssword;
								// resData.userId = userId;
								// // var resStr = JSON.stringify(resData);
								// res.json({resultCode:'0',info:'创建用户成功',data:resData});
							}else{//判断用户如果不存在，则新建
								var password = mobile.substring(5,mobile.length);
								var createUserData = {};
								createUserData.user = mobile;
								createUserData.imei = imei;
								createUserData.password = password;
								createUserData.client = client;
								createUserData.mac = mac;
								createUserData.new_jifei_factoryid = '';
								AUTH.createUser(createUserData,function(err,result){
									if(err){
										console.log(err);
										console.log('*****************创建用户出错**********************');
										return res.json({resultCode:'1',info:'创建用户失败，请重试'});
									}
									if(result != null){
										var userId = result.extra[0].Value;
										//根据工厂的体验日期创建用户订单
										var qryFacData = {};
										qryFacData.client = client;
										qryFacData.ssid = ssid;
										AUTH.qryFactory(qryFacData,function(err,result){
											if(err){
												return console.log(err);
											}
											var createOrderData = {};
											createOrderData.client = client;
											createOrderData.userId = userId;
											createOrderData.money = 0;
											createOrderData.ExperienceDate = result.new_date;
											createOrderData.appExperienceDate = result.new_appdate;
											AUTH.createAppExperienceOrder(createOrderData,function(err,result){
												if(err){
													console.log(err);
												}else{
													console.log('创建体验订单成功');
												}
											});
										});
										//无论订单失败还是成功，都会返回用户成功
										var resData = {};
										resData.account = mobile;
										resData.password = password;
										resData.userId = userId;
										// var resStr = JSON.stringify(resData);
										res.json({resultCode:'0',info:'创建用户成功',data:resData});
									}else{
										res.json({resultCode:'1',info:'创建用户失败，请重试'});
									}
								});
							}
						})
					}else{
						var resData = {};
						resData.account = userInfo.new_useraccount;
						resData.password = userInfo.new_userPssword;
						resData.userId = userInfo.new_jifei_customerid;
						res.json({resultCode:'2',info:'该imei已经注册用户',data:resData});			
					}
				});
			}else{
				var qryUserData = {};
				qryUserData.user = mobile;
				qryUserData.client = client;
				AUTH.qryUser(qryUserData,function(err,result){
					if(err){
						console.log(err);
						console.log('**********************远程连接超时，请稍后重试*************************');
						return res.json({resultCode:'1',info:'查询用户失败，请稍后重试'});
					}
					if(result == null){
						//如果帐号不存在,则新增帐号
						var createUserData = {};
						if(deviceType == 'pad'){
							createUserData.padMac = mac;
						}else{
							createUserData.mac = mac;
						}
						var password = mobile.substring(mobile.length-6,mobile.length);
						createUserData.user = mobile;
						createUserData.client = client;
						createUserData.password = password;
						AUTH.createUser(createUserData,function(err,result){
							if(err){
								console.log(err);
								console.log('**********************远程连接超时，请稍后重试*************************');
								return res.json({resultCode:'1',info:'查询用户失败，请稍后重试'});
							}
							if(result != null){
								var userId = result.extra[0].Value;
								//根据工厂的体验日期创建用户订单
								var qryFacData = {};
								qryFacData.client = client;
								qryFacData.ssid = ssid;
								AUTH.qryFactory(qryFacData,function(err,result){
									if(err){
										return console.log(err);
									}
									var createOrderData = {};
									createOrderData.client = client;
									createOrderData.userId = userId;
									createOrderData.money = 0;
									createOrderData.ExperienceDate = result.new_date;
									AUTH.createExperienceOrder(createOrderData,function(err,result){
										if(err){
											console.log(err);
										}else{
											console.log('创建体验订单成功');
										}
									});
								});
								var resData = {};
								resData.account = mobile;
								resData.password = password;
								resData.userId = userId;
								//无论订单创建是否成功，都需要返回给用户
								res.json({resultCode:'0',info:'查询上网用户成功',data:resData});
							}
						});
					}else{
						var resData = {};
						resData.account = result.new_useraccount;
						resData.password = result.new_userPssword;
						resData.facId = result.new_jifei_factoryid;
						resData.userId = result.new_jifei_customerid;
						// var resStr = JSON.stringify(resData);
						res.json({resultCode:'0',info:'查询上网用户成功',data:resData});
					}
				});
			}
		});
	}catch(e){
		console.log(e);
		console.log('*********************处理数据出错*****************');
		res.json({resultCode:'1',info:'查询失败，请重试'});
	}	
}


exports.qryUserAccessInfo = function(req,res){
	var data  = req.body;
	// var data = req.query;
	try{
		var userId = data.user;
		var ssid = data.ssid;
		var mac = data.mac;
		if(!userId || userId == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}
		if(!ssid || ssid == ''){
			return res.json({resultCode:'1',info:'热点名称不能为空'});
		}
		if(!mac || mac == ''){
			return res.json({resultCode:'1',info:'mac地址不能为空'});
		}
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('*********************连接远程服务器出错，请稍候重试**************************');
				return res.json({resultCode:'1',info:'远程连接超时，请稍后重试'});
			}
			async.auto({
				qryuserInfo:function(callback){
					var qryUserData = {};
					qryUserData.client = client;
					qryUserData.userId = userId;
					AUTH.qryUser(qryUserData,function(err,userInfo){
						if(err){
							console.log(err);
							return res.json({resultCode:'1',info:'查询用户失败'});
						}
						if(userInfo != null){
							callback(null,userInfo);
						}else{
							return res.json({resultCode:'2',info:'用户不存在'});
						}
					});
				},
				qryfac:[function(callback,result){
					var qryFacData = {};
					qryFacData.client = client;
					qryFacData.ssid = ssid;
					AUTH.qryFactory(qryFacData,function(err,facInfo){
						if(err){
							console.log(err);
							return res.json({resultCode:'1',info:'查询工厂失败'});
						}
						if(facInfo == null){
							return res.json({resultCode:'1',info:'热点对应的工厂不存在'});
						}else{
							callback(null,facInfo);
						}
					});
				}],
				qryOrder:['qryuserInfo',function(callback,results){
					var qryOrderData = {};
					qryOrderData.client = client;
					qryOrderData.userId = userId;
					AUTH.qryOrder(qryOrderData,function(err,orderInfo){
						if(err){
							console.log(err);
							console.log('**********************用户工厂不存在*********************');
							return res.json({resultCode:'1',info:'查询用户订单失败'});
						}
						if(orderInfo != null){
							//判断订单是否可用
							var startDate = Time.format(new Date(orderInfo.new_jifei_begintime),'yyyy-MM-dd');
							var startTime = new Date(startDate).getTime();
							var stopDate = Time.format(new Date(orderInfo.new_jifei_endtime),'yyyy-MM-dd HH:mm:ss');
							// var stopTime = new Date(stopDate).getTime()+8*60*60*1000;
							var stopTime = new Date(stopDate).getTime();
							var nowTime = new Date().getTime();
							orderInfo.remainTime = (stopTime - nowTime)/1000;
							callback(null,orderInfo);							
						}else{
							res.json({resultCode:'1',info:'用户订单不存在'});
						}
					});
				}],
				qryAccessTime : ['qryuserInfo','qryOrder',function(callback,results){
					var url2 = settings.UPDATE_SYSTEMUSER_URL;
					soap.createClient(url2,function(err,client2){
						if(err){
							console.log(err);
							console.log('*********************连接远程服务器出错，请稍候重试**************************');
							return res.json({resultCode:'1',info:'远程连接超时，请稍后重试'});
						}
						var qryAccessData = {};
						qryAccessData.client = client2;
						qryAccessData.mac = mac;
						qryAccessData.userId = userId;
						AUTH.qryUserAccessInfo(qryAccessData,function(err,historyInfo){
							if(err){
								// console.log(err);
								console.log('********************查询用户上线历史出错**********************');
								return res.json({resultCode:'1',info:'查询用户上线历史失败'});
							}
							if(historyInfo != null){
								var endTime = historyInfo.new_jifei_endtime;
								if(endTime != null && endTime != ''){
									callback(null,0);
								}else{
									var startTime = new Date(historyInfo.new_jifei_starttime).getTime()/1000+8*60*60;
									// var startTime = new Date(historyInfo.new_jifei_starttime).getTime()/1000;
									var nowTime = new Date().getTime()/1000;
									var startTime = Math.ceil(nowTime-startTime);
									callback(null,startTime);
								}
							}else{
								callback(null,0);
							}
						});
					});
				}],
				qryDurationTime:['qryuserInfo','qryOrder',function(callback,results){
					var orderInfo = results.qryOrder;
					var userInfo = results.qryuserInfo;
					console.log(userInfo);
					console.log(orderInfo);
					console.log(userInfo.new_type == 1 && orderInfo.remainTime <= 0);
					if(userInfo.new_type == 1 && orderInfo.remainTime <= 0){
						//查询当日体验时长
						var qryDurationData = {};
						qryDurationData.userId = userId;
						qryDurationData.client = client;
						AUTH.qryDuration(qryDurationData,function(err,time){
							if(err){
								console.log(err);
								console.log('******************查询当日上网时长出错*******************');
								return res.json({resultCode:'1',info:'查询当日上网时长出错'});
							}
							callback(null,time);
						});
					}else{
						callback(null,0);
					}
				}]
			},function(err,results){
				var orderInfo = results.qryOrder;
				var userInfo = results.qryuserInfo;
				var ssidFacInfo = results.qryfac;
				var startTime = results.qryAccessTime;
				var durationTime = results.qryDurationTime;
				console.log(orderInfo);
				console.log(userInfo);
				console.log(ssidFacInfo);
				console.log(durationTime);
				var resData = {};
				resData.account = userInfo.new_useraccount;//账户
				if(userInfo.new_type == 1 && orderInfo.remainTime <= 0){//判断用户是否为体验用户并且订单已经失效
					resData.type = 3;
					//查询体验时间段和已经体验的时长
					var now = Time.format(new Date(),'yyyy-MM-dd');
					var createdonTime = new Date(ssidFacInfo.createdon).getTime();
					var endTime = new Date(ssidFacInfo.new_jifei_endtime).getTime();
					// if(endTime < createdonTime){//订单失效日期
					// 	resData.endDate = orderInfo.createdon;
					// }else{
					// 	resData.endDate = orderInfo.new_jifei_endtime;
					// }
					var facStartDate1 = new Date(ssidFacInfo.new_strdate);
					var facStartDate4 = new Date(Date.UTC(facStartDate1.getFullYear(),facStartDate1.getMonth(),facStartDate1.getDate(),facStartDate1.getHours(),facStartDate1.getMinutes(), facStartDate1.getSeconds()));
					var facStartDate2 = Time.format(facStartDate4,'yyyy-MM-dd');
					var facStartDate3 = now+" "+Time.format(facStartDate4,'HH:mm:ss');
					var facStartTime1 = new Date(facStartDate2).getTime();
					var facStartTime2 = new Date(facStartDate3).getTime();
					console.log(facStartTime2);
					var facStopDate1 = new Date(ssidFacInfo.new_enddate);
					var facStopDate4 = new Date(Date.UTC(facStopDate1.getFullYear(),facStopDate1.getMonth(),facStopDate1.getDate(),facStopDate1.getHours(),facStopDate1.getMinutes(), facStopDate1.getSeconds()));
					var facStopDate2 = Time.format(facStopDate4,'yyyy-MM-dd');
					var facStopDate3 = now+' '+Time.format(facStopDate4,'HH:mm:ss');
					var facStopTime1 = new Date(facStopDate1).getTime();
					var facStopTime2 = new Date(facStopDate2).getTime();
					console.log(facStopDate3);
					var nowTime1 = new Date(Time.format(new Date(),'yyyy-MM-dd')).getTime();
					var nowTime2 = new Date().getTime();
					if(nowTime1 > facStartTime1 && 
							nowTime2 > facStartTime2 && 
							nowTime1 < facStopTime1 &&
							nowTime2 < facStopTime2){
						resData.experienceTime = Time.format(facStartDate4,'HH:mm') + "-" + Time.format(facStopDate4,'HH:mm');
					}else{
						resData.experienceTime = "暂未开启";
					}
					resData.endDate = facStopDate2;
					resData.durationTime = durationTime+startTime;//当天体验的时间
				}else{
					if(userInfo.new_type == 1){//判断用户类型
						resData.type = 2;
					}else{
						resData.type = 1;
					}
					//查询用户所剩余时长和用户失效日期
					resData.remainTime = Math.ceil(orderInfo.remainTime);//剩余时长
					var orderEndDate = new Date(orderInfo.new_jifei_endtime);
					// var orderEndDate2 = new Date(Date.UTC(orderEndDate.getFullYear(),orderEndDate.getMonth(),orderEndDate.getDate(),orderEndDate.getHours(),orderEndDate.getMinutes(), orderEndDate.getSeconds()));
					var endDate = Time.format(orderEndDate,'yyyy-MM-dd HH:mm');
					resData.endDate = endDate;//用户失效时间
				}
				resData.facName = userInfo.new_jifei_factoryidname;//所在工厂的工厂名称
				if(ssidFacInfo != null){//ssid所属工厂
					resData.ssidFacName = ssidFacInfo.new_jifei_factoryname;
				}else{
					resData.ssidFacName = "";
				}
				resData.region_opinion = userInfo.new_region_opinion;//是否可以跨域使用
				resData.startTime = startTime;
				console.log('****************************返回的结果******************************');
				console.log(resData);
				res.json({resultCode:'0',info:'查询成功',data:resData});
			});
		});
	}catch(e){
		console.log(e);
		console.log('*****************处理数据出错********************');
		res.json({resultCode:'1',info:'查询失败，请重试'});
	}
}


exports.editWifiUserPassword = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var user = data.user;
		var password = data.password;
		var timestamp = data.timestamp;
		var sig = data.sig;
		var appKey = settings.appKey;
		if(!user || user == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}		
		if(!password || password == ''){
			return res.json({resultCode:'1',info:'用户密码不能为空'});
		}
		if(!timestamp || timestamp == ''){
			return res.json({resultCode:'1',info:'时间戳不能为空'});
		}
		if(!sig || sig == ''){
			return res.json({resultCode:'1',info:'签名不能为空'});
		}
		var signature = MD5(user + "||" + password + "||" + timestamp + "||" + appKey).substring(12, 20);
		if(signature.toLowerCase() != sig.toLowerCase()){
			return res.json({resultCode:'3',info:'签名验证错误'});
		}
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('*********************连接远程服务器出错，请稍候重试**************************');
				return res.json({resultCode:'1',info:'远程连接超时，请稍后重试'});
			}
			var qryData = {};
			qryData.user = user;
			qryData.client = client;
			AUTH.qryUser(qryData,function(err,userInfo){
				if(err){
					console.log(err);
					console.log('*****************处理数据出错********************');
					return res.json({resultCode:'1',info:'查询用户失败，请重试'});
				}
				if(userInfo == null){
					res.json({resultCode:'2',info:'用户不存在'});
				}else{
					var oldPassword = userInfo.new_userPssword;
					if(oldPassword == password){
						res.json({resultCode:'0',info:'修改密码成功'});
					}else{
						var updUserData = {};
						updUserData.client = client;
						updUserData.new_jifei_customerid = userInfo.new_jifei_customerid;
						updUserData.password = password;
						AUTH.updUser(updUserData,function(err,result){
							if(err){
								return res.json({resultCode:'1',info:'更新密码失败，请重试'});
							}
							if(result != null){
								res.json({resultCode:'0',info:'更新密码成功'});
							}else{
								res.json({resultCode:'1',info:'更新密码失败，请重试'});
							}
						});
					}
				}
			});
		});
	}catch(e){
		console.log(e);
		console.log('*********************处理数据出错*****************');
		res.json({resultCode:'1',info:'查询失败，请重试'});
	}
}


//注册38的用户
exports.wifiUserRegist = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var user = data.phone;
		var password = data.password;
		var ssid = data.ssid;
		if(!user || user == ''){
			return res.json({resultCode:'1',info:'手机号不能为空'});
		}		
		if(!password || password == ''){
			return res.json({resultCode:'1',info:'用户密码不能为空'});
		}
		if(!ssid || ssid == ''){
			return res.json({resultCode:'1',info:'热点不能为空'});
		}
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('*********************处理数据出错*****************');
				return res.json({resultCode:'1',info:'远程连接服务器异常，请稍后重试'});
			}
			var qryUserData = {};
			qryUserData.user = user;
			qryUserData.client = client;
			AUTH.qryUser(qryUserData,function(err,result){
				if(err){
					console.log(err);
					return res.json({resultCode:'1',info:'查询用户失败，请稍后重试'});
				}
				if(result == null){
					//如果帐号不存在,则新增帐号
					var createUserData = {};
					createUserData.user = user;
					createUserData.client = client;
					createUserData.password = password;
					client.ssid = ssid;
					AUTH.createUser(createUserData,function(err,result){
						if(err){
							console.log(err);
							console.log('**********************远程连接超时，请稍后重试*************************');
							return res.json({resultCode:'1',info:'查询用户失败，请稍后重试'});
						}
						if(result != null){
							var userId = result.extra[0].Value;
							//根据工厂的体验日期创建用户订单
							var qryFacData = {};
							qryFacData.client = client;
							qryFacData.ssid = ssid;
							AUTH.qryFactory(qryFacData,function(err,result){
								if(err){
									return console.log(err);
								}
								var createOrderData = {};
								createOrderData.client = client;
								createOrderData.userId = userId;
								createOrderData.money = 0;
								createOrderData.ExperienceDate = result.new_date;
								AUTH.createExperienceOrder(createOrderData,function(err,result){
									if(err){
										console.log(err);
									}else{
										console.log('创建体验订单成功');
									}
								});
							});
							//无论订单创建是否成功，都需要返回给用户
							res.json({resultCode:'0',info:'注册用户成功',data:resData});
						}
					});
				}else{
					res.json({resultCode:'2',info:'对不起，该帐号已经注册'});
				}
			});
		})
	}catch(e){
		console.log(e);
		console.log('*********************处理数据出错*****************');
		res.json({resultCode:'1',info:'查询失败，请重试'});
	}
}
