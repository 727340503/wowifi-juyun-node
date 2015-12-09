var soap = require('soap');
var settings = require('../../settings');
var Time = require('./time');
var async = require('async');
var Utils = require('../util/xrmUtil');

//webservice  卡密充值
exports.webcardRech = function(req,res){
	var data = req.query;
	// var data = req.query;
	try{
		console.log(data);
		var cardkey = data.card;
		var cardpwd = data.pwd;
		var user = data.user;
		var jsoncallback = data.callback;
		if(!cardkey || cardkey == '' || !cardpwd || cardpwd == '' || !user || user == ''){
			return  res.send(jsoncallback+"({resultCode:'1',info:'参数不能为空'})");
		}
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				return res.send(jsoncallback+"({resultCode:'2',info:'连接远程服务器出错'})");
			}
			async.auto({
				qryCard:function(callback){//判断用户卡密信息 

					var qryData = {};
					qryData.callback = callback;
					qryData.client= client;
					qryData.cardkey = cardkey;
					qryData.cardpwd = cardpwd;
					qryCardInfo(jsoncallback,qryData,res);
				
				},
				qryUser : ['qryCard',function(callback,result){//获取用户信息

					var qryuserData = {};
					qryuserData.user = user;
					qryuserData.callback = callback;
					qryuserData.client = client;
					qryUser(jsoncallback,qryuserData,res);

				}],
				qryOrder : ['qryCard','qryUser',function(callback,result){

					var qryOrderData = {};
					qryOrderData.userId = result.qryUser.new_jifei_customerid;
					qryOrderData.client = client;
					qryOrderData.callback = callback;
					qryuserOrder(jsoncallback,qryOrderData,res);	

				}],
				updCard : ['qryCard','qryUser','qryOrder',function(callback,result){

					var updCardData = {};
					updCardData.data = result;
					updCardData.client = client;
					updCardData.callback = callback;
					updCard(jsoncallback,updCardData,res);

				}]
			},function(err,results){
				if(err){
					console.log(err);
					console.log('*************发生了错误**********');
					res.send(jsoncallback+"({resultCode:'2',info:'服务器繁忙，请稍后重试'})");
				}

				var changeData = {};
				changeData.qryUser = results.qryUser;
				changeData.qryOrder = results.qryOrder;
				changeData.qryCard = results.qryCard;
				changeData.user = user;
				changeData.cardkey = cardkey;
				changeData.cardpwd = cardpwd;
				changeData.client = client;
				cardChange(changeData);

			})
		});
	}catch(e){
		console.log('>>>>>>>>>>>>>>>>发生了异常<<<<<<<<<<<<<<<<<');
		console.log(e);
		res.send(jsoncallback+"({resultCode:'2',info:'服务器繁忙，请稍后重试'})");
	}
}

//app卡密充值
exports.cardRech = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var cardkey = data.card;
		var cardpwd = data.pwd;
		var user = data.user;
		if(!cardkey || cardkey == '' || !cardpwd || cardpwd == '' || !user || user == ''){
			return res.json({resultCode:'1',info:'参数不能为空'});
		}
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				return res.json({resultCode:'2',info:'连接远程服务器出错'});
			}
			async.auto({
				qryCard:function(callback){//判断用户卡密信息 
					var qryData = {};
					qryData.callback = callback;
					qryData.client= client;
					qryData.cardkey = cardkey;
					qryData.cardpwd = cardpwd;
					qryCardInfo(null,qryData,res);
				},
				qryUser : ['qryCard',function(callback,result){//获取用户信息

					var qryuserData = {};
					qryuserData.user = user;
					qryuserData.callback = callback;
					qryuserData.client = client;
					qryUser(null,qryuserData,res);
					
				}],
				qryOrder : ['qryCard','qryUser',function(callback,result){

					var qryOrderData = {};
					qryOrderData.userId = result.qryUser.new_jifei_customerid;
					qryOrderData.client = client;
					qryOrderData.callback = callback;
					qryuserOrder(null,qryOrderData,res);

				}],
				updCard : ['qryCard','qryUser','qryOrder',function(callback,result){

					var updCardData = {};
					updCardData.data = result;
					updCardData.client = client;
					updCardData.callback = callback;
					updCard(null,updCardData,res);
		        	
				}]
			},function(err,results){
				if(err){
					console.log(err);
					console.log('*************发生了错误**********');
					res.json({resultCode:'2',info:'服务器繁忙，请稍后重试'});
				}

				var changeData = {};
				changeData.qryUser = results.qryUser;
				changeData.qryOrder = results.qryOrder;
				changeData.qryCard = results.qryCard;
				changeData.user = user;
				changeData.cardkey = cardkey;
				changeData.cardpwd = cardpwd;
				changeData.client = client;
				cardChange(changeData);

			});
		});
	}catch(e){
		console.log('>>>>>>>>>>>>>>>>发生了异常<<<<<<<<<<<<<<<<<');
		console.log(e);
		res.json({resultCode:'2',info:'服务器繁忙，请稍后重试'});
	}
}


