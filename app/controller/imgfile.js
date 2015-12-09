var soap = require('soap');
var settings = require('../../settings');
var formidable = require('formidable');
var fs = require('fs');
var AVATAR_UPLOAD_FOLDER = '/avatar/';//下载文件夹
//图片上传
exports.imgUpload = function(req,res){
	var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

  	form.parse(req, function(err, fields, files) {
	    if (err) {
	      	console.log(err);
	      	return res.json({resultCode:'1',info:err.message});
	    }  
    	var extName = '';  //后缀名
	    switch (files.fulAvatar.type) {
	      	case 'image/pjpeg':
	        	extName = 'jpg';
	        	break;
	      	case 'image/jpeg':
	        	extName = 'jpg';
	        	break;		 
	      	case 'image/png':
	        	extName = 'png';
	        	break;
	      	case 'image/x-png':
	        	extName = 'png';
	        	break;		 
	    }
	    if(extName.length == 0){
	        return res.json({resultCode:'1',info:'对不起，暂时只支持png和jpg格式图片'});		   
	    }
    	var avatarName = new Date().getTime() + '.' + extName;
    	var newPath = form.uploadDir + avatarName;
    	console.log(newPath);
    	fs.renameSync(files.fulAvatar.path, newPath);  //重命名
	  	res.json({resultCode:'0',info:'图片上传成功',url:settings.SAVEIMGURL+avatarName});
  	});
}