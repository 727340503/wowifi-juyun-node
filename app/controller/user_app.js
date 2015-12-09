var soap = require('soap');
var settings = require('../../settings');
var Time = require('./time');
var APPUtil = require('../util/appUtil');
var MD5 = require('md5');
var async = require('async');
var AUTH = require('../util/auth');

exports.appLogin = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var user = data.phone;
		var password = data.password;
		if(!user || user == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}
		if(!password || password == ''){
			return res.json({resultCode:'1',info:'密码不能为空'});
		}
		var url29 = settings.CRMSERVICE_WSDL29;
		soap.createClient(url29,function(err,client){
			if(err){
				console.log(err);
				console.log('*****************连接失败*******************');
				return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
			}
			var qryUserData = {};
			qryUserData.user = user;
			qryUserData.client = client;
			APPUtil.qryAppUser(qryUserData,function(err,userInfo){
				if(err){
					console.log(err);
					console.log('*****************连接失败*******************');
					return res.json({resultCode:'1',info:'查询失败,请稍后重试'});
				}
				if(userInfo == null ){
					res.json({resultCode:'2',info:'用户不存在'});
				}else{
					if(userInfo.new_pwd != password){
						return res.json({resultCode:'3',info:'密码不正确'});
					}
					var url38 = settings.url;
					soap.createClient(url38,function(err,client2){
						if(err){
							console.log(err);
							console.log('*****************连接失败*******************');
							return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
						}
						var qry38UserData = {};
						qry38UserData.client = client2;
						qry38UserData.user = user;
						AUTH.qryUser(qry38UserData,function(err,userInfo38){
							if(err){
								console.log(err);
								console.log('*****************连接失败*******************');
								return res.json({resultCode:'1',info:'查询失败,请稍后重试'});
							}
							res.json({resultCode:'0',info:'查询成功',data29:userInfo,data38:userInfo38});
						});
					});
				}
			});
		});
	}catch(e){
		console.log(e);
		console.log('****************处理数据出错***************');
		res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	}
}


exports.qryUserInfo = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var user = data.user;
		var userid = data.userid;  
		if(!user || user == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}
		var url29 = settings.CRMSERVICE_WSDL29;
		soap.createClient(url29,function(err,client){
			if(err){
				console.log(err);
				console.log('*****************连接失败*******************');
				return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
			}
			var qryUserData = {};
			if(userid != null && userid != ''){//如果用户id存在，则根据id查询用户信息
				qryUserData.userid = userid;
			}else{
				qryUserData.user = user;
			}
			qryUserData.client = client;
			APPUtil.qryAppUser(qryUserData,function(err,userInfo){
				if(err){
					console.log(err);
					console.log('*****************连接失败*******************');
					return res.json({resultCode:'1',info:'查询失败,请稍后重试'});
				}
				if(userInfo == null ){
					res.json({resultCode:'2',info:'用户不存在,可以注册'});
				}else{
					var resultData = {};
					resultData.new_sidename = userInfo.new_sidename;//昵称
					resultData.new_userphoto = userInfo.new_userphoto;//头像图片地址
					resultData.new_accountno = userInfo.new_accountno;
					resultData.new_address = userInfo.new_address;//常居地
					resultData.new_birth = userInfo.new_birth;//生日
					resultData.new_realname = userInfo.new_realname;//真实姓名
					resultData.new_sex = userInfo.new_sex;//性别
					resultData.new_mobile = userInfo.new_mobile;
					resultData.new_tel1= userInfo.new_tel1;
					resultData.new_tel2= userInfo.new_tel2;
					resultData.new_tel3= userInfo.new_tel3;
					resultData.new_tel4= userInfo.new_tel4;
					res.json({resultCode:'0',info:'用户已经存在',data:resultData});
				}
			});
		});
	}catch(e){
		console.log(e);
		console.log('****************处理数据出错***************');
		res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	}
}