//查询用户卡密兑换记录
exports.qryUserCards = function(req,res){
	var data = req.query;
	try{

		var userId = data.user;
		var pagesize = data.pagesize;
		var pageindex = data.pageindex;
		if(!userId || userId == ''){
			return res.json({resultCode:'1',info:'用户参数不能为空'});
		}
		if(!pagesize || pagesize == ''){
			return res.json({resultCode:'1',info:'每页显示数量不能为空'});
		}
		if(!pageindex || pageindex == ''){
			return res.json({resultCode:'1',info:'当前页数不能为空'});
		}
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('******************网络连接异常***************');
				return res.json({resultCode:'2',info:'网络连接错误，请稍候重试'});
			}
			async.auto({
				qryAllPage:function(callback){//查询总页数
					var args = {};
					args.entityname = 'new_jifie_cardpwdrecord';
				    args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jifei_customerid","Operator":"=","Value":"'+userId+'"}]}]';
				    args.fields = 'createdon';
				  	args.orderby = 'createdon desc';
				    args.pagesize = 1000000000;
				    args.pageindex = 1;
				    client.Query(args,function(err,result){
				    	if(err){
				    		console.log(err);
				    		console.log('********************查询报错*********************8');
				    		return res.json({resultCode:'2',info:'查询失败，请稍候重试'});
				    	}
				    	var off = null;
				    	for(var a in result.QueryResult){
				    		if(a){
				    			off = true;
				    			break;
				    		}
				    	}
				    	if(off){
				    		var qryPageData = JSON.parse(result.QueryResult);
				    		if(qryPageData.issuccess != undefined || qryPageData.issuccess == false){
				    			callback(null,0);
				    		}else{
				    			callback(null,qryPageData.length);
				    		}
				    	}else{
				    		callback(null,0);
				    	}
				    });
				},
				qryCards : ['qryAllPage',function(callback,result){//查询用户卡密充值记录
					var args = {};
					args.entityname = 'new_jifie_cardpwdrecord';
				    args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_jifei_customerid","Operator":"=","Value":"'+userId+'"}]}]';
				    args.fields = 'new_jifie_cardpwdrecordid,new_jifei_cardno,new_jifei_mobile,new_jifei_validtime,new_jifei_money,new_jifei_addtime,createdon';
				  	args.orderby = 'createdon desc';
				    args.pagesize = pagesize;
				    args.pageindex = pageindex;
				    client.Query(args,function(err,result){
				    	if(err){
				    		console.log(err);
				    		console.log('********************查询报错*********************8');
				    		return res.json({resultCode:'2',info:'查询失败，请稍候重试'});
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
				    		var qryCardsData = JSON.parse(result.QueryResult);
				    		if(qryCardsData.issuccess != undefined || qryCardsData.issuccess == false){
				    			return res.json({resultCode:'1',info:'参数不合法'});
				    		}else{
				    			callback(null,qryCardsData);
				    		}
				    	}else{
				    		var resuData = new Array();
				    		callback(null,resuData);
				    	}
				    });
				}]
			},function(err,results){
				console.log('**********************查询完毕，返回用户结果********************');
				var allPage = results.qryAllPage;
				var cards = results.qryCards;
				res.json({resultCode:'0',info:'',allPage:Math.ceil(allPage/pagesize),data:cards});
			});
			
		});
	}catch(e){
		console.log(e);
		console.log('**********************************');
		res.json({resultCode:'2',info:'服务器繁忙，请稍后重试'});
	}
}

