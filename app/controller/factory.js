var soap = require('soap');
var settings = require('../../settings');
var Time = require('./time');
var async = require('async');
var AUTH = require('../util/auth');

//更新用户工厂
exports.updAccountFacId = function(req,res){
	var data = req.body;
	// var data = req.query;
	try{
		var accountId = data.userId;
		var facId = data.factoryId;
		if(!accountId || accountId == '' || !facId || facId == ''){
			return res.json({resultCode:'1',info:'参数不能为空'});
		}
		var url = settings.url;
		soap.createClient(url,function(err,client){
			if(err){
				console.log(err);
				return res.json({resultCode:'2',info:'连接远程服务器出错'});
			}
			var args = {};
			args.entityname ='new_jifei_customer';
            args.data = '[{"Key":"new_jifei_customerid","Value":"'+accountId+'"},{"Key":"new_jifei_factoryid","Value":"'+facId+'"}]';
            console.log(args);
            client.Update(args,function(err,result){
            	if(err){
            		console.log(err);
            		console.log('****************更新发生异常**************');
            		return res.json({resultCode:'2',info:'服务器繁忙，请稍后重试'});
            	}
            	var off = null;
            	console.log(result);
            	for(var a in  result.UpdateResult){
            		if(a){
            			off = true;
            			break;
            		}
            	}
            	console.log(result);
            	if(off){
            		var resuData = JSON.parse(result.UpdateResult);
            		if(resuData.issuccess){
            			return res.json({resultCode:'0',info:'用户工厂更新成功'});
            		}else{
            			return res.json({resultCode:'1',info:'用户工厂更新失败'});
            		}
            	}else{
            		return res.json({resultCode:'1',info:'用户工厂更新失败'});
            	}
            });
		});
	}catch(e){
		console.log('>>>>>>>>>>>>>>>>发生了异常<<<<<<<<<<<<<<<<<');
		console.log(e);
		res.json({resultCode:'2',info:'服务器繁忙，请稍后重试'});
	}
}

//查询工厂的wifi套餐
exports.findFacPack = function(req,res){
      var data = req.body;
      // var data = req.query;
       //默认套餐包
      var defaultPackages = settings.defaulPacks;
      try{
            var factoryId = data.factory;
            if(!factoryId || factoryId == ''){
                  return res.json({resultCode:'0',info:'用户工厂不能为空',data:defaultPackages});
            }
            var url = settings.CRMSERVICE_WSDL;
            soap.createClient(url,function(err,client){
                  if(err){
                        console.log(err);
                        return res.json({resultCode:'2',info:'连接远程服务器出错'});
                  }
                  var filter = "new_jifei_factoryid = ''"+factoryId+"''";
                  var args = {};
                  args.sqlstr = "exec usp_Common_Sel_TableData 'new_jifei_factorypackage_vw',"+
                                      "'new_jifei_factorypackageid,new_jifei_factoryid,new_jifei_packageid,new_jifei_packageidname,new_pack_pirce,new_name,statecode,statuscode,createdon',"+//显示字段
                                      "10000000,1,"+//分页参数
                                      "'createdon desc','"+//排序字段
                                      filter+"'";//过滤条件
                  console.log(args);
                  console.log('************************开始查询帐单总数量*************************');
                  client.QuerySql(args,function(err,result){
                        if(err){
                              console.log(err);
                              return res.json({resultCode:'2',info:'查询工厂套餐失败,请稍后重试',data:defaultPackages});
                        }
                        var off = null;
                        for(var a in result.QuerySqlResult){
                              if(a){
                                    off = true;
                              }
                        }
                        console.log(result);
                        if(off){
                              var resultData = JSON.parse(result.QuerySqlResult);
                              if(resultData.issuccess != undefined || resultData.issuccess == false){
                                    return res.json({resultCode:'1',info:"工厂信息不正确",data:defaultPackages});
                              }
                              res.json({resultCode:'0',data:resultData});
                        }else{
                             
                              res.json({resultCode:'1',info:'该工厂没有套餐',data:defaultPackages});
                        }
                  });

              //     args.entityname = 'new_jifei_factorypackage_vw';
              //     args.filter = '[{"Logical":"or","Conditions":[{"Key":"new_jifei_factoryid","Operator":"=","Value":"'+factoryId+'"}]}]';
              //     args.fields = 'new_jifei_factorypackageid,new_jifei_factoryid,new_jifei_packageid,new_jifei_packageidname,new_pack_pirce,new_name,statecode,statuscode,createdon';
              //     args.orderby = 'createdon desc';
              //     args.pagesize = 10000;
              //     args.pageindex = 1;
              //     console.log('**************开始查询工厂套餐******************');
              //     client.Query(args,function(err,result){
              //     if(err){
              //           console.log(err);
              //           return res.json({resultCode:'2',info:'查询工厂套餐失败,请稍后重试',data:defaultPackages});
              //     }
              //     var off = null;
              //     for(var a in result.QueryResult){
              //           if(a){
              //                 off = true;
              //           }
              //     }
              //     console.log(result);
              //     if(off){
              //           var resultData = JSON.parse(result.QueryResult);
              //           if(resultData.issuccess != undefined || resultData.issuccess == false){
              //                 return res.json({resultCode:'1',info:"工厂信息不正确",data:defaultPackages});
              //           }
              //           res.json({resultCode:'0',data:resultData});
              //     }else{
                       
              //           res.json({resultCode:'1',info:'该工厂没有套餐',data:defaultPackages});
              //     }
              // });
            });
      }catch(e){
            console.log('>>>>>>>>>>>>>发生了异常<<<<<<<<<<<<');
            console.log(e);
            res.json({resultCode:'2','info':'服务器忙，请稍后重试',data:defaultPackages});
      }
}