exports.registAppUser = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var user = data.phone;
		var password = data.password;
		var channel = data.channel;
		if(!user || user == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}
		if(!password || password == ''){
			return res.json({resultCode:'1',info:'密码不能为空'});
		}
		var url29 = settings.CRMSERVICE_WSDL29;
		soap.createClient(url29,function(err,client){
			if(err){
				console.log(err);
				console.log('*****************连接失败*******************');
				return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
			}
			var qryUserData = {};
			qryUserData.user = user;
			qryUserData.client = client;
			APPUtil.qryAppUser(qryUserData,function(err,userInfo){
				if(err){
					console.log(err);
					console.log('*****************连接失败*******************');
					return res.json({resultCode:'1',info:'查询失败,请稍后重试'});
				}
				if(userInfo == null ){
					var createData = {};
					createData.client = client;
					createData.user = user;
					createData.channel = channel;
					createData.password = password;
					APPUtil.createUser(createData,function(err,flag){
						if(err){
							console.log(err);
							console.log('***************创建用户发生异常********************');
							return res.json({resultCode:'1',info:'创建用户失败,请稍后重试'});
						}
						if(flag){
							res.json({resultCode:'0',info:'用户创建成功'});
						}else{
							res.json({resultCode:'1',info:'创建用户失败,请稍后重试'});
						}
					});
				}else{
					res.json({resultCode:'2',info:'用户已经存在'});
				}
			});
		});
	}catch(e){
		console.log(e);
		console.log('****************处理数据出错***************');
		res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	}
}

//查询广告位
exports.qryAdvert = function(req,res){
	var data = req.body;	
	// var data = req.query;
	try{
		var advertType = data.type;
		var pagesize = data.pagesize;
		var page = data.page;
		if(!advertType || advertType == ''){
			return res.json({resultCode:'1',info:'广告位类型不能为空'});
		}
		if(!pagesize || pagesize == ''){
			return res.json({resultCode:'1',info:'每页显示数量不能为空'});
		}
		if(!page || page == ''){
			return res.json({resultCode:'1',info:'当前页数不能为空'});
		}
		var url29 = settings.CRMSERVICE_WSDL29;
		soap.createClient(url29,function(err,client){
			if(err){
				console.log(err);
				console.log('*****************连接失败*******************');
				return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
			}
			var qryData = {};
			qryData.client = client;
			qryData.advertType = advertType;
			qryData.pagesize = pagesize;
			qryData.page = page;
			APPUtil.qryAdvert(qryData,function(err,adverts){
				if(err){
					console.log(err);
					console.log('******************查询广告位失败*****************');
					return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
				}
				if(adverts != null){
					res.json({resultCode:'0',info:'查询成功',data:adverts});
				}else{
					res.json({resultCode:'2',info:'查询没有结果'});
				}
			});
		});
	}catch(e){
		console.log(e);
		console.log('****************处理数据出错***************');
		res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	}
}


exports.AppFeedback = function(req,res){
	var data = req.body;	
	// var data = req.query;
	console.log(data);
	try{
		var username = data.username;
		var content = data.content;
		if(!content || content == ''){
			return res.json({resultCode:'1',info:'内容不能为空'});
		}
		if(!username || username == ''){
			username = "匿名";
		}
		var url = settings.CRMSERVICE_WSDL29;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('*****************连接失败*******************');
				return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
			}
			var args = {};
			args.entityname = "new_wenti";
			args.data = '[{"Key":"new_name","Value":"'+username+'"},{"Key":"new_neirong","Value":"'+content+'"}]';
			console.log(args);
			client.Create(args,function(err,result){
				if(err){
					console.log(err);
					console.log('*****************连接失败*******************');
					return res.json({resultCode:'1',info:'反馈失败，请稍后重试'});
				}
				var off = null;
				for(var a in result.CreateResult){
					if(a){
						off = true;
						break;
					}
				}
				console.log(result);
				if(off){
					var createData = JSON.parse(result.CreateResult);
					if(createData.issuccess){
						res.json({resultCode:'0',info:'意见反馈成功'});
					}else{
						res.json({resultCode:'1',info:'反馈失败，请稍后重试'});
					}
				}else{
					return res.json({resultCode:'1',info:'反馈失败，请稍后重试'});
				}
			});
		});
	}catch(e){
		console.log(e);
		console.log('****************处理数据出错***************');
		res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	}
}


