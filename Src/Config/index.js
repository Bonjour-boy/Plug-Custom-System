const path = require('path');

const VersionLogs = require('./version.log.json');
//系统版本
const Version = VersionLogs[0]["version"];
//环境配置表
const Envs = require('./envs.json');
//启动参数
const _startArgvs = process.argv.slice(2);
//当前环境
const CurrentEnv = _startArgvs.length === 0 ? Envs.dev : _startArgvs[0];
const Server = require('./server.json');
//接口状态码
const StatusCode = require('./status.code.json');

//插件状态
const PluginStatus = require('./plugin.status.json');

const _pluginPath = require('./plugin.path.json');
const PluginPath = {
    root: path.resolve(__dirname, _pluginPath.root),
    zip: path.resolve(__dirname, _pluginPath.zip),
    bundle: path.resolve(__dirname, _pluginPath.bundle),
    upload: path.resolve(__dirname, _pluginPath.upload),
    RN54: path.resolve(__dirname, _pluginPath.rn54),
}
//插件平台(云米/米家)
const Platform = require('./platform.json');
//插件平台(云米/米家)
const DevicesPlatform = require('./device.platform.json');
//git配置
const Git = require('./git.json');

//数据库配置
let Database = null;
//MARK: 域名
//本服务器域名
let Host = null;
//新的IOT平台域名
let ViotHost = null;
//旧的IOT平台域名
let IotHost = null;
let IotToken = null;

let _FackerToken = null;
//正式环境
if (CurrentEnv === Envs.prod) {
    Database = require('./database.prod.json');
    Host = "https://plugcenter.viomi.com.cn";
    ViotHost = "http://admin-home.viomi.com.cn";
    IotHost = 'http://ms.viomi.com.cn';
    IotToken = 'V3_brIN4XMlYOsAfCXbTdrA7Y6DrFPW9gXkFh9bwpYR8IIFEqxxSKoSgRGNfEg2fpeX5zVacTaeVdlDXD-fSSt5WyzGlxbuefzjo_ttnzGgh8NycoXjMo7a7FErbRLYiQwj';
    _FackerToken = 'XjbzVEWAhWV7kScu';
}
//测试环境
else {
    Database = require('./database.dev.json');
    Host = "http://localhost:8080";
    ViotHost = "http://admin-home-test.viomi.com.cn";
    IotHost = 'http://mstest.viomi.com.cn';
    IotToken = 'V3_nx9U2nkMsmpLS5cjTvMohhhoIbtihp_MRtXlfwNOnON1K';
    _FackerToken = 'x1EqKfMx7C8VzXns';
}

module.exports = {
    Server,
    Database,
    Envs,
    CurrentEnv,
    DevicesPlatform,
    Version,
    VersionLogs,
    StatusCode,
    PluginStatus,
    Platform,
    PluginPath,
    Git,
    Host,
    ViotHost,
    IotHost,
    IotToken,
    _FackerToken
}