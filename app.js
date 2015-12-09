var express = require("express");
var port = 3029;
var app = express();
//路径转换
var path = require("path");


//创建mongoose数据库
// var mongoose = require("mongoose")

//初始化表单
var bodyParser = require("body-parser");
//如果要使用cookie，需要显式包含这个模块
var cookieParser = require('cookie-parser');
//如果要使用session，需要单独包含这个模块
var session = require('express-session'); 
//引用mongo中间件，用于session的持久化
// var mongoStore = require('connect-mongo')(session);
//引用打印信息模块(原express.logger模块)
// var morgn = require('morgn')


var dbUrl = 'mongodb://127.0.0.1/wowifi';
app.set('views','./app/views/pages');
app.set('view engine','ejs');
//启动本地数据库
// mongoose.connect(dbUrl);


// 使用bodyParser模块
app.use(bodyParser.urlencoded({
    type: function(req) {
        return /x-www-form-urlencoded/.test(req.headers['content-type']);
    },
    extended: true
}));
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
app.use(bodyParser());
app.use(bodyParser.json());

//初始化session
app.use(cookieParser());
// app.use(session({
//     secret: 'dadfeddeeQ45',
//     name: 'liuliang_mobile',
//     cookie: {maxAge: 8640000000}, //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
//     resave: false,
//     saveUninitialized: true,
//     store: new mongoStore({
//         host: 'localhost',
//         //默认存放session数据库端口
//         port: 27017,
//         db: 'wowifi-session'
//     })
// }));

//静态资源路径
app.use(express.static(path.join(__dirname,'public')));

//引入格式化时间模块
app.locals.moment = require('moment');





//引入路由文件
require('./config/routes')(app)


//打印相关信息的配置
// if('development' === app.get('env')){
//     app.set('showStackError', true);
//     // app.use(morgn(':method :url :status'));
//     app.locals.pretty = true;
//     mongoose.set('debug',true);
// }

app.listen(port);

console.log('程序启动了，使用的是'+port+'端口');


