

exports.createOrderSum = function(data,cb){
	var client = data.client;
	var args = {};
	args.entityname = 'new_jifei_ordersum';
	args.data = '[{"Key":"new_jife_from","Value":"' +data.new_jife_from+ '"},'+//来源
				 '{"Key":"new_jifei_customerid","Value":"'+data.new_jifei_customerid+'"},'+//客户id
				 '{"Key":"new_jifei_factoryid","Value":"'+data.new_jifei_factoryid+'"},'+//工厂id
				 '{"Key":"new_jifei_begintime","Value":"'+data.new_jifei_begintime+'"},'+//生效日期
				 '{"Key":"new_jifei_endtime","Value":"'+data.new_jifei_endtime+'"},'+//失效日期
				 '{"Key":"new_jifei_fromid","Value":"'+data.new_jifei_fromid+'"},'+//订单id
				 '{"Key":"new_jifei_orderamount","Value":"'+data.new_jifei_orderamount+'"},'+//订单金额
				 '{"Key":"new_jifei_ordersum","Value":"'+data.new_jifei_ordersum+'"},'+//订购数量
				 '{"Key":"new_jifei_taketype","Value":"0"},'+//生效方式
				 '{"Key":"new_pay","Value":"'+data.new_pay+'"},'+//付款方式
				 '{"Key":"new_jifei_packageid","Value":"'+data.new_jifei_packageid+'"}]';//套餐id
	console.log(args);
	client.Create(args,function(err,result){
		if(err){
			console.log(err);
			cb(false);
		}
		var off = null;
		for(var a in result.CreateResult){
			if(a){
				off = true;
			}
		}
		if(off){	
			var createData = JSON.parse(result.CreateResult);
			console.log(createData);
			if(createData.issuccess){
				console.log('*****************订单总表添加成功******************');
				cb(true);
			}else{
				console.log('********************订单总表添加失败***********************');
				cb(false);
			}
		}else{
			cb(false);
		}
	});
}

exports.createOrderSum2 = function(data,cb){
	var client = data.client;
	var args = {};
	args.entityname = 'new_jifei_ordersum';
	args.data = '['+
				 	'{"Key":"new_jifei_from","Value":' +data.new_jife_from+ '},'+//来源
				 	'{"Key":"new_jifei_customerid","Value":"'+data.new_jifei_customerid+'"},'+//客户id
				 	'{"Key":"new_jifei_factoryid","Value":"'+data.new_jifei_factoryid+'"},'+//工厂id
				 	'{"Key":"new_jifei_begintime","Value":"'+data.new_jifei_begintime+'"},'+//生效日期
				 	'{"Key":"new_jifei_endtime","Value":"'+data.new_jifei_endtime+'"},'+//失效日期
				 	'{"Key":"new_jifei_fromid","Value":"'+data.new_jifei_fromid+'"},'+//订单id
				 	'{"Key":"new_jifei_orderamount","Value":"'+data.new_jifei_orderamount+'"},'+//订单金额
				 	'{"Key":"new_jifei_ordersum","Value":"'+data.new_jifei_ordersum+'"},'+//订购数量
				 	'{"Key":"new_jifei_taketype","Value":"0"},'+//生效方式
				 	'{"Key":"new_pay","Value":"'+data.new_pay+'"},'+//付款方式
				 	'{"Key":"new_jifei_packageid","Value":"'+data.new_jifei_packageid+'"}'+
				']';//套餐id
	console.log(args);
	client.Create(args,function(err,result){
		if(err){
			console.log(err);
			cb(false);
			return;
		}
		var off = null;
		for(var a in result.CreateResult){
			if(a){
				off = true;
			}
		}
		if(off){	
			var createData = JSON.parse(result.CreateResult);
			console.log(createData);
			if(createData.issuccess){
				console.log('*****************订单总表添加成功******************');
				cb(true);
			}else{
				console.log('********************订单总表添加失败***********************');
				cb(false);
			}
		}else{
			cb(false);
		}
	});
}

//更新订单管理失效日期
exports.updOrderStopTime = function(data,cb){
	var client = data.client;
	var orderId = data.orderId;
	var endTime = data.endTime;
	var packageid = data.packageid;
	var filter = '{"Key":"new_jifei_orderid","Value":"'+orderId+'"},{"Key":"new_jifei_endtime","Value":"'+endTime+'"}';
	if(packageid && packageid != ''){
		filter += ',{"Key":"new_jifei_packageid","Value":"'+orderId+'"}';
	}
	var args = {};
	args.entityname = "new_jifei_order";
	args.data = '['+filter+']';
	console.log('********************开始更新订单失效日期*************************');
	console.log(args);
	client.Update(args, function(err,result){
		if(err){
			console.log(err);
			console.log('****************更新订单失效日期出错*********************');
			return cb(false);
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
				cb(true);
			}else{
				cb(false);
			}
		}else{
			cb(false);
		}

	});
}