//查询卡密信息
function qryCardInfo(jsoncallback,data,res){
	var client = data.client;
	var callback= data.callback;
	var cardkey = data.cardkey;
	var cardpwd = data.cardpwd;
	var qryArgs = {};
    qryArgs.entityname = 'new_jifei_cardname';
    qryArgs.filter = '[{"Logical":"or","Conditions":[{"Key":"new_jifei_cardno","Operator":"=","Value":"'+cardkey+'"}]}]';
    qryArgs.fields = 'new_jifei_cardnameid,new_jifei_cardno,new_jifei_flag,new_jifei_cardkey,new_jifei_cardagent,new_jifei_money,new_usemonth,createdon';
  	qryArgs.orderby = 'createdon desc';
    qryArgs.pagesize = 1;
    qryArgs.pageindex = 1;
    console.log('***********查询卡密***********');
    client.Query(qryArgs,function(err,result){
    	if(err){
    		console.log(err);
    		if(jsoncallback){
    			return res.send(jsoncallback+"({resultCode:'2',info:'卡密查询失败,请稍后重试'})");
    		}
			return res.json({resultCode:'2',info:'卡密查询失败,请稍后重试'});
    	}
    	console.log(result);
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}

    	if(off){
    		var resuData = JSON.parse(result.QueryResult)[0];
    		if(cardpwd != resuData.new_jifei_cardkey){
    			if(jsoncallback){
    				return res.send(jsoncallback+"({resultCode:'1',info:'对不起,您输入的密码不正确'})");
    			}
    			return res.json({resultCode:'1',info:'对不起,您输入的密码不正确'});
    		}
    		if(resuData.new_jifei_flag == '1'){
    			if(jsoncallback){
    				return res.send(jsoncallback+"({resultCode:'1',info:'对不起,该卡号已经充值'})");
    			}
    			return res.json({resultCode:'1',info:'对不起,该卡号已经充值'});
    		}
    		callback(null,resuData);
    	}else{
    		if(jsoncallback){
				return res.send(jsoncallback+"({resultCode:'1',info:'对不起,您输入的卡号不存在'})");
			}
    		return res.json({resultCode:'1',info:'对不起,您输入的卡号不存在'});
    	}
    })
}

