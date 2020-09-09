//网络请求，db读写，数据组合
var database = require('../../Database/db');
const axios = require("axios");
const common = require('../Common/Common');
const { StatusCode, ViotHost, _FackerToken } = require('../../../Config');
const { FormatUnit } = require('../../../Unit');
const fsp = require('fs').promises;
/**
 * @swagger
 * components:
 *  schemas:
 *    Category:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: id
 *        pid:
 *          type: integer
 *          description: pid
 *        name:
 *          type: string
 *          description: 名称
 *        sortName:
 *          type: string
 *          description: 简称
 *        description:
 *          type: string
 *          description: 英文描述
 *        comment:
 *          type: string
 *          description: 中文描述
 *        config:
 *          type: object
 *          description: 配置文件
 */

/**
 * @swagger
 *
 * /api/v1/getCategorys:
 *   get:
 *     tags: 
 *       - 品类
 *     summary: 查询所有品类(外联iot服务器)
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 msg:
 *                   type: string
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
async function getCategorys(req, res) {
    //接到请求
    const token = req.get('authorization_v1');

    try {
        const response = await axios({
            method: 'get',
            url: ViotHost + '/api/product/open-api/v1/queryProductType',
            headers: { 'authorization_v1': _FackerToken },
            responseType: 'json'
        });

        //获取到最新的原始数据
        //先拼一个id的数组
        var resultArray = response.data.result;

        if (resultArray.length > 0) {
            console.log("@@@@第1111次访问目录")
            const result = await database.queryCategory();
            // console.log(result, "@@@@第1111次访问目录的结果")
            //根据查询结果更新网络返回数据
            for (var i = 0; i < resultArray.length; i++) {
                var cate = resultArray[i];
                for (var j = 0; j < result.length; j++) {
                    if (cate.id == result[j].id) {
                        const c = result[j].config;
                        const p = result[j].params;

                        if (!FormatUnit.isNullOrEmpty(c) && FormatUnit.isJsonString(c)) {
                            cate.config = JSON.parse(c);
                        }

                        if (!FormatUnit.isNullOrEmpty(p) && FormatUnit.isJsonString(p)) {
                            cate.params = JSON.parse(p);
                        }

                        break;
                    }
                }
            }
        }

        //返回完整数据
        res.send(common.makeSuccessResponse(req, resultArray));
    }
    catch (e) {
        // res.send(common.makeErrorResponse(req, StatusCode.error_common, e));
        res.send(common.makeErrorResponse(req, {
            code: -100,
            result: null,
            msg: e
        }, e));
    }
}

/**
 * @swagger
 *
 * /api/v1/getLocalCategorys:
 *   get:
 *     tags: 
 *       - 品类
 *     summary: 查询所有品类(本地数据库)
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 msg:
 *                   type: string
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommonResult'
 */
async function getLocalCategorys(req, res) {
    try {
        console.log("第22222次访问目录")
        const result = await database.queryCategory();
        res.send(common.makeSuccessResponse(req, result))
    }
    catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query));
    }
}

/**
* @swagger
*
* /api/v1/updateCategoryConfig:
*   post:
*     tags: 
*       - 品类
*     summary: 更新品类的配置文件
*     produces:
*       - application/json
*     parameters:
*       - name: authorization_v1
*         description: 登录令牌
*         in: header
*         required: true
*         type: string
*         example: "Skf7csK6yFme0t6u"
*     requestBody:
*       required: true
*       content: 
*         application/json: 
*           schema:
*             type: object
*             properties:
*               id:
*                 type: integer
*                 required: true
*                 description: 产品id
*               config:
*                 type: string
*                 description: 产品配置(json格式字符串)
*                 example: "{\"品类测试\":\"配置\"}"
*     responses:
*       100:
*         description: 成功获取
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/CommonResult'
*/
async function updateCategoryConfig(req, res) {
    const { id, config } = req.body;
    if (FormatUnit.isNullOrEmpty(id)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }
    //校验是否json格式
    if (!FormatUnit.isJsonString(config)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }

    try {
        await _replaceCategory(id, config);

        res.send(common.makeSuccessResponse(req, null));
    }
    catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

async function updateCategoryParams(req, res) {
    const { id, params } = req.body;
    if (FormatUnit.isNullOrEmpty(id)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }
    //校验是否json格式
    if (!FormatUnit.isJsonString(params)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }

    try {
        await _replaceCategory(id, null, params);

        res.send(common.makeSuccessResponse(req, null));
    }
    catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

async function uploadCategoryParams(req, res) {
    const { categoryId } = req.body;
    console.log(categoryId)
    try {
        const file = req.files[0];
        const fileName = req.files[0].originalname;

        if (fileName.indexOf('.json') === -1) {
            res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
            return;
        }
        const data = await fsp.readFile(file.path, { encoding: 'utf8' });
        const json = JSON.parse(data);
        const jsonStr = JSON.stringify(json);

        await _replaceCategory(categoryId, null, jsonStr);

        res.send(common.makeSuccessResponse(req, null));
    }
    catch (e) {
        console.log(e)
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

/**
* 根据config或params替换本地数据库记录
* @param {*} config 
* @param {*} params 
*/
async function _replaceCategory(id, config = null, params = null) {
    return new Promise(async (resolve, reject) => {
        try {
            let netResult = {
                id: id
            };

            console.log("第33333次访问目录")
            const result = await database.queryCategoryById(id);

            //存在本地数据的时候
            if (result.length > 0) {
                netResult.config = config ? config : result[0].config;
                netResult.params = params ? params : result[0].params;
            }
            else {
                netResult.config = config ? config : null;
                netResult.params = params ? params : null;
            }

            console.log(netResult)

            await database.replaceCategory(netResult);

            resolve();
        }
        catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getCategorys,
    getLocalCategorys,
    updateCategoryConfig,
    updateCategoryParams,
    uploadCategoryParams
}