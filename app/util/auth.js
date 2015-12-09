
var Time = require('../controller/time');
var settings = require('../../settings'); 
var async = require('async');
var soap = require('soap');

//查询用户
exports.qryUser = function(data,cb){
	var client = data.client;
	var filter = "";
	if(data.user != null && data.user != ''){
		filter = '{"Key":"new_useraccount","Operator":"=","Value":"'+data.user+'"}';
	}else if(data.userId != null && data.userId != ''){
		filter = '{"Key":"new_jifei_customerid","Operator":"=","Value":"'+data.userId+'"}';
	}else if(data.imei != null && data.imei != ''){
        filter = '{"Key":"new_imei","Operator":"=","Value":"'+data.imei+'"}';
    }        
	var userArgs = {};
	userArgs.entityname = "new_jifei_customer";
	userArgs.filter = '[{"Logical":"and","Conditions":['+filter+']}]';
    userArgs.fields = 'new_jifei_customerid,new_type,new_imei,new_recordtype,new_useraccount,new_userPssword,statecode,new_region_opinion,new_man_opinion,new_mac,new_jifei_factoryid,new_jifei_factoryidname,createdon';
  	userArgs.orderby = 'createdon desc';
    userArgs.pagesize = 1;
    userArgs.pageindex = 1;
    console.log('********************查询用户条件**********************');
    console.log(userArgs);
    client.Query(userArgs,function(err,result){
    	if(err){
    		return cb(err,null);
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	console.log('************************查询用户结果**********************');
    	console.log(result);
    	if(off){
    		var resultData = JSON.parse(result.QueryResult);
    		if(resultData.issuccess != undefined || resultData.issuccess == false){
    			cb("查询失败",null);
    		}else{
    			cb(null,resultData[0]);
    		}
    	}else{
    		cb(null,null);
    	}
    });
}


//根据AP mac地址查询工厂
exports.qryFactoryByMac = function(data,cb){
	var client = data.client;
	var wifiMac = data.wifiMac;
	var qryFacArgs = {};
	qryFacArgs.entityname = "new_jifei_equ";
	qryFacArgs.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jifei_equdomac","Operator":"=","Value":"'+wifiMac+'"}]}]';
    qryFacArgs.fields = 'new_jifei_factoryid,createdon';
  	qryFacArgs.orderby = 'createdon desc';
    qryFacArgs.pagesize = 1;
    qryFacArgs.pageindex = 1;
    client.Query(qryFacArgs,function(err,result){
    	if(err){
    		return cb(err,null);
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	console.log('************************根据mac查询工厂id结果**********************');
    	console.log(result);
    	if(off){
    		var resultData = JSON.parse(result.QueryResult);
    		if(resultData.issuccess != undefined || resultData.QueryResult == false){
    			cb('查询失败',null);
    		}else{
    			var facId = resultData[0].new_jifei_factoryid;
    			if(facId != null && facId != ''){
    				var qryFacInfoArgs = {};
    				qryFacInfoArgs.entityname = "new_jifei_factory";
					qryFacInfoArgs.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jifei_factoryid","Operator":"=","Value":"'+facId+'"}]}]';
				    qryFacInfoArgs.fields = 'new_jifei_factoryid,new_jifei_factiondomain,new_enddate,new_strdate,createdon';
				  	qryFacInfoArgs.orderby = 'createdon desc';
				    qryFacInfoArgs.pagesize = 1;
				    qryFacInfoArgs.pageindex = 1;
                    console.log(qryFacInfoArgs);
                    console.log('**********************开始查询工厂*****************************');
    				client.Query(qryFacInfoArgs,function(err,result){
    					if(err){
				    		return cb(err,null);
				    	}
				    	var off = null;
				    	for(var a in result.QueryResult){
				    		if(a){
				    			off = true;
				    			break;
				    		}
				    	}
				    	console.log('************************根据mac查询工厂结果**********************');
    					console.log(result);
				    	if(off){	
				    		var resultData = JSON.parse(result.QueryResult);
				    		if(resultData.issuccess != undefined || resultData.issuccess == false){
				    			cb('查询工厂失败',null);
				    		}else{
								cb(null,resultData[0]);				    			
				    		}
				    	}else{
				    		cb(null,null);
				    	}

    				});
    			}
    		}
    	}else{
    		cb(null,null);
    	}
    });
}

//查询工厂
exports.qryFactory = function(data,cb){
	var client = data.client;
	var factoryid = data.factoryid;
    var ssid = data.ssid;
    var filter = '';
    if(factoryid != null && factoryid != ''){
        filter = '{"Key":"new_jifei_factoryid","Operator":"=","Value":"'+factoryid+'"}';
    }else if(ssid != null && ssid != ''){
        filter = '{"Key":"new_ssid","Operator":"=","Value":"'+ssid+'"}';
    }
    // var facArgs = {};
    // facArgs.entityname = 'new_jifei_factory';
    // facArgs.filter = '[{"Logical":"and","Conditions":[{'+filter+']}]';
    // facArgs.fields = 'new_appdate,createdon';
    // facArgs.orderby = 'createdon desc';
    // facArgs.pagesize = 1;
    // facArgs.pageindex = 1;
    var args = {};
	args.entityname = 'new_jifei_factory';
	args.filter = '[{"Logical":"and","Conditions":['+filter+']}]';
    args.fields = 'new_jifei_factoryid,new_jifei_factoryname,new_jifei_factiondomain,new_enddate,new_strdate,new_date,new_appdate,createdon';
  	args.orderby = 'createdon desc';
    args.pagesize = 1;
    args.pageindex = 1;
    console.log('*********************查询工厂条件*********************');
    console.log(args);
    client.Query(args,function(err,result){
		if(err){
            console.log(err);
    		return cb(err,null);
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	console.log('************************根据id查询工厂结果**********************');
    	console.log(result);
    	if(off){	
    		var resultData = JSON.parse(result.QueryResult);
    		if(resultData.issuccess != undefined || resultData.issuccess == false){
    			cb('查询工厂失败',null);
    		}else{
				cb(null,resultData[0]);				    			
    		}
    	}else{
    		cb(null,null);
    	}
	});

}

//注册新用户
exports.createUser = function(data,cb){
	var client = data.client;
	var userAccount = data.user;
	var factoryid = data.new_jifei_factoryid;
	var password = data.password;
    var imei = data.imei;
    var mac = data.mac;
    var pcMac = data.pcMac;
    var padMac = data.padMac;
	var userData = '{"Key":"new_useraccount","Value":"'+userAccount+'"},{"Key":"new_userfullname","Value":"'+userAccount+'"},{"Key":"new_userphone","Value":"'+userAccount+'"},{"Key":"new_userpssword","Value":"'+password+'"},{"Key":"new_userpssword2","Value":"'+password+'"},{"Key":"new_type","Value":1}';
    if(factoryid && factoryid != ''){
        userData += ',{"Key":"new_jifei_factoryid","Value":"'+factoryid+'"}';
    }
    if(imei && imei != ''){
        userData += ',{"Key":"new_imei","Value":"'+imei+'"}';
    }
    if(mac && mac != ''){
        userData += ',{"Key":"new_mac","Value":"'+mac+'"}';
    }
    if(pcMac && pcMac != ''){
        userData += ',{"Key":"new_pc_mac","Value":"'+pcMac+'"}';
    }
    if(padMac && padMac != ''){
        userData += ',{"Key":"new_ipad_mac","Value":"'+padMac+'"}';
    }
    var args = {};
	args.entityname = "new_jifei_customer";    
	args.data = '['+userData+']';
    console.log(args);
    console.log('*********************开始创建用户*************************');
	client.Create(args,function(err,result){
		if(err){
			return cb(err,null);
		}
		var off = null;
		for(var a in result.CreateResult){
			if(a){
				off = true;
				break;
			}
		}
		console.log('************************创建用户结果**********************');
    	console.log(result);
		if(off){
			var resultData = JSON.parse(result.CreateResult);
			if(resultData.issuccess){
				cb(null,resultData);
			}else{
				cb('创建失败',null);
			}
		}else{
			cb(null,null);
		}
	});                                    
}


//更新用户
exports.updUser = function(data,cb){
	var client = data.client;
	var userId = data.new_jifei_customerid;
	var args = {};
	args.entityname = "new_jifei_customer";
	var updData = '{"Key":"new_jifei_customerid","Value":"'+userId+'"}';
	if(data.new_jifei_factoryid != null && data.new_jifei_factoryid != ''){
		updData += ',{"Key":"new_jifei_factoryid","Value":"'+data.new_jifei_factoryid+'"}';
	}
	if(data.password != null && data.password != ''){
		updData += ',{"Key":"new_userpssword","Value":"'+data.password+'"},{"Key":"new_userpssword2","Value":"'+data.password+'"}';
	}
    if(data.pad_mac != null && data.pad_mac != ''){
        updData += ',{"Key":"new_ipad_mac","Value":"'+data.pad_mac+'"}';
    }
    if(data.phone_mac != null && data.phone_mac != ''){
        updData += ',{"Key":"new_mac","Value":"'+data.phone_mac+'"}';
    }
    if(data.imei != null && data.imei != ''){
        updData += ',{"Key":"new_imei","Value":"'+data.imei+'"}';
    }
	args.data = '['+updData+']';
	client.Update(args,function(err,result){
		if(err){
			return cb(err,null);
		}
		var off = null;
		for(var a in result.UpdateResult){
			if(a){
				off = true;
				break;
			}
		}
		console.log('********************更新用户结果***********************');
		console.log(result);
		if(off){
			var resultData = JSON.parse(result.UpdateResult);
			if(resultData.issuccess){
				cb(null,resultData);
			}else{
				cb('更新失败',null);
			}
		}else{
			cb(null,null);
		}
	});
}

//查询用户订单
exports.qryOrder = function(data,cb){
	var client = data.client;
	var userId = data.userId;
	var args = {};
	args.entityname = 'new_jifei_order';
	args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jifei_customerid","Operator":"=","Value":"'+userId+'"}]}]';
    args.fields = 'new_jifei_begintime,new_jifei_customerid,new_jifei_endtime,new_jifei_orderid,statecode,createdon';
  	args.orderby = 'createdon desc';
    args.pagesize = 1;
    args.pageindex = 1;
    client.Query(args,function(err,result){
    	if(err){
    		return cb(err,null);
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	console.log('************************查询用户订单结果**********************');
    	console.log(result);
    	if(off){
    		var resultData = JSON.parse(result.QueryResult);
    		if(resultData.issuccess != undefined || resultData.issuccess == false){
    			cb('查询订单失败',null);
    		}else{
    			cb(null,resultData[0]);
    		}
    	}else{
    		cb(null,null);
    	}
    });
}	

//查询用户当天上网总时长
exports.qryDuration = function(data,cb){
	var client = data.client;
	var userId = data.userId;
	var startDate1 = Time.format(new Date(),'yyyy-MM-dd')+' 00:00:00';
	var startDate2 = Time.format(new Date(),'yyyy-MM-dd')+' 23:59:59';
	var args = {};
	args.entityname = 'new_jifei_history';
	args.filter = '[{"Logical":"and","Conditions":['+
				  '{"Key":"new_jifei_customerid","Operator":"=","Value":"'+userId+'"},'+
				  '{"Key":"new_jifei_starttime","Operator":">=","Value":"'+startDate1+'"},'+
				  '{"Key":"new_jifei_starttime","Operator":"<=","Value":"'+startDate2+'"}]}]';
    args.fields = 'new_jifei_starttime,new_jifei_endtime,new_jifei_sumtime,createdon';
  	args.orderby = 'createdon desc';
    args.pagesize = 1000000;
    args.pageindex = 1;
    client.Query(args,function(err,result){
    	if(err){
    		return cb(err,null);
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	console.log('************************查询用户当天上网时长结果**********************');
    	console.log(result);
    	if(off){
    		var resultData = JSON.parse(result.QueryResult);
    		if(resultData.issuccess != undefined || resultData.issuccess == false){
    			cb('查询历史记录出错',null);
    		}else{
    			var sum = 0;
    			for(var i=0; i<resultData.length; i++){
    				var time = resultData[i].new_jifei_sumtime;
                    if(time == null || time == ''){
                        time = 0;
                    }else{
                        time = parseInt(time);
                    }
    				sum += time;
    				if(i >= resultData.length-1){
    					console.log(sum);
                        cb(null,sum);
    				}
    			}
    		}
    	}else{
    		cb(null,0);
    	}
    });
}

//根据热点名称查询域
exports.qryDomain = function(data,cb){
	var client = data.client;
	var ssid = data.ssid;
	var args = {};
	args.entityname = 'new_jifei_ssiddoman';
	args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_ssid","Operator":"=","Value":"'+ssid+'"}]}]';
    args.fields = 'new_doman,createdon';
  	args.orderby = 'createdon desc';
    args.pagesize = 1;
    args.pageindex = 1;
    console.log('**********************查询域条件********************');
    console.log(args);
    client.Query(args,function(err,result){
    	if(err){	
    		return cb(err,null);
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	console.log('************************查询域结果**********************');
    	console.log(result);
    	if(off){
    		var resultData = JSON.parse(result.QueryResult);
    		if(resultData.issuccess != undefined || resultData.issuccess == false){
    			cb('查询域错误',null);
    		}else{
    			cb(null,resultData[0]);
    		}
    	}else{
    		cb(null,null);
    	}
    });

}

//查询用户黑名单
exports.qryBlacklist = function(data,cb){
	var client = data.client;
	var user = data.user;
	var args = {};
	args.entityname = 'new_blacklist';
	args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_mobilenum","Operator":"=","Value":"'+user+'"}]}]';
    args.fields = 'new_mobilenum,createdon';
  	args.orderby = 'createdon desc';
    args.pagesize = 1;
    args.pageindex = 1;
    client.Query(args,function(err,result){
    	if(err){
    		return cb(err,false);
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	console.log('************************查询黑名单结果**********************');
    	console.log(result);
    	if(off){
    		var resultData = JSON.parse(result.QueryResult);
    		if(resultData.issuccess != undefined || resultData.issuccess == false){
    			cb('查询黑名单异常',true);
    		}else{
    			cb(null,false);
    		}
    	}else{
    		cb(null,true);
    	}
    });

}


//插入体验订单
exports.createAppExperienceOrder = function(data,cb){
    var client = data.client;
    var TYPackageId = settings.TYPACKAGEID;
    var num = data.num;
    var money = data.money;
    var userId = data.userId;
    var ExperienceDate = data.ExperienceDate;
    var appExperienceDate = data.appExperienceDate;
    var now = new Date();
    var nowTime = Time.format(now.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
    var endTime = '';
    if(ExperienceDate || ExperienceDate != ''){
        num = parseInt(ExperienceDate)+parseInt(appExperienceDate);
        var endDate = new Date(now.getFullYear(), now.getMonth(), (now.getDate()) + num, now.getHours(), now.getMinutes(), now.getSeconds());
        endTime = Time.format(endDate.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
    }else{
        var endDate = new Date(now.getFullYear(), now.getMonth(), (now.getDate())-1, now.getHours(), now.getMinutes(), now.getSeconds());  
        endTime = Time.format(endDate.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
    }
    var args = {};
    args.entityname = "new_jifei_order";
    args.data = '[{"Key":"new_jifei_customerid","Value":"'+userId+'"},'+
                        '{"Key":"new_jifei_orderamount","Value":"'+money+'"},'+
                        '{"Key":"new_jifei_ordersum","Value":"'+num+'"},'+//订购数量
                        '{"Key":"new_jifei_taketype","Value":"0"},'+
                        '{"Key":"new_jifei_begintime","Value":"'+nowTime+'"},'+
                        '{"Key":"new_jifei_packageid","Value":"'+TYPackageId+'"},'+
                        '{"Key":"new_jifei_endtime","Value":"'+endTime+'"}]';
    console.log(args);
    console.log('***********************开始创建体验订单**************************');
    client.Create(args,function(err,result){
        if(err){
            console.log(err);
            console.log('******************插入体验订单失败*******************');
            cb(err,null);
            return;
        }
        var off = null;
        for(var a in result.CreateResult){
            if(a){
                off = true;
                break;
            }
        }
        console.log('********************插入体验订单返回结果**********************8');
        console.log(result);
        if(off){
            var createOrderData = JSON.parse(result.CreateResult);
            if(createOrderData.issuccess){
                cb(null,true);
            }else{
                cb('订单插入失败',false);
            }
        }else{
            cb(null,false);
        }
    });
}


//插入体验订单
exports.createExperienceOrder = function(data,cb){
    var client = data.client;
    var TYPackageId = settings.TYPACKAGEID;
    var num = data.num;
    var money = data.money;
    var userId = data.userId;
    var ExperienceDate = data.ExperienceDate;
    var now = new Date();
    var nowTime = Time.format(now.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
    var endTime = '';
    if(ExperienceDate || ExperienceDate != ''){
        num = parseInt(ExperienceDate);
        var endDate = new Date(now.getFullYear(), now.getMonth(), (now.getDate()) + num, now.getHours(), now.getMinutes(), now.getSeconds());
        endTime = Time.format(endDate.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
    }else{
        var endDate = new Date(now.getFullYear(), now.getMonth(), (now.getDate())-1, now.getHours(), now.getMinutes(), now.getSeconds());  
        endTime = Time.format(endDate.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
    }
    var args = {};
    args.entityname = "new_jifei_order";
    args.data = '[{"Key":"new_jifei_customerid","Value":"'+userId+'"},'+
                        '{"Key":"new_jifei_orderamount","Value":"'+money+'"},'+
                        '{"Key":"new_jifei_ordersum","Value":"'+num+'"},'+//订购数量
                        '{"Key":"new_jifei_taketype","Value":"0"},'+
                        '{"Key":"new_jifei_begintime","Value":"'+nowTime+'"},'+
                        '{"Key":"new_jifei_packageid","Value":"'+TYPackageId+'"},'+
                        '{"Key":"new_jifei_endtime","Value":"'+endTime+'"}]';
    console.log(args);
    console.log('***********************开始创建体验订单**************************');
    client.Create(args,function(err,result){
        if(err){
            console.log(err);
            console.log('******************插入体验订单失败*******************');
            cb(err,null);
            return;
        }
        var off = null;
        for(var a in result.CreateResult){
            if(a){
                off = true;
                break;
            }
        }
        console.log('********************插入体验订单返回结果**********************8');
        console.log(result);
        if(off){
            var createOrderData = JSON.parse(result.CreateResult);
            if(createOrderData.issuccess){
                cb(null,true);
            }else{
                cb('订单插入失败',false);
            }
        }else{
            cb(null,false);
        }
    });
}

exports.qryUserAccessInfo = function(data,cb){
    var client = data.client;
    var filter = "new_jifei_customerid = ''"+data.userId+"'' ";
    if(data.mac != null && data.mac != ''){
        filter += "AND new_jifei_mac = ''"+data.mac+"'' ";
    }
    var now = new Date().getTime()-8*60*60*1000;
    var now2 = new Date(now);
    var startTime = Time.format(now2,'yyyy-MM-dd') + " 00:00:00";
    filter += "AND new_jifei_starttime >= ''"+startTime+"'' ";
    // filter += 'AND new_jifei_endtime IS NULL';
    var args = {};
    args.sqlstr = "exec usp_Common_Sel_TableData 'new_jifei_history',"+
                  "'new_jifei_mac,new_jifei_starttime,new_jifei_customerid,createdon',"+//显示字段
                  "1,1,"+//分页参数
                  "'new_jifei_starttime desc','"+//排序字段
                  filter+"'";//过滤条件
    console.log(args);
    console.log('*************************开始查询用户上线记录*********************************');
    client.QuerySql(args,function(err,result){
        if(err){
            return cb(err,null);
        }
        var off = null;
        for(var a in result.QuerySqlResult){
            if(a){
                off = true;
                break;
            }
        }
        console.log('***************查询上网记录结果******************');
        console.log(result);
        if(off){
            var resultData = JSON.parse(result.QuerySqlResult);
            if(resultData.issuccess != undefined || resultData.issuccess == false){
                cb('查询错误',null);
            }else{
                cb(null,resultData[0]);
            }
        }else{
            cb(null,null);
        }
    });
}

//查询29服务器用户
exports.qryAppUser = function(data,cb){	
	var client = data.client;
	var user = data.user;
	var args = {};
	args.entityname = 'new_jyuser';
	args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_accountno","Operator":"=","Value":"'+user+'"}]}]';
    args.fields = 'new_jyuserid,new_pwd,new_sidename,new_userphoto,new_accountno,createdon';
  	args.orderby = 'createdon desc';
    args.pagesize = 1;
    args.pageindex = 1;
    console.log(args);
    console.log('**************************开始查询用户*************************8');
    client.Query(args,function(err,result){
    	if(err){
    		return cb(err,null);
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	console.log(result);
    	console.log('***********************查询29用户结果*****************************8');
    	if(off){
    		var userInfoData = JSON.parse(result.QueryResult);
    		if(userInfoData.issuccess != undefined || userInfoData.issuccess == false){
    			cb('查询失败',null);
    		}else{
    			cb(null,userInfoData[0]);
    		}
    	}else{
    		cb(null,null);
    	}
    });
}

//更新29用户
exports.updAppUser = function(data,cb){
	var client = data.client;
	var userId = data.userId;
	var password = data.pwd;
	var args = {};
	args.entityname = 'new_jyuser';
	args.data = '[{"Key":"new_jyuserid","Value":"'+userId+'"},'+
			    '{"Key":"new_pwd","Value":"'+password+'"}]';
	client.Update(args,function(err,result){
		if(err){
			return cb(err,false);
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
				cb(null,true);
			}else{
				cb('更新失败',false);
			}
		}else{
			cb(null,false);
		}
	});
}


/*
app用户更新用户订单时长
*/
exports.addAppExperiencetime = function(data,cb){
    var user = data.new_useraccount;
    var userId = data.new_jifei_customerid;
    var facId = data.new_jifei_factoryid;
    var client = data.client;
    //修改用户的订单时长
    var url = settings.url;
    soap.createClient(url,function(err,client){
        if(err){
            console.log(err);
            console.log('****************发生了异常**************');
            return;
        }
        async.auto({
            'qryExperienceTime':function(callback){
                var facArgs = {};
                facArgs.entityname = 'new_jifei_factory';
                facArgs.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jifei_factoryid","Operator":"=","Value":"'+facId+'"}]}]';
                facArgs.fields = 'new_appdate,createdon';
                facArgs.orderby = 'createdon desc';
                facArgs.pagesize = 1;
                facArgs.pageindex = 1;
                console.log('*****************开始查询体验时长***********');
                client.Query(facArgs,function(err,result){
                    if(err){
                        callback(err,null);
                        return;
                    }
                    var off = null;
                    for(var a in result.QueryResult){
                        if(a){
                            off = true;
                            break;
                        }
                    }
                    console.log('***************查询工厂结果***************');
                    console.log(result);
                    if(off){
                        var facInfo = JSON.parse(result.QueryResult);
                        if(facInfo.issuccess != undefined || facInfo.issuccess == false){
                            callback("err",null);
                        }else{
                            var experienceTime = parseInt(facInfo[0].new_appdate);
                            callback(null,experienceTime);
                        }
                    }else{
                        callback("err",null);
                    }
                });
            },
            'qryOrder':[function(callback,results){
                var args = {};
                args.entityname = 'new_jifei_order';
                args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jifei_customerid","Operator":"=","Value":"'+userId+'"}]}]';
                args.fields = 'new_jifei_orderid,new_jifei_endtime,createdon';
                args.orderby = 'new_jifei_endtime desc';
                args.pagesize = 1;
                args.pageindex = 1;
                console.log('*****************开始查询订单***********');
                client.Query(args,function(err,result){
                    if(err){
                        callback(err,null);
                        return;
                    }
                    var off = null;
                    for(var a in result.QueryResult){
                        if(a){
                            off = true;
                            break;
                        }
                    }
                    console.log('***************查询订单结果****************');
                    console.log(result);
                    if(off){
                        var orderInfo = JSON.parse(result.QueryResult);
                        if(orderInfo.issuccess != undefined || orderInfo.issuccess == false){
                            callback("err",null);
                        }else{
                            callback(null,orderInfo);
                        }
                    }else{
                        callback("err",null);
                    }
                })
            }]
        },function(err,results){
            if(err){
                console.log(err);
                console.log('************出现了异常**********');
                cb(false);
                return;
            }
            var orderInfo = results.qryOrder;
            var experienceTime = results.qryExperienceTime;
            var endDate = "";
            var now = new Date(new Date().getTime()-8*60*60*1000);
            var orderEndDate = new Date(orderInfo[0].new_jifei_endtime);
            //如果订单存在，则判断订单的结束时间
            var endTime = orderEndDate.getTime();
            var nowTime = now.getTime();
            if((nowTime - endTime) > 0){//如果订单过期
                //当前时间+工厂app体验时间
                // endDate = new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()+experienceTime,now.getHours(),now.getMinutes(), now.getSeconds()));
                endDate = new Date(now.getTime()+24*60*60*1000*experienceTime+8*60*60*1000);
            }else{
                //订单结束时间＋工厂app体验时间
                // endDate = new Date(Date.UTC(orderEndDate.getFullYear(),orderEndDate.getMonth(),orderEndDate.getDate()+experienceTime,orderEndDate.getHours(),orderEndDate.getMinutes(), orderEndDate.getSeconds()));
                endDate = new Date(orderEndDate.getTime()+24*60*60*1000*experienceTime);
            }
            var updOrderArgs = {};
            updOrderArgs.entityname = 'new_jifei_order';
            updOrderArgs.data = '[{"Key":"new_jifei_orderid","Value":"'+orderInfo[0].new_jifei_orderid+'"},'+
                                '{"Key":"new_jifei_endtime","Value":"'+Time.format(endDate,'yyyy-MM-dd HH:mm:ss')+'"}]';
            console.log(updOrderArgs);
            console.log('*********开始更新用户订单*************');
            client.Update(updOrderArgs,function(err,result){
                if(err){
                    console.log('更新用户时长出错');
                    return;
                }
                var off = null;
                for(var a in result.UpdateResult){
                    if(a){
                        off = true;
                        break;
                    }
                }
                console.log('************更新订单结果**********');
                console.log(result);
                if(off){
                    var updData = JSON.parse(result.UpdateResult);
                    if(updData.issuccess){
                        cb(true);
                        console.log('增加用户app体验时长成功');
                    }else{
                        cb(false);
                        console.log('增加用户app体验时长失败');
                    }
                }
            });                          
        });
   });
}


