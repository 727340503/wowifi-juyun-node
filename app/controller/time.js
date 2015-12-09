/**
 * Created by krew on 14-12-7.
 */

/*将字符串转换为数字类型*/
function Number(str){
    return parseInt(str);
}

/*js标准时间格式转换自定义时间格式方法*/
exports.format = function (time, format){
    var t = new Date(time);
    var tf = function(i){return (i < 10 ? '0' : '') + i};
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
        switch(a){
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    })
}
function format(time, format){
    var t = new Date(time);
    var tf = function(i){return (i < 10 ? '0' : '') + i};
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
        switch(a){
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    })
}

/*修改时间格式 ('2014-08-10'转换成'2014/08/10')*/
function ctf(str){
    return new_str = str.replace('-','/');
}

/*清除时区误差*/
function changeTime(obj,hour,fm){
    var a, b,c;
    if(!fm){
        fm = 'yyyy-MM-dd HH:mm:ss';
    }
    a = new Date(obj);
    b = a.getTime()+hour*60*60*1000;
    c = format(new Date(b),fm);
    return c;
}

exports.changeTime = changeTime;