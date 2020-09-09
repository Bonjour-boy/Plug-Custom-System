var program = require('commander');
var url = require('url');
var jwt = require('jwt-simple');
var moment = require('moment');
const {LogUtil} = require('../../Util')
const { StatusCode, CurrentEnv, Envs } = require('../../../Config');

program
    .version('0.0.1')
    .option('-r, --release', 'release env')
    .option('-d, --dev', 'dev env')
    .parse(process.argv);

const jwt_secret_key = 'syncmaster_token_secret';
exports.jwt_secret_key = jwt_secret_key;

exports.makeSuccessResponse = function (req, data) {
    const { code, msg } = StatusCode.success;
    let res = {
        code: code,
        result: data,
        msg: msg
    }

    return res;
}

exports.makeErrorResponse = function (req, errCode, err) {
    if (err) {
        LogUtil.logger.error(err);
    }

    const { code, msg } = errCode;
    let res = {
        code: code,
        result: null,
        msg: msg
    };

    return res;
}

//处理get参数，返回dict
function getCommonParams(req) {
    var params = url.parse(req.url, true).query;
    return params;
}

exports.getCommonParams = getCommonParams;

String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

exports.decodeTokenByReq = function (req, callback) {
    console.log("decodeTokenByReq");
    console.log(req.cookies);
    var token = req.cookies['token'];
    decodeToken(token, callback);
}

function decodeToken(token, callback) {
    if (typeof (token) == "undefined" || token.length == 0) {
        callback(StatusCode.error_token_empty, "str_empty_token");
    }
    else {
        console.log("decodeToken" + token);
        //校验登录态
        try {
            var decoded = jwt.decode(token, jwt_secret_key);
            console.log(decoded);
            if (decoded.exp <= Date.now()) {
                console.log('授权错误');
                callback(StatusCode.error_token_expired, "str_token_expired");
            } else {
                console.log("鉴权时间通过");
                //成功
                callback(StatusCode.success, decoded);
            }
        }
        catch (err) {
            console.log(err);
            callback(StatusCode.error_token_invalid, "str_invalid_token");
        }

    }
}

exports.decodeToken = decodeToken;


const cookie_max_age = 30 * 24 * 60 * 60 * 1000;
exports.cookie_max_age = cookie_max_age;

exports.encodeToken = function (name, password, callback) {
    /**设置移动端登录连续30天过后过期**/
    var expired = moment().add(cookie_max_age, 'milliseconds').valueOf();
    var ret = jwt.encode({
        name: name,
        password: password,
        expired: expired,
    }, jwt_secret_key);
    callback(ret, expired);
}


