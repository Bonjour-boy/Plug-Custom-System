//网络请求，db读写，数据组合
var database = require('../../Database/db');
const common = require('../Common/Common');
const { StatusCode, ViotHost, _FackerToken } = require('../../../Config');
const axios = require('axios');
const { FormatUnit } = require('../../../Unit');

/**
 * @swagger
 *
 * /api/v1/getProducts:
 *   get:
 *     tags:
 *       - 产品
 *     summary: 根据品类id查询所有产品
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *       - name: id
 *         description: 品类id
 *         in: query
 *         required: true
 *         type: integer
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResult'
 */
async function getProducts(req, res) {
    const { id } = req.query;
    if (FormatUnit.isNullOrEmpty(id)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }
    const token = req.get('authorization_v1');
    try {
        const response = await axios.get(ViotHost + '/api/product/open-api/v1/pageQuery', {
            headers: { authorization_v1: _FackerToken },
            params: {
                type: id,
                pageSize: 100,
            },
        });

        let resultArray = response.data.result.list;

        if (resultArray.length > 0) {
            const ids = [];
            for (let i = 0; i < resultArray.length; i++) {
                ids.push(resultArray[i].id);
            }

            const result = await database.queryProductConfigByIds(ids);

            if (result.length > 0) {
                //根据查询结果更新网络返回数据
                for (var i = 0; i < resultArray.length; i++) {
                    var item = resultArray[i];
                    for (var j = 0; j < result.length; j++) {
                        if (item.id == result[j].id) {
                            item.config = JSON.parse(result[j].config);
                            break;
                        }
                    }
                }
            }
        }

        //返回完整数据
        res.send(common.makeSuccessResponse(req, resultArray));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_common, e));
    }
}

/**
 * @swagger
 *
 * /api/v1/getLocalProducts:
 *   get:
 *     tags:
 *       - 产品
 *     summary: 根据品类id查询所有本地产品数据
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *       - name: id
 *         description: 品类id
 *         in: query
 *         required: true
 *         type: integer
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResult'
 */
async function getLocalProducts(req, res) {
    const { id } = req.query;
    if (FormatUnit.isNullOrEmpty(id)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }
    try {
        const result = await database.queryProductByCategoryId(id);
        res.send(common.makeSuccessResponse(req, result));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query));
    }
}

/**
 * @swagger
 *
 * /api/v1/getProductParams:
 *   get:
 *     tags:
 *       - 产品
 *     summary: 根据品类id查询产品PARAMS数据
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *       - name: id
 *         description: 产品id
 *         in: query
 *         required: true
 *         type: integer
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResult'
 */
async function getProductParams(req, res) {
    const { id } = req.query;
    if (FormatUnit.isNullOrEmpty(id)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }
    try {
        const result = await database.queryProductParamsById(id);
        res.send(common.makeSuccessResponse(req, result));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query));
    }
}

/**
 * @swagger
 *
 * /api/v1/deleteLocalProductsById:
 *   post:
 *     tags:
 *       - 产品
 *     summary: 根据ID删除本地产品信息
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
 *                 description: 产品id
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResult'
 */
async function deleteLocalProductsById(req, res) {
    const { id } = req.body;
    if (FormatUnit.isNullOrEmpty(id)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }
    try {
        await database.deleteLocalProductsById(id);
        res.send(common.makeSuccessResponse(req, null));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query));
    }
}

/**
 * @swagger
 *
 * /api/v1/updateProductConfig:
 *   post:
 *     tags:
 *       - 产品
 *     summary: 更新产品的配置文件
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
 *                 description: 产品id
 *               config:
 *                 config: string
 *                 description: 产品配置(json格式字符串)
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResult'
 */
async function updateProductConfig(req, res) {
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
        await _replaceProduct(id, config);
        res.send(common.makeSuccessResponse(req, null));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

/**
 * @swagger
 *
 * /api/v1/updateProductParams:
 *   post:
 *     tags:
 *       - 产品
 *     summary: 更新产品的配置文件
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
 *                 description: 产品id
 *               params:
 *                 type: string
 *                 description: 产品参数(json格式字符串)
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResult'
 */
async function updateProductParams(req, res) {
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
        await _replaceProduct(id, null, params);
        res.send(common.makeSuccessResponse(req, null));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

/**
 * 根据config或params替换本地数据库记录
 * @param {*} config
 * @param {*} params
 */
async function _replaceProduct(id, config = null, params = null) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(ViotHost + '/api/product/open-api/v1/getBaseInfoById', {
                headers: { Authorization_v1: _FackerToken },
                params: {
                    id: id,
                },
            });

            const { code, result: netResult } = response.data;

            if (code === StatusCode.success.code) {
                const result = await database.queryProductById(id);

                //存在本地数据的时候
                if (result.length > 0) {
                    netResult.config = config ? config : result[0].config;
                    netResult.params = params ? params : result[0].params;
                } else {
                    netResult.config = config ? config : null;
                    netResult.params = params ? params : null;
                }

                // console.log(netResult)

                await database.replaceProduct(netResult);
                resolve();
            } else {
                reject(response.data);
            }
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    getProducts,
    getLocalProducts,
    getProductParams,
    updateProductConfig,
    updateProductParams,
    deleteLocalProductsById,
};
