var MD5 = require('md5');
var settings = require('../../settings'); 
var soap = require('soap');
var Time = require('./time');

exports.youminotify = function(req,res){
	console.log("***************有米回调开始*************");
	var data = req.query;
	console.log(data);
	var dev_server_secret = settings.YOUMI_SERVER_SECRET;
	var signature = MD5(dev_server_secret + "||" + data.order + "||" + data.app + "||" + data.user + "||" + data.chn + "||" + data.ad + "||" + data.points).substring(12, 20);
	if(signature.toLowerCase() == data.sig.toLowerCase()){
		var url = settings.CRMSERVICE_WSDL29;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				console.log('***************远程连接出错*****************8');
				return;
			}
			var youmiorderid = data.order;
			var args = {};
			args.entityname = 'new_checkin';
			args.filter = '[{"Logical":"and","Conditions":[{"Key":"new_youmiorderid","Operator":"=","Value":"'+youmiorderid+'"},{"Key":"new_type","Operator":"=","Value":4}]}]';
		    args.fields = 'new_checkinid,createdon';
		  	args.orderby = 'createdon desc';
		    args.pagesize = 1;
		    args.pageindex = 1;
	        console.log(args);
	        console.log('***************开始查询有米积分**************');
	        client.Query(args,function(err,result){
	        	if(err){
	        		console.log(err);
	        		console.log('****************查询有米订单失败*****************');
	        		return;
	        	}
	        	var off = null;
	        	for(var a in result.QueryResult){
	        		if(a){
	        			off = true;
	        			break;
	        		}
	        	}
	        	console.log(result);
	        	if(off == null){//判断订单不存在,则为用户增加积分
        			var createArgs = {};
					createArgs.entityname = "new_checkin";
					createArgs.data =  '[{"Key":"new_jyuserid","Value":"'+data.user+'"},'+//data.user
        								'{"Key":"new_type","Value":4},'+
        								'{"Key":"new_isget","Value":0},'+
        								'{"Key":"new_youmiorderid","Value":"'+youmiorderid+'"},'+
        								'{"Key":"new_integral","Value":'+parseFloat(data.points)+'},'+//'+parseFloat(data.points)+'
        								'{"Key":"new_date","Value":"'+Time.format(new Date(),'yyyy/MM/dd')+'"}]';
	        		console.log(createArgs);
	        		console.log('*****************开始插入有米积分***************8');
	        		client.Create(createArgs,function(err,result){
	        			if(err){
	        				console.log(err);
	        				console.log('**************插入订单出错************');
	        				return;
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
								res.send("success");
	        				}
	        			}
	        		});
	        	}else{
	        		res.send("积分已经添加");
	        	}
	        });
		});
	}else{
		res.send("非法请求");
	}
	console.log('*****************有米回调结束**********************8');
}