exports.updUserInfo = function(req,res){
	var data = req.body;	
	// var data = req.query;
	try{
		var userid = data.userid;
		var gender = data.gender;
		var nickname = data.nickname;
		var birthday = data.birthday;
		var name = data.name;
		var imgUrl = data.imgUrl;
		var address = data.address;
		var mobile = data.mobile;
		var tel1 = data.tel1;
		var tel2 = data.tel2;
		var tel3 = data.tel3;
		var tel4 = data.tel4;
		if(!userid || userid == ''){
			return res.json({resultCode:'1',info:'用户id不能为空'});
		}
		if(!name || name == ''){
			return res.json({resultCode:'1',info:'真实姓名不能为空'});
		}
		var url = settings.CRMSERVICE_WSDL29;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('*****************连接失败*******************');
				return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
			}
			var qryData = {};
			qryData.client = client;
			qryData.userid = userid;
			console.log(qryData);
			APPUtil.qryAppUser(qryData,function(err,userInfo){
				if(err){
					console.log(err);
					console.log('*****************连接失败*******************');
					return res.json({resultCode:'1',info:'查询用户失败,请稍后重试'});
				}
				if(userInfo == null){
					res.json({resultCode:'2',info:'用户不存在'});
				}else{
					var argsData = '';
					if(gender && gender != ''){
						argsData += ',{"Key":"new_sex","Value":"'+gender+'"}';
					}
					if(nickname && nickname != ''){
						argsData += ',{"Key":"new_sidename","Value":"'+nickname+'"}';
					}
					if(birthday && birthday != ''){
						argsData += ',{"Key":"new_birth","Value":"'+birthday+'"}';
					}
					if(imgUrl && imgUrl != ''){
						argsData += ',{"Key":"new_userphoto","Value":"'+imgUrl+'"}';
					}
					if(address && address != ''){
						argsData += ',{"Key":"new_address","Value":"'+address+'"}';
					}
					if(tel1 || tel1 == ''){
						argsData += ',{"Key":"new_tel1","Value":"'+tel1+'"}';
					}
					if(tel2 || tel2 == ''){
						argsData += ',{"Key":"new_tel2","Value":"'+tel2+'"}';
					}
					if(tel3 || tel3 == ''){
						argsData += ',{"Key":"new_tel3","Value":"'+tel3+'"}';
					}
					if(tel4 || tel4 == ''){
						argsData += ',{"Key":"new_tel4","Value":"'+tel4+'"}';
					}
					if(mobile && mobile != ''){
						argsData += ',{"Key":"new_mobile","Value":"'+mobile+'"}';
					}
					var args = {};
					args.entityname = 'new_jyuser';
					args.data = '['+
								'{"Key":"new_jyuserid","Value":"'+userid+'"},'+
								'{"Key":"new_realname","Value":"'+name+'"}'+
								argsData+']';
					client.Update(args,function(err,result){
						if(err){
							console.log(err);
							console.log('*****************连接失败*******************');
							return res.json({resultCode:'1',info:'查询用户失败,请稍后重试'});
						}
						var off = null;
						for(var a in result.UpdateResult){
							if(a){
								off = true;
								break;
							}
						}	
						if(off){
							var updData = JSON.parse(result.UpdateResult);
							if(updData.issuccess){
								res.json({resultCode:'0',info:'更新用户信息成功'});
							}else{
								res.json({resultCode:'1',info:'更新用户失败'});
							}
						}else{
							res.json({resultCode:'1',info:'更新用户失败'});
						}
					});
				}
			});
		});
	}catch(e){
		console.log(e);
		console.log('****************处理数据出错***************');
		res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	}
}



