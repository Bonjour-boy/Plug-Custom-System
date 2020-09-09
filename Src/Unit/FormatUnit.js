class FormatUnit {
    /**
     * 判断数据是不是Null或者空字符串
     * @param {*} value 
     */
    static isNullOrEmpty(value) {
        if (value === null || value === undefined || value === "undefined" || value === '') {
            return true;
        }

        return false;
    }

    /**
     * 判断数据是不是Json格式的字符串
     * @param {*} value 
     */
    static isJsonString(value) {
        if (typeof value == 'string') {
            try {
                const obj = JSON.parse(value);
                if (typeof obj == 'object' && obj) {
                    return true;
                } else {
                    return false;
                }

            }
            catch (e) {
                return false;
            }
        }

        return false;
    }

    /**
     * 判断是不是邮箱
     * @param {*} s 
     */
    static isEmail(s) {
        return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
    }

    /**
     * 判断是不是手机号码
     * @param {*} s 
     */
    static isMobile(s) {
        return /^1[0-9]{10}$/.test(s)
    }

    /**
     * 判断是不是url地址
     * @param {*} s 
     */
    static isURL(s) {
        return /^http[s]?:\/\/.*/.test(s)
    }

    /**
     * 判断是不是字符串
     * @param {*} s 
     */
    static isString(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'String'
    }

    /**
     * 判断是不是数字
     * @param {*} s 
     */
    static isNumber(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Number'
    }

    /**
     * 判断是不是布尔类型
     * @param {*} s 
     */
    static isBoolean(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean'
    }

    /**
     * 判断是不是函数
     * @param {*} s 
     */
    static isFunction(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Function'
    }

    /**
     * 判断是不是Null
     * @param {*} s 
     */
    static isNull(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Null'
    }

    /**
     * 判断是不是Undefined
     * @param {*} s 
     */
    static isUndefined(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Undefined'
    }

    /**
     * 判断是不是对象
     * @param {*} s 
     */
    static isObj(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Object'
    }

    /**
     * 判断是不是数组
     * @param {*} s 
     */
    static isArray(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Array'
    }

    /**
     * 判断是不是日期
     * @param {*} s 
     */
    static isDate(o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Date'
    }

    /**
     * 判断元素是不是在此数组内
     * @param {*} s 
     */
    static contains(arr, val) {
        return arr.indexOf(val) != -1 ? true : false;
    }
}

module.exports = FormatUnit;