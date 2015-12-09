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
	        				return res.send(jsoncallback+"({resultCode:'2',info:'卡密查询失败,请稍后重试'})");
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
			        			return res.send(jsoncallback+"({resultCode:'1',info:'对不起,您输入的密码不正确'})");
			        		}
			        		if(resuData.new_jifei_flag == '1'){
			        			return res.send(jsoncallback+"({resultCode:'1',info:'对不起,该卡号已经充值'})");
			        		}
			        		callback(null,resuData);
			        	}else{
			        		return res.send(jsoncallback+"({resultCode:'1',info:'对不起,您输入的卡号不存在'})");
			        	}
			        })
				},
				qryUser : ['qryCard',function(callback,result){//获取用户信息
					var userArgs = {};
	        		userArgs.entityname = "new_jifei_customer";
	        		userArgs.filter = '[{"Logical":"or","Conditions":[{"Key":"new_useraccount","Operator":"=","Value":"'+user+'"}]}]';
			        userArgs.fields = 'new_jifei_customerid,new_type,createdon';
		          	userArgs.orderby = 'createdon desc';
			        userArgs.pagesize = 1;
			        userArgs.pageindex = 1;
			        console.log('**********查询用户********');
			        client.Query(userArgs,function(err,result){
			        	if(err){
			        		console.log(err);
			        		console.log('*********查询用户失败**********');
			        		return res.send(jsoncallback+"({resultCode:'2',info:'用户查询失败,请稍后重试'})");
			        	}
			        	var off = null;
			        	console.log(result);
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
											var upduserData = JSON.parse(result.UpdateResult)[0];
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
						    	return res.send(jsoncallback+"({resultCode:'1',info:'对不起,您充值的帐号不存在'})");	
						    }
			        	}else{
			        		console.log('***************用户不存在****************');
	        				return res.send(jsoncallback+"({resultCode:'1',info:'对不起,您充值的帐号不存在'})");	
			        	}
			        });
				}],
				qryOrder : ['qryCard','qryUser',function(callback,result){
					var userId = result.qryUser.new_jifei_customerid;
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
						    return res.send(jsoncallback+"({resultCode:'2',info:'服务器繁忙，请稍后重试'})");
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
				}],
				convertOrder : ['qryCard','qryUser','qryOrder',function(callback,result){
					var off = result.qryOrder.off;
					var qryCardData = result.qryCard;
					var qryUserData = result.qryUser;
					if(off){
						console.log('*********************用户存在订单********************8');
						var orderData = result.qryOrder.data;	
						var orderId = orderData.new_jifei_orderid;
						console.log(orderData.new_jifei_endtime);
						var endTime = new Date(orderData.new_jifei_endtime).getTime();
						var nowTime = new Date().getTime();
						var month =  parseInt(qryCardData.new_usemonth);
						var endDate = null;
						//判断订单结束时间是否大于当前时间
						if((nowTime-endTime) >= 0){
							endTime = new Date(nowTime.getFullYear(), (nowTime.getMonth()) + month, nowTime.getDate(), nowTime.getHours(), nowTime.getMinutes(), nowTime.getSeconds());
							endDate = Time.format(endTime.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
						}else{
							endTime = new Date(orderData.new_jifei_endtime);
							var endTime2 = new Date(endTime.getFullYear(), (endTime.getMonth()) + month, endTime.getDate(), endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());
							endDate = Time.format(endTime2.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
						}
						var updOrderArgs = {};
						updOrderArgs.entityname ='new_jifei_order';
						updOrderArgs.data = '[{"Key":"new_jifei_orderid","Value":"'+orderId+'"},'+
											'{"Key":"new_jifei_endtime","Value":"'+endDate+'"}]';
						console.log(updOrderArgs);
						console.log('************************开始更新用户订单上网截止日*******************');
						client.Update(updOrderArgs,function(err,result){
							if(err){
								console.log('******************用户订单表更新失败*****************');
								console.log(err);
								return res.send(jsoncallback+"({resultCode:'2',info:'服务器繁忙，请稍后重试'})");
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
								var orderUpdData = JSON.parse(result.UpdateResult);
								if(orderUpdData.issuccess){
									var convertOrderData = {};
									convertOrderData.endTime = endDate;
									callback(null,convertOrderData);
								}else{
		        					res.send(jsoncallback+"({resultCode:'1',info:'兑换失败'})");	
								}
							}else{	
								console.log('***************订单更新失败*****************');
		        				res.send(jsoncallback+"({resultCode:'1',info:'兑换失败'})");
							}
						});
					}else{
						console.log('***************用户没有订单****************');
		        		var money = parseFloat(qryCardData.new_jifei_money);
		        		var month = parseInt(qryCardData.new_usemonth);
		        		var nowDate = new Date();
		        		var endDate = new Date(nowDate.getFullYear(), (nowDate.getMonth()) + month, nowDate.getDate(), nowDate.getHours(), nowDate.getMinutes(), nowDate.getSeconds());  
						var endTime = Time.format(endDate.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
						var startTime = Time.format(nowDate.toLocaleString(),'yyyy-MM-dd HH:mm:ss');
		        		var createArgs = {};
		        		createArgs.entityname ='new_jifei_order';
						createArgs.data = '[{"Key":"new_jifei_customerid","Value":"'+qryUserData.new_jifei_customerid+'"},'+
											'{"Key":"new_jifei_orderamount","Value":"'+money+'"},'+
											'{"Key":"new_jifei_ordersum","Value":"1"},'+
											'{"Key":"new_jifei_taketype","Value":"0"},'+
											'{"Key":"new_jifei_begintime","Value":"'+startTime+'"},'+
											'{"Key":"new_jifei_endtime","Value":"'+endTime+'"}]';
		        		console.log(createArgs);
						console.log('***************开始插入订单****************');
		        		client.Create(createArgs,function(err,result){
		        			if(err){
		        				console.log(err);
		        				console.log('***********订单插入失败***********');
		        				return res.send(jsoncallback+"({resultCode:'2',info:'服务器繁忙，请稍后重试'})");
		        			}
		        			var off = null;
		        			console.log(result);
		        			for(var a in result.CreateResult){
		        				if(a){
		        					off = true;
		        					break;
		        				}
		        			}
		        			if(off){
		        				var createData = JSON.parse(result.CreateResult);
		        				if(createData.issuccess){
		        					var convertOrderData = {};
		        					convertOrderData.endTime = endTime;
		        					callback(null, convertOrderData);
		        				}else{
		        					rres.send(jsoncallback+"({resultCode:'1',info:'兑换失败'})");
		        				}
		        			}else{
		        				console.log('***************订单插入失败*****************');
		        				res.send(jsoncallback+"({resultCode:'1',info:'兑换失败'})");
		        			}
		        		});
					}
				}],
				updCard : ['qryCard','qryUser','qryOrder','convertOrder',function(callback,result){
					console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>订单表更新成功<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
			        //订单充值记录插入数据
		        	var userData = result.qryUser;
		        	var cardData = result.qryCard;
		        	var convertOrderData = result.convertOrder;
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
								console.log('****************'+cardkey+'的兑换状态更新成功success*************');
							}else{
								console.log('****************'+cardkey+'的兑换状态更新失败err*************');
							}
						}else{
							console.log('****************'+cardkey+'的兑换状态更新失败err*************');
						}
					});


		        	var cardpwdrecord = {};
		        	cardpwdrecord.entityname = 'new_jifie_cardpwdrecord';
		        	cardpwdrecord.data = '[{"Key":"new_jifei_customerid","Value":"'+userData.new_jifei_customerid+'"},'+
										'{"Key":"new_jifei_mobile","Value":"'+user+'"},'+
										'{"Key":"new_jifei_cardno","Value":"'+cardkey+'"},'+
										'{"Key":"new_jifei_cardkey","Value":"'+cardpwd+'"},'+
										'{"Key":"new_jifei_money","Value":"'+cardData.new_jifei_money+'"},'+
										'{"Key":"new_jifei_usemonth","Value":"'+cardData.new_jifei_usemonth+'"},'+
										'{"Key":"new_jifei_cardagent","Value":"'+convertOrderData.endTime+'"},'+
										'{"Key":"new_jifei_validtime","Value":"'+Time.format(new Date().toLocaleString(),'yyyy-MM-dd HH:mm:ss')+'"}]';
		        	console.log('开始保存充值记录<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
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
		        		if(off){
		        			var recordData = JSON.parse(result.CreateResult);
		        			if(recordData.issuccess){
		        				console.log('************'+cardkey+'的充值记录表保存成功success*************');
		        			}else{
		        				console.log('************'+cardkey+'的充值记录表保存失败err*************');
		        			}
		        		}else{
		        			console.log('************'+cardkey+'的充值记录表保存失败err*************');
		        		}
		        	});
		        	//由于订单表已经更新，所以无论兑换表和充值记录表是否更新成功,都需要返回用户兑换成功的信息
			        res.send(jsoncallback+"({resultCode:'0',info:'兑换成功'})");
				}]
			},function(err,results){
				if(err){
					console.log(err);
					console.log('*************发生了错误**********');
					res.send(jsoncallback+"({resultCode:'2',info:'服务器繁忙，请稍后重试'})");
				}
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
	// var data = req.body;
	var data = req.query;
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
			        			return res.json({resultCode:'1',info:'对不起,您输入的密码不正确'});
			        		}
			        		if(resuData.new_jifei_flag == '1'){
			        			return res.json({resultCode:'1',info:'对不起,该卡号已经充值'});
			        		}
			        		callback(null,resuData);
			        	}else{
			        		return res.json({resultCode:'1',info:'对不起,您输入的卡号不存在'});
			        	}
			        })
				},
				qryUser : ['qryCard',function(callback,result){//获取用户信息
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
			        		return res.json({resultCode:'2',info:'用户查询失败,请稍后重试'});
			        	}
			        	var off = null;
			        	console.log(result);
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
											var upduserData = JSON.parse(result.UpdateResult)[0];
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
						    	return res.json({resultCode:'1',info:'对不起,您充值的帐号不存在'});	
						    }
			        	}else{
			        		console.log('***************用户不存在****************');
	        				return res.json({resultCode:'1',info:'对不起,您充值的帐号不存在'});	
			        	}
			        });
				}],
				qryOrder : ['qryCard','qryUser',function(callback,result){
					var userId = result.qryUser.new_jifei_customerid;
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
				}],
				updCard : ['qryCard','qryUser','qryOrder',function(callback,result){
					var orderData = result.qryOrder;
					if(!orderData.off){
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
								console.log('****************'+cardkey+'的兑换状态更新成功success*************');
						        res.json({resultCode:'0',info:'兑换成功'});
						        callback(null,null);
							}else{
								console.log('****************'+cardkey+'的兑换状态更新失败err*************');
							}
						}else{
							console.log('****************'+cardkey+'的兑换状态更新失败err*************');
						}
					});

		        	
		        	
				}]
			},function(err,results){
				if(err){
					console.log(err);
					console.log('*************发生了错误**********');
					res.json({resultCode:'2',info:'服务器繁忙，请稍后重试'});
				}
				var userData = results.qryUser;
				var orderData = results.qryOrder;
				var cardData = results.qryCard;
				/*计算订单时间*/
				//订单总表的开始时间为当前订单认证表结束时间
				var month = parseInt(cardData.new_usemonth);
				console.log(month);
	    		var orderSumBeginTime = Time.format(new Date(orderData.data.new_jifei_endtime).toLocaleString(),'yyyy-MM-dd HH:mm:ss');
	    		var endTime = new Date(orderData.data.new_jifei_endtime).getTime();
	    		var now = new Date().getTime();
	    		console.log(orderData.data.new_jifei_endtime);
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
									'{"Key":"new_jifei_validtime","Value":"'+Time.format(new Date().toLocaleString(),'yyyy-MM-dd HH:mm:ss')+'"}]';
	        	console.log('开始保存充值记录<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
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
	        		if(off){
	        			var recordData = JSON.parse(result.CreateResult);
	        			if(recordData.issuccess){
	        				console.log('************'+cardkey+'的充值记录表保存成功success*************');
	        				console.log('>>>>>>>>>>>>>>>>>>>>>订单总表开始添加记录<<<<<<<<<<<<<<<<<<<<<<<<<<<');
			        		var createOrderData = {};
			        		createOrderData.client = client;
							createOrderData.new_jife_from = 2;
							createOrderData.new_jifei_customerid = userData.new_jifei_customerid;
							createOrderData.new_jifei_factoryid = userData.new_jifei_factoryid;
							createOrderData.new_jifei_begintime = orderSumBeginTime;
							createOrderData.new_jifei_endtime = endDate;
							createOrderData.new_jifei_fromid = recordData.extra[0].Value;
							createOrderData.new_jifei_orderamount = cardData.new_jifei_money;
							createOrderData.new_jifei_ordersum = 1;
							createOrderData.new_jifei_packageid = '';
							Utils.createOrderSum(createOrderData);
	        			}else{
	        				console.log('************'+cardkey+'的充值记录表保存失败err*************');
	        			}
	        		}else{
	        			console.log('************'+cardkey+'的充值记录表保存失败err*************');
	        		}
	        	});
			});
		});
	}catch(e){
		console.log('>>>>>>>>>>>>>>>>发生了异常<<<<<<<<<<<<<<<<<');
		console.log(e);
		res.json({resultCode:'2',info:'服务器繁忙，请稍后重试'});
	}
}


function qryOrder(jsoncallback,data){
	var client = data.client;
	var callback= data.callback;
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
    				return res.send(jsoncallback+"({resultCode:'2',info:'卡密查询失败,请稍后重试'})");
    			}
    			return res.json({resultCode:'1',info:'对不起,您输入的密码不正确'});
    		}
    		if(resuData.new_jifei_flag == '1'){
    			if(jsoncallback){
    				return res.send(jsoncallback+"({resultCode:'2',info:'卡密查询失败,请稍后重试'})");
    			}
    			return res.json({resultCode:'1',info:'对不起,该卡号已经充值'});
    		}
    		callback(null,resuData);
    	}else{
    		if(jsoncallback){
				return res.send(jsoncallback+"({resultCode:'2',info:'卡密查询失败,请稍后重试'})");
			}
    		return res.json({resultCode:'1',info:'对不起,您输入的卡号不存在'});
    	}
    })
}