//用户签到
exports.sign = function(req,res){
	var data = req.body;
	// var data  = req.query;
	try{
		var userid = data.userid;
		if(!userid || userid == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}
		var url = settings.CRMSERVICE_WSDL29;
		console.log(url);
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('*****************远程连接异常***************');
				return res.json({resultCode:'1',info:'签到不成功,请稍候重试'});
			}
			var nowDate = Time.format(new Date(),'yyyy/MM/dd');
			var args = {};
			args.entityname = "new_checkin";
        	args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jyuserid","Operator":"=","Value":"'+userid+'"},'+
        				  '{"Key":"new_date","Operator":"=","Value":"'+nowDate+'"},'+
        				  '{"Key":"new_type","Operator":"=","Value":1}]}]';
	        args.fields = 'new_checkinid,new_date,createdon';
          	args.orderby = 'createdon desc';
	        args.pagesize = 1;
	        args.pageindex = 1;
        	console.log(args);
        	console.log('********************开始查询用户是否签到****************');
        	client.Query(args,function(err,result){
        		if(err){
        			console.log(err);
        			console.log('*****************查询签到历史失败*****************');
        			return res.json({resultCode:'1',info:'签到不成功,请稍候重试'});
        		}
        		var off = true;
        		for(var a in result.QueryResult){
        			if(a){
        				off = false;
        				break;
        			}
        		}
        		console.log(result);
        		if(off){//判断是否已经签到
        			var createArgs = {};
    				createArgs.entityname ='new_checkin';
    				
        			createArgs.data =  '[{"Key":"new_jyuserid","Value":"'+userid+'"},'+
        								'{"Key":"new_type","Value":1},'+
        								'{"Key":"new_date","Value":"'+Time.format(new Date(),'yyyy-MM-dd')+'"}]';
        			console.log(createArgs);
        			client.Create(createArgs,function(err,result){
        				if(err){
        					console.log(err);
        					console.log('****************插入签到表错误****************');
        					return res.json({resultCode:'1',info:'签到不成功,请稍候重试'});
        				}
        				var off = null;
        				for(var a in result.CreateResult){
        					if(a){
        						off = true;
        						break;
        					}
        				}
        				console.log(result);
        				if(off){
        					var data = JSON.parse(result.CreateResult);
        					if(data.issuccess){
        						res.json({resultCode:'0',info:'签到成功'});
        					}else{
        						res.json({resultCode:'1',info:'签到不成功,请稍候重试'});
        					}
        				}
        			});
        		}else{
        			var qrydata = JSON.parse(result.QueryResult);
        			if(qrydata.issuccess != undefined || qrydata.issuccess == false){
        				return res.json({resultCode:'1',info:'签到不成功,请稍候重试'});
        			}
        			return res.json({resultCode:'2',info:'对不起,您今天已经签到'});
        		}
        	});
		});
	}catch(e){
		console.log(e);
		res.json({resultCode:'1',info:'签到不成功,请稍候重试'});
	}
}

//查询用户积分
exports.userIntegral = function(req,res){
	// var data = req.query;
	var data = req.body;
	try{
		var userid = data.userid;
		if(!userid || userid == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}
		var url = settings.CRMSERVICE_WSDL29;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('*****************连接失败*******************');
				return res.json({resultCode:'1',info:'连接异常,请稍后重试'});
			}
			var args = {};
			args.entityname = "new_jyuser";
			args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jyuserid","Operator":"=","Value":"'+userid+'"}]}]';
	        args.fields = 'new_kyintegral,new_integral,new_djintegral,createdon';
	        args.orderby = 'createdon desc';
	        args.pagesize = 100000000;
	        args.pageindex = 1;
	        console.log(args);
	        client.Query(args,function(err,result){
	        	if(err){
	        		console.log(err);
	        		console.log('*************查询出错****************');
	        		return res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	        	}
	        	var off = null;
	        	for(var a in result.QueryResult){
	        		if(a){
	        			off = true;
	        			break;
	        		}
	        	}
	        	console.log(result);
	        	if(off){
	        		var qryData = JSON.parse(result.QueryResult);
	        		if(qryData.issuccess != undefined || qryData.issuccess == false){
	        			return res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	        		}
	        		res.json({resultCode:'0',info:'',data:qryData[0]});
	        	}
	        });
		});
	}catch(e){
		console.log(e);
		console.log('****************处理数据出错***************');
		res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	}
}