//查询用户
function qryUser(jsoncallback,data,res){
	var user = data.user;
	var client = data.client;
	var callback = data.callback;
	var userArgs = {};
	userArgs.entityname = "new_jifei_customer";
	userArgs.filter = '[{"Logical":"or","Conditions":[{"Key":"new_useraccount","Operator":"=","Value":"'+user+'"}]}]';
    userArgs.fields = 'new_jifei_customerid,new_jifei_factoryid,new_type,createdon';
  	userArgs.orderby = 'createdon desc';
    userArgs.pagesize = 1;
    userArgs.pageindex = 1;
    console.log('**********查询用户********');
    client.Query(userArgs,function(err,result){
    	if(err){
    		console.log(err);
    		console.log('*********查询用户失败**********');
    		if(jsoncallback){
				return res.send(jsoncallback+"({resultCode:'2',info:'用户查询失败,请稍后重试'})");
			}
    		return res.json({resultCode:'2',info:'用户查询失败,请稍后重试'});
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	if(off){
    		var userData = JSON.parse(result.QueryResult)[0];
    		if(userData.new_jifei_customerid && userData.new_jifei_customerid != ''){
    			//判断用户是否为体验用户,如果是更改为自营用户
    			if(userData.new_type == '1'){
    				var updUserArgs = {};
					updUserArgs.entityname ='new_jifei_customer';
					updUserArgs.data = '[{"Key":"new_jifei_customerid","Value":"'+userData.new_jifei_customerid+'"},'+
										'{"Key":"new_type","Value":"5"}]';
					client.Update(updUserArgs,function(err,result){
						if(err){
							console.log(err);
							console.log('*****************更新用户类型出错*****************8');
						}
						var off = null;
						for(var a in result.UpdateResult){
							if(a){
								off = true;
								break;
							}
						}
						if(off){
							var upduserData = JSON.parse(result.UpdateResult);
							if(upduserData.issuccess){
								console.log('****************用户改为自营成功success******************');
							}
						}else{
							console.log('****************用户改为自营失败err******************');
						}
					});
    			}
    			callback(null,userData);
		    }else{
		    	if(jsoncallback){
					return res.send(jsoncallback+"({resultCode:'1',info:'对不起,您充值的帐号不存在'})");
				}
		    	return res.json({resultCode:'1',info:'对不起,您充值的帐号不存在'});	
		    }
    	}else{
    		console.log('***************用户不存在****************');
    		if(jsoncallback){
				return res.send(jsoncallback+"({resultCode:'1',info:'对不起,您充值的帐号不存在'})");
			}
			return res.json({resultCode:'1',info:'对不起,您充值的帐号不存在'});	
    	}
    });
}

//查询用户订单
function qryuserOrder(jsoncallback,data,res){
	var callback = data.callback;
	var client = data.client;
	var userId = data.userId;
	var orderArgs = {};
	orderArgs.entityname = "new_jifei_order";
	orderArgs.filter = '[{"Logical":"or","Conditions":[{"Key":"new_jifei_customerid","Operator":"=","Value":"'+userId+'"}]}]';
    orderArgs.fields = 'new_jifei_customerid,new_jifei_endtime,new_jifei_orderid,createdon';
  	orderArgs.orderby = 'createdon desc';
    orderArgs.pagesize = 1;
    orderArgs.pageindex = 1;
    console.log('*************开始查询用户订单*************');
	console.log(orderArgs);
    client.Query(orderArgs,function(err,result){
    	if(err){
    		console.log(err);
    		console.log('***********查询用户订单出错***********');
    		if(jsoncallback){
				return res.send(jsoncallback+"({resultCode:'2',info:'服务器繁忙，请稍后重试'})");
			}
		    return res.json({resultCode:'2',info:'服务器繁忙，请稍后重试'});
    	}
    	var off = null;
    	for(var a in result.QueryResult){
    		if(a){
    			off = true;
    			break;
    		}
    	}
    	var orderData = {};
    	if(off){
    		orderData.off = off;
    		orderData.data = JSON.parse(result.QueryResult)[0];
    		callback(null,orderData);
    	}else{	
    		orderData.off = off;
    		callback(null,orderData);
    	}
    });
}


//更新卡密为已兑换状态
function updCard(jsoncallback,data,res){
	var result = data.data;
	var client = data.client;
	var callback = data.callback;
	var orderData = result.qryOrder;
	if(!orderData.off){
		if(jsoncallback){
			return res.send(jsoncallback+"({resultCode:'1',info:'帐号不存在订单，请联系客服'})");
		}
		return res.json({resultCode:'1',info:'帐号不存在订单，请联系客服'});
	}
	console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>订单表存在可以充值<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    //订单充值记录插入数据
	var userData = result.qryUser;
	var cardData = result.qryCard;
	var updOrderArgs = {};
	updOrderArgs.entityname = 'new_jifei_cardname';
	updOrderArgs.data = '[{"Key":"new_jifei_cardnameid","Value":"'+cardData.new_jifei_cardnameid+'"},'+
						'{"Key":"new_jifei_flag","Value":"1"}]';
	console.log(updOrderArgs);
	console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>开始更新卡密兑换状态');
	client.Update(updOrderArgs,function(err,result){
		if(err){
			console.log('****************'+cardkey+'的兑换状态更新出错error*************');
			console.log(err);
			if(jsoncallback){
				return res.send(jsoncallback+"({resultCode:'1',info:'兑换失败,请稍候重试'})");
			}
	        res.json({resultCode:'1',info:'兑换失败,请稍候重试'});	
		}
		var off = null;
		for(var a in result.UpdateResult){
			if(a){
				off = true;
				break;
			}
		}
		console.log(result);
		if(off){
			var updData = JSON.parse(result.UpdateResult);
			if(updData.issuccess){
				//由于订单表已经更新，所以无论兑换表和充值记录表是否更新成功,都需要返回用户兑换成功的信息
				console.log('****************兑换状态更新成功success*************');
				if(jsoncallback){
					res.send(jsoncallback+"({resultCode:'0',info:'兑换成功'})");
				}else{
		        	res.json({resultCode:'0',info:'兑换成功'});
				}
		        callback(null,null);
			}else{
				console.log('****************兑换状态更新失败err*************');
				if(jsoncallback){
					return res.send(jsoncallback+"({resultCode:'1',info:'兑换失败,请稍候重试'})");
				}
		        res.json({resultCode:'1',info:'兑换失败,请稍候重试'});
			}
		}else{
			console.log('****************兑换状态更新失败err*************');
			if(jsoncallback){
				return res.send(jsoncallback+"({resultCode:'1',info:'兑换失败,请稍候重试'})");
			}
	        res.json({resultCode:'1',info:'兑换失败,请稍候重试'});	
		}
	});
}

//卡密更新为已兑换后插入卡密充值记录和总表数据
function cardChange(data){
	var userData = data.qryUser;
	var orderData = data.qryOrder;
	var cardData = data.qryCard;
	var user = data.user;
	var cardkey = data.cardkey;
	var cardpwd = data.cardpwd;
	var client = data.client;
	/*计算订单时间*/
	//订单总表的开始时间为当前订单认证表结束时间
	var month = parseInt(cardData.new_usemonth);
	var orderSumBeginTime = Time.format(new Date(orderData.data.new_jifei_endtime).toLocaleString(),'yyyy-MM-dd HH:mm:ss');
	var endTime = new Date(orderData.data.new_jifei_endtime).getTime();
	var now = new Date().getTime();
	if(now >= endTime){//判断结束时间是否大于当前时间
		endTime = now;
		//将订单总表的开始时间定位当前时间
		orderSumBeginTime = Time.format(new Date(now).toLocaleString(),'yyyy-MM-dd HH:mm:ss');
	}
	endTime = new Date(endTime);
	var endTime1 = new Date(endTime.getFullYear(), (endTime.getMonth()) + month, endTime.getDate(), endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());
	var endDate = Time.format(endTime1.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
	/*订单结束时间计算完毕*/

	var cardpwdrecord = {};
	cardpwdrecord.entityname = 'new_jifie_cardpwdrecord';
	cardpwdrecord.data = '[{"Key":"new_jifei_customerid","Value":"'+userData.new_jifei_customerid+'"},'+
						'{"Key":"new_jifei_mobile","Value":"'+user+'"},'+
						'{"Key":"new_jifei_cardno","Value":"'+cardkey+'"},'+
						'{"Key":"new_jifei_cardkey","Value":"'+cardpwd+'"},'+
						'{"Key":"new_jifei_money","Value":"'+cardData.new_jifei_money+'"},'+
						'{"Key":"new_jifei_usemonth","Value":"'+cardData.new_usemonth+'"},'+
						'{"Key":"new_jifei_cardagent","Value":"'+cardData.new_jifei_cardagent+'"},'+
						'{"Key":"new_jifei_addtime","Value":"'+Time.format(new Date().toLocaleString(),"yyyy-MM-dd HH:mm:ss")+'"},'+
						'{"Key":"new_jifei_validtime","Value":"'+orderSumBeginTime+'"}]';
	console.log('开始保存充值记录<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
	console.log(cardpwdrecord);
	client.Create(cardpwdrecord,function(err,result){
		if(err){
			console.log('****************'+cardkey+'的充值记录表保存出错error*************');
			console.log(err);
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
			var recordData = JSON.parse(result.CreateResult);
			if(recordData.issuccess){
				console.log('************'+cardkey+'的充值记录表保存成功success*************');
				console.log('>>>>>>>>>>>>>>>>>>>>>订单总表开始添加记录<<<<<<<<<<<<<<<<<<<<<<<<<<<');
        		var packageId = '';
        		if(month == 1){
        			packageId = '35CC3F00-4D42-E511-9804-C81F66BF2DD0';
        		}else if(month == 2){
        			packageId = '1B071DB4-0D46-E511-9804-C81F66BF2DD0';
        		}else if(month == 3){
        			packageId = 'A0142B16-4D42-E511-9804-C81F66BF2DD0';
        		}else if(month == 6){
        			packageId = '38C9B32B-4D42-E511-9804-C81F66BF2DD0';
        		}else if(month == 12){
        			packageId = '0A46E648-4D42-E511-9804-C81F66BF2DD0';
        		}else{
        			packageId = '35CC3F00-4D42-E511-9804-C81F66BF2DD0';
        		}
        		var createOrderData = {};
        		createOrderData.client = client;
				createOrderData.new_jife_from = 2;//卡密支付来源的代码
				createOrderData.new_jifei_customerid = userData.new_jifei_customerid;
				createOrderData.new_jifei_factoryid = userData.new_jifei_factoryid;
				createOrderData.new_jifei_begintime = orderSumBeginTime;
				createOrderData.new_jifei_endtime = endDate;
				createOrderData.new_jifei_fromid = recordData.extra[0].Value;
				createOrderData.new_jifei_orderamount = cardData.new_jifei_money;
				createOrderData.new_jifei_ordersum = 1;//购买数量
				createOrderData.new_pay = 2;//卡密支付的代码
				createOrderData.new_jifei_packageid = packageId;
				Utils.createOrderSum(createOrderData,function(flag){
					if(flag){
						var updArgs = {};
						updArgs.client = client;
						updArgs.orderId = orderData.data.new_jifei_orderid;
						updArgs.endTime = endDate;
						Utils.updOrderStopTime(updArgs,function(flag){
							if(flag){
								console.log('***********************更新用户上网时间成功***********************');
							}else{
								console.log('*********************更新用户上网时间失败******************');
							}
						});
					}else{
						console.log('***********************'+cardkey+'的订单总表保存失败************************');
					}
				});
			}else{
				console.log('************'+cardkey+'的卡密兑换充值记录保存失败err*************');
			}
		}else{
			console.log('************'+cardkey+'的卡密兑换记录表保存失败err*************');
		}
	});
}