//查询公告
exports.announcement = function(req,res){
    var data = req.body;
    // var data = req.query;
    try{
        var phone = data.phone;
        var url = settings.CRMSERVICE_WSDL;
        soap.createClient(url,function(err,client){
            if(err){
                console.log(err);
                return res.json({resultCode:'1',info:'连接远程服务器出错'});
            }
            async.auto({
                qryUser:function(callback){
                    if(!phone || phone == ''){
                        callback(null,null);
                    }else{
                        var args = {};
                        var filter = "new_useraccount = ''"+phone+"''";
                        args.sqlstr = "exec usp_Common_Sel_TableData 'new_jifei_customer',"+
                                      "'new_jifei_customerid,new_type,new_imei,new_recordtype,new_useraccount,new_userPssword,statecode,new_region_opinion,new_man_opinion,new_mac,new_jifei_factoryid,createdon',"+//显示字段
                                      "1,1,"+//分页参数
                                      "'createdon desc','"+//排序字段
                                      filter+"'";//过滤条件
                        console.log(args);
                        console.log('********************开始查询用户*******************');
                        client.QuerySql(args,function(err,result){
                            if(err){
                                console.log(err);
                                return res.json({resultCode:'1',info:'查询失败，请稍后重试'});
                            }
                            var off = null;
                            for(var a in result.QuerySqlResult){
                                if(a){
                                    off = true;
                                    break;
                                }
                            }
                            console.log(result);
                            if(off){
                                var resultData = JSON.parse(result.QuerySqlResult);
                                if(resultData.issuccess != undefined || resultData.issuccess == false){
                                    res.json({resultCode:'1',info:'查询失败，请稍后重试'});
                                }else{
                                    callback(null,resultData[0]);
                                }
                            }else{
                                callback(null,null);
                            }
                        });
                    }
                }
            },function(err,results){
                var userInfo = results.qryUser;
                var facId = '';
                if(userInfo != null){
                    facId = userInfo.new_jifei_factoryid;
                }
                if(facId == ''){//查询系统公告
                    var args = {};
                    var filter = "new_type = ''1''";
                    args.sqlstr = "exec usp_Common_Sel_TableData 'new_tonggao',"+
                                  "'new_name,new_neirong,createdon,modifiedon',"+//显示字段
                                  "1000000,1,"+//分页参数
                                  "'createdon desc','"+//排序字段
                                  filter+"'";//过滤条件
                    console.log(args);
                    console.log('*********************开始查询系统公告*****************************');
                    client.QuerySql(args,function(err,result){
                        if(err){
                            console.log(err);
                            return res.json({resultCode:'1',info:'查询失败，请稍后重试'});
                        }
                        var off = null;
                        for(var a in result.QuerySqlResult){
                            if(a){
                                off = true;
                                break;
                            }
                        }
                        console.log(result);
                        if(off){
                            var resultData = JSON.parse(result.QuerySqlResult);
                            if(resultData.issuccess != undefined || resultData.issuccess == false){
                                res.json({resultCode:'1',info:'查询失败，请稍后重试'});
                            }else{
                                res.json({resultCode:'0',info:'',data:result.QuerySqlResult});
                            }
                        }else{
                            res.json({resultCode:'2',info:'暂时没有公告'});
                        }
                    });
                }else{//查询工厂公告
                    var filter = "new_jifei_factoryid = ''"+facId+"''";
                    var args = {};
                    args.sqlstr = "exec usp_Common_Sel_TableData 'vw_app_fabufanwei',"+
                                  "'new_name,new_neirong,createdon,modifiedon,new_tonggaoidname',"+//显示字段
                                  "10000000,1,"+//分页参数
                                  "'createdon desc','"+//排序字段
                                  filter+"'";//过滤条件
                    console.log(args);
                    console.log('*****************开始查询工厂公告********************');
                    client.QuerySql(args,function(err,result){
                        if(err){
                            console.log(err);
                            return res.json({resultCode:'1',info:'查询工厂公告失败,请稍后重试'});
                        }
                        var off = null;
                        for(var a in result.QuerySqlResult){
                              if(a){
                                    off = true;
                              }
                        }
                        console.log(result);
                        if(off){
                              var resultData = JSON.parse(result.QuerySqlResult);
                              if(resultData.issuccess != undefined || resultData.issuccess == false){
                                    return res.json({resultCode:'1',info:"查询工厂公告失败,请稍后重试"});
                              }
                              res.json({resultCode:'0',info:'',data:resultData});
                        }else{
                             
                              res.json({resultCode:'2',info:'该工厂没有公告'});
                        }
                  });
                }
            });
        });
    }catch(e){
        console.log('>>>>>>>>>>>>>发生了异常<<<<<<<<<<<<');
        // console.log(e);
        res.json({resultCode:'1','info':'服务器忙，请稍后重试'});
    }
}