//查询用户当月签到历史
exports.userSigns = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var userId = data.userid;
		var startDate = data.startDate;
		var stopDate = data.stopDate;
		if(!userId || userId == ''){
			return res.json({resultCode:'1',info:'用户不能为空'});
		}
		if(!startDate || startDate == ''){
			return res.json({resultCode:'1',info:'开始时间不能为空'});
		}
		if(!stopDate || stopDate == ''){
			return res.json({resultCode:'1',info:'结束时间不能为空'});
		}
		var url = settings.CRMSERVICE_WSDL29;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				return res.json({resultCode:'1',info:'远程连接异常,请稍后重试'});
			}
			var start = Time.format(new Date(startDate),'yyyy/MM/dd');
			var stop = Time.format(new Date(stopDate),'yyyy/MM/dd');
			var args = {};
			args.entityname = "new_checkin";
	        args.filter = '[{"Logical":"and","Conditions":['+
	        											'{"Key":"new_jyuserid","Operator":"=","Value":"'+userId+'"},'+
	        			  								'{"Key":"new_date","Operator":">=","Value":"'+start+'"},'+
	        			  								'{"Key":"new_date","Operator":"<=","Value":"'+stop+'"},'+
	        			  								'{"Key":"new_type","Operator":"=","Value":1}]}]';
	        args.fields = 'new_date,new_type,createdon';
          	args.orderby = 'new_date desc';
	        args.pagesize = 10000;
	        args.pageindex = 1;
	        console.log(args);
	        console.log('******************开始查询用户签到记录************************');
	        client.Query(args,function(err,result){
	        	if(err){
	        		console.log(err);
	        		console.log('*******************查询出错*********************');
	        		return res.json({resultCode:'2',info:'查询失败，请重试'});
	        	}
	        	var off = null;
	        	for(var a in result.QueryResult){
	        		if(a){
	        			off = true;
	        			break;
	        		}
	        	}
	        	console.log(result);
	        	if(off){
	        		var resultData = JSON.parse(result.QueryResult);
	        		if(resultData.issuccess!= undefined || resultData.issuccess == false){
						res.json({resultCode:'2',info:'查询失败，请重试'});
	        		}else{
	        			res.json({resultCode:'0',info:'查询成功',data:resultData});
	        		}
	        	}else{
	        		res.json({resultCode:'1',info:'用户还没有签到信息'});
	        	}
	        });
		});
	}catch(e){
		console.log(e);
		console.log('*********************处理数据出错**********************');
		res.json({resultCode:'2',info:'查询失败，请重试'});
	}
}

//查询积分规则对应的积分
exports.qryIntegral = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var integralName  = data.name;
		if(!integralName || integralName == ''){
			return res.json({resultCode:'1',info:'积分规则名字不能为空'});
		}
		var new_type = null;
		if(integralName == '签到'){
			new_type = 1;
		}else if(integralName == '分享'){
			new_type = 2;
		}else if(integralName == '首次注册'){
			new_type = 3;
		}else{
			return res.json({resultCode:'1',info:'对不起,你输入的积分规则不存在'});
		}
		var url = settings.CRMSERVICE_WSDL29;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('****************远程连接异常****************');
				return res.json({resultCode:'1',info:'查询失败,请稍后重试'});
			}
			var now =  Time.format(new Date(),'yyyy/MM/dd');
			var args = {};
			args.entityname = "new_integral";
	        args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_type","Operator":"=","Value":'+new_type+'}]}]';
	        args.fields = 'new_integral,createdon';
          	args.orderby = 'createdon desc';
	        args.pagesize = 1;
	        args.pageindex = 1;
	        console.log(args);
	        console.log('******************开始查询用户积分规则*********************');
	        client.Query(args,function(err,result){
	        	if(err){
	        		console.log(err);
	        		console.log('*****************查询失败****************');
	        		return res.json({resultCode:'1',info:'查询失败,请稍后重试'});
	        	}
	        	var off = null;
	        	for(var a in result.QueryResult){
	        		if(a){
	        			off = true;
	        			break;
	        		}
	        	}
	        	console.log(result);
	        	if(off){
	        		var integralData = JSON.parse(result.QueryResult);
	        		if(integralData.issuccess != undefined || integralData.issuccess == false){
	        			res.json({resultCode:'1',info:'对不起,你输入的积分规则不存在'});
	        		}else{
	        			res.json({resultCode:'0',info:'',integral:integralData[0].new_integral});
	        		}
	        	}else{
	        		res.json({resultCode:'1',info:'对不起,你输入的积分规则不存在'});
	        	}
	        });
		});
	}catch(e){
		console.log(e);
		console.log('*********************处理数据出错*****************');
		res.json({resultCode:'2',info:'查询失败，请重试'});
	}
}