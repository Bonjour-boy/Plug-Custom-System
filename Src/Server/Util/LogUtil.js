var log4js = require('log4js');
// log4js的输出级别6个: trace, debug, info, warn, error, fatal
log4js.configure({
  //输出位置的基本信息设置
  appenders: {
    //设置控制台输出 （默认日志级别是关闭的（即不会输出日志））
    out: {
      type: 'console'
    },
    allLog: {
      type: 'dateFile', 
      filename: './Logs/all.log', 
      pattern: '.yyyy-MM-dd',
      daysToKeep : 15
    },
    //http请求日志  http请求日志需要app.use引用一下， 这样才会自动记录每次的请求信息 
    httpLog: {
      type: "dateFile",
      filename: "./Logs/httpAccess.log",
      pattern: ".yyyy-MM-dd",
      daysToKeep : 15
    },
    //错误日志 type:过滤类型logLevelFilter,将过滤error日志写进指定文件
    errorLog: {
      type: 'dateFile',
      filename: './Logs/error.log',
      pattern: ".yyyy-MM-dd",
      daysToKeep : 15
    },
    error: {
      type: "logLevelFilter",
      level: "error",
      appender: 'errorLog'
    }
  },
  //不同等级的日志追加到不同的输出位置：appenders: ['out', 'allLog']  categories 作为getLogger方法的键名对应
  categories: {
    //appenders:采用的appender,取上面appenders项,level:设置级别
    http: {
      appenders: ['httpLog'],
      level: "debug"
    },
    default: {
      appenders: ['out', 'allLog', 'error'],
      level: 'debug'
    },
    '[自动构建]':{
      appenders: ['out', 'allLog', 'error'],
      level: 'debug'
    },
    '[Git]':{
      appenders: ['out', 'allLog', 'error'],
      level: 'debug'
    },
    '[在线Bundle]':{
      appenders: ['out', 'allLog', 'error'],
      level: 'debug'
    },
    '[IOT上传]':{
      appenders: ['out', 'allLog', 'error'],
      level: 'debug'
    }
  }
});

//getLogger参数取categories项,为空或者其他值取default默认项
// exports.getLogger = function (name) {
//     return log4js.getLogger(name || 'default')
// }
const logger = log4js.getLogger();

const httpLog = log4js.getLogger('http');
const httpLogger = log4js.connectLogger(httpLog, {
  level: 'debug',
  format: ':method :url :status'
});

const packageLog = log4js.getLogger('[自动构建]');
const gitLog = log4js.getLogger('[Git]');
const bundleLog = log4js.getLogger('[在线Bundle]');
const iotUploadLog = log4js.getLogger('[IOT上传]');

module.exports = {
  logger,
  httpLogger,
  packageLog,
  bundleLog,
  iotUploadLog,
  gitLog
};