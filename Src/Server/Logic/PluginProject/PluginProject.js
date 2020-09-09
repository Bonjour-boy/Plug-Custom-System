const database = require('../../Database/db');
const common = require('../Common/Common');
const {
    StatusCode,
    Host,
    PluginPath,
    Git,
    PluginStatus,
    Platform,
    CurrentEnv,
    Envs
} = require('../../../Config');
const { FormatUnit } = require('../../../Unit');
const { FileUtil, LogUtil } = require('../../Util');
const PluginProjectGit = require('./PluginProjectGit');
const PluginProjectFile = require('./PluginProjectFile');
const PluginProjectBundle = require('./PluginProjectBundle');
const PluginProjectUpload = require('./PluginProjectUpload');
const fs = require('fs');
const fsp = require('fs').promises;

/**
 * @swagger
 * components:
 *  schemas:
 *    PluginProject:
 *      type: object
 *      required: true
 *      properties:
 *        id:
 *          description: 插件项目id
 *          type: integer
 *          example: 0
 *        name:
 *          description: 名称
 *          type: string
 *          example: "测试名称"
 *        projectName:
 *          description: 项目包名
 *          type: string
 *          example: "项目包名"
 *        categoryId:
 *          description: 品类id
 *          type: integer
 *          example: 0
 *        status:
 *          description: 当前状态(0:闲置  1:等待  2:打包中)
 *          type: integer
 *          example: 0
 *        platform:
 *          description: 产品平台(0:云米  1:米家)
 *          type: integer
 *          example: 0
 *        git:
 *          description: git地址
 *          type: string
 *          example: "git地址"
 *        last_update_msg:
 *          description: git的更新信息
 *          type: string
 *          example: "git的更新信息"
 *        last_update_date:
 *          description: git的更新日期
 *          type: string
 *          example: "git的更新日期"
 */

async function packagePluginProject(req, res) {
    const { id, platform } = req.body;
    const token = req.get('authorization_v1');

    if (FormatUnit.isNullOrEmpty(id)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }

    if (FormatUnit.isNullOrEmpty(platform)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }

    try {
        //是否存在对应的插件包
        const pluginProjectResult = await database.queryPluginProjectByCategoryId(
            id
        );
        if (pluginProjectResult.length > 0) {
            const pluginProject = pluginProjectResult[0];
            //检查当前系统是否空闲
            const status = await _checkPluginProjectStatus();
            if (status !== PluginStatus.packaging) {
                //将项目状态更新为打包中
                await _updatePluginProject({
                    id: pluginProject.id,
                    status: PluginStatus.packaging
                });
                //进行异步打包程序
                _runPackaging(pluginProject, platform);
                //返回结果
                res.send(
                    common.makeSuccessResponse(
                        req,
                        'TODO: 开始打包'
                    )
                );
            } else {
                
                //TODO: 当前有正在打包项目，添加进队列
                res.send(
                    common.makeErrorResponse(
                        req,
                        StatusCode.error_res_none
                    )
                );
            }
        } else {
            res.send(
                common.makeErrorResponse(
                    req,
                    StatusCode.error_res_none
                )
            );
        }
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

/**
 * 运行打包程序
 * @param {*} id
 * @param {*} platform
 */
async function _runPackaging(pluginProject, platform) {
    const { id, name } = pluginProject;

    LogUtil.packageLog.info('--------------------');
    LogUtil.packageLog.info(name);

    try {
        //TODO: 增加一个npm install的超时
        //下载git项目
        await PluginProjectGit.gitCheckout(id);
        //写入配置文件
        const updateMsg = await PluginProjectFile.insertConfigFile(id);
        //更新git项目
        await PluginProjectGit.gitPush(id, updateMsg);
        //压缩项目
        await PluginProjectFile.compressPluginProject(id, platform);

        //米家生成mpkg时，已经完成打包任务
        //云米平台还需继续进行budle打包
        if (platform === Platform.viot) {
            //bundle打包
            await PluginProjectBundle.packageBundle(id);
            //上传文件到IOT
            await PluginProjectUpload.uploadBundleToIOT(id);
        }

        await _updatePluginProject({
            id: id,
            status: PluginStatus.idle
        });

        LogUtil.packageLog.info('完成');
    } catch (e) {
        await _updatePluginProject({
            id: id,
            status: PluginStatus.waiting
        });
        LogUtil.packageLog.error('失败');
        LogUtil.packageLog.error(e);
    }
}

/**
 * @swagger
 *
 * /api/v1/getPluginProjects:
 *   get:
 *     tags:
 *       - 插件项目信息
 *     summary: 获取所有插件项目
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
 *               $ref: '#/components/schemas/CommonResult'
 */
async function getPluginProjects(req, res) {
    try {
        const result = await database.queryPluginProjects();
        res.send(common.makeSuccessResponse(req, result));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}
/**
 * @swagger
 *
 * /api/v1/deleteProductsById:
 *   post:
 *     tags:
 *       - 插件项目信息
 *     summary: 根据id删除插件项目
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
 *         description: 插件项目id
 *         in: query
 *         required: true
 *         type: integer
 *     responses:
 *       100:
 *         description: 成功删除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResult'
 */
async function deleteProductsById(req, res) {
    const { id } = req.body;
    if (FormatUnit.isNullOrEmpty(id)) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }
    try {
        await database.deleteProductsById(id);
        res.send(common.makeSuccessResponse(req, null));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query));
    }
}

/**
 * @swagger
 *
 * /api/v1/getPluginProjectById:
 *   get:
 *     tags:
 *       - 插件项目信息
 *     summary: 根据id获取插件项目
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
 *         description: 插件项目id
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
async function getPluginProjectById(req, res) {
    const { id } = req.query;
    try {
        const result = await database.queryPluginProjectById(id);
        res.send(common.makeSuccessResponse(req, result));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

/**
 * @swagger
 *
 * /api/v1/updatePluginProject:
 *   post:
 *     tags:
 *       - 插件项目信息
 *     summary: 根据id更新插件项目
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
 *              $ref: '#/components/schemas/PluginProject'
 *     responses:
 *       100:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonResult'
 */
async function updatePluginProject(req, res) {
    try {
        await _updatePluginProject(req.body);
        res.send(common.makeSuccessResponse(req, null));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

async function _updatePluginProject(params) {
    return new Promise(async (resolve, reject) => {
        try {
            await database.updatePluginProject(params);
            resolve();
        }
        catch (e) {
            reject(e);
        }
    });
}

/**
 * @swagger
 *
 * /api/v1/getPluginProjectByProjectName:
 *   get:
 *     tags:
 *       - 插件项目信息
 *     summary: 根据项目名称获取插件项目信息
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *       - name: projectName
 *         description: 项目名称
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
async function getPluginProjectByProjectName(req, res) {
    const { projectName } = req.query;
    try {
        const result = await database.queryPluginProjectByProjectName(
            projectName
        );
        res.send(common.makeSuccessResponse(req, result));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

/**
 * @swagger
 *
 * /api/v1/getPluginProjectByStatus:
 *   get:
 *     tags:
 *       - 插件项目信息
 *     summary: 根据状态获取插件项目
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *       - name: status
 *         description: 状态(0:闲置, 1:等待, 2:打包中)
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
async function getPluginProjectByStatus(req, res) {
    const { status } = req.query;
    try {
        const result = await database.queryPluginProjectByStatus(status);
        res.send(common.makeSuccessResponse(req, result));
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

/**
 * @swagger
 *
 * /api/v1/checkPluginProjectStatus:
 *   get:
 *     tags:
 *       - 插件项目信息
 *     summary: 检查当前项目状态
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
 *               $ref: '#/components/schemas/CommonResult'
 */
async function checkPluginProjectStatus(req, res) {
    try {
        const status = await _checkPluginProjectStatus();
        common.makeSuccessResponse(req, {
            status: status
        })
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

async function _checkPluginProjectStatus() {
    return new Promise(async (resolve, reject) => {
        try {
            //是否存在正在打包的项目
            const r_1 = await database.queryPluginProjectByStatus(
                PluginStatus.packaging
            );
            if (r_1.length > 0) {
                resolve(PluginStatus.packaging);
                return;
            }

            //是否存在正在等待的项目
            const r_2 = await database.queryPluginProjectByStatus(
                PluginStatus.waiting
            );
            if (r_2.length > 0) {
                resolve(PluginStatus.waiting);
                return;
            }

            resolve(PluginStatus.idle);
        } catch (e) {
            LogUtil.logger.error(e);
            reject(e);
        }
    });
}

async function getPluginProjectZip(req, res) {
    const { categoryId, platform } = req.query;
    if (FormatUnit.isNullOrEmpty(categoryId)) {
        res.send(
            common.makeErrorResponse(req, StatusCode.error_req_format, null)
        );
        return;
    }

    if (FormatUnit.isNullOrEmpty(platform)) {
        res.send(
            common.makeErrorResponse(req, StatusCode.error_req_format, null)
        );
        return;
    }

    try {
        const results = await database.queryPluginProjectByCategoryId(
            categoryId
        );

        if (results.length > 0) {
            const result = results[0];
            const fileEnd =
                parseInt(platform) === Platform.miot ? '.mpkg' : '.zip';
            const fileName = result.projectName + fileEnd;
            let filePath = PluginPath.zip + '/' + fileName;

            //生产环境需要加上域名
            if (CurrentEnv === Envs.prod) {
                filePath = Host + filePath;
            }

            res.send(common.makeSuccessResponse(req, { path: filePath }));
        } else {
            res.send(common.makeSuccessResponse(req, { path: null }));
        }
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}


/**
 * @swagger
 *
 * /api/v1/uploadLegalsZip:
 *   post:
 *     tags:
 *       - 品类
 *     summary: 上传该品类协议
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *       - name: categoryId
 *         description: 选中品类ID
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
async function uploadLegalsZip(req, res) {
    const { categoryId } = req.query;

    try {
        let fileName = req.files[0].originalname;
        let oldName = req.files[0].path;

        if (fileName.indexOf('.zip') != -1) {
            let newName = PluginPath.upload + '/legals_' + categoryId + '.zip';
            await fsp.rename(oldName, newName);
            const isLegals = await PluginProjectFile.checkLegals(newName);

            if (isLegals) {
                res.send(common.makeSuccessResponse(req, null));
            } else {
                res.send(
                    common.makeErrorResponse(req, StatusCode.error_req_format, null)
                );
            }
        } else {
            await fsp.rmdir(oldName, { recursive: true });
            res.send(
                common.makeErrorResponse(req, StatusCode.error_req_format, null)
            );
        }
    }
    catch (e) {
        common.makeErrorResponse(req, StatusCode.error_res_none, e)
    }

}

/**
* @swagger
* components:
*  schemas:
*    LegalsList:
*      type: object
*      properties:
*        itemName:
*          type: string
*          description: 名称
*        data:
*          type: string
*          description: 中文描述
*/


/**
 * @swagger
 *
 * /api/v1/getLegals:
 *   post:
 *     tags:
 *       - 品类
 *     summary: 获取当前品类协议信息
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: authorization_v1
 *         description: 登录令牌
 *         in: header
 *         required: true
 *         type: string
 *         example: "Skf7csK6yFme0t6u"
 *       - name: categoryId
 *         description: 选中品类ID
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
async function getLegals(req, res) {
    const { categoryId } = req.body;

    const legalsFileZip = PluginPath.upload + '/legals_' + categoryId + '.zip';
    const isZipExist = await FileUtil.checkPath(legalsFileZip);
    let defaultList = [];

    try {
        //读取本地
        //是否存在对应的插件包
        const pluginProjectResult = await database.queryPluginProjectByCategoryId(
            categoryId
        );

        if (pluginProjectResult.length > 0) {
            const { projectName } = pluginProjectResult[0];
            const projectPath = PluginPath.root + '/' + projectName;
            const isProjectPath = await FileUtil.checkPath(projectPath);
            const legalsPath = projectPath + '/Resources/Legals';
            if (isProjectPath) {
                if (isZipExist) {
                    await fsp.rmdir(legalsPath, { recursive: true });
                    const isSuccess = await FileUtil.zipDecompression(
                        legalsFileZip,
                        legalsPath
                    );
                    if (isSuccess) {
                        const list = await PluginProjectFile.getLegalsList(
                            legalsPath
                        );
                        defaultList = list;
                    }
                    await fsp.rmdir(legalsFileZip, { recursive: true });
                } else {
                    const list = await PluginProjectFile.getLegalsList(
                        legalsPath
                    );
                    defaultList = list;
                }

                res.send(
                    common.makeSuccessResponse(req, {
                        hasPlugin: true,
                        defaultList: defaultList
                    })
                );
            } else {
                res.send(
                    common.makeSuccessResponse(req, {
                        hasPlugin: false,
                        defaultList: defaultList
                    })
                );
            }
        } else {
            res.send(
                common.makeErrorResponse(req, StatusCode.error_req_format, null)
            );
        }
    } catch (e) {
        console.log('-100 getLegals');
        res.send(
            common.makeErrorResponse(req, StatusCode.error_req_format, null)
        );
    }
}

//读取插件项目故障信息
async function readFaultProfile(req, res) {
    const { categoryId } = req.query;
    if (FormatUnit.isNullOrEmpty(categoryId)) {
        res.send(
            common.makeErrorResponse(req, StatusCode.error_req_format, null)
        );
        return;
    }
    try {
        let pluginProjectName = '';
        //根据id查询插件包信息
        const pluginProjectData = await database.queryPluginProjectByCategoryId(
            categoryId
        );
        if (pluginProjectData.length > 0) {
            const { projectName } = pluginProjectData[0];
            pluginProjectName = projectName;
        } else {
            res.send(
                common.makeErrorResponse(
                    req,
                    StatusCode.error_res_none,
                    '插件包信息数据不存在'
                )
            );
            return;
        }
        let p1 = new Promise((resolve, reject) => {
            fs.readFile(
                `${PluginPath.root}/${pluginProjectName}/Resources/Langs/zhError.json`,
                'utf8',
                (err, files) => {
                    if (err) {
                        reject('读取zhError.json文件失败');
                    } else {
                        if (FormatUnit.isJsonString(files)) {
                            resolve(JSON.parse(files));
                        } else {
                            res.send(
                                common.makeErrorResponse(
                                    req,
                                    StatusCode.error_req_format,
                                    null
                                )
                            );
                        }
                    }
                }
            );
        });
        let p2 = new Promise((resolve, reject) => {
            fs.readFile(
                `${PluginPath.root}/${pluginProjectName}/Resources/Langs/enError.json`,
                'utf8',
                (err, files) => {
                    if (err) {
                        reject('读取enError.json文件失败');
                    } else {
                        if (FormatUnit.isJsonString(files)) {
                            resolve(JSON.parse(files));
                        } else {
                            res.send(
                                common.makeErrorResponse(
                                    req,
                                    StatusCode.error_req_format,
                                    null
                                )
                            );
                        }
                    }
                }
            );
        });
        Promise.all([p1, p2])
            .then(result => {
                res.send(common.makeSuccessResponse(req, result));
            })
            .catch(error => {
                res.send(
                    common.makeErrorResponse(
                        req,
                        StatusCode.error_db_query,
                        error
                    )
                );
            });
    } catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}

//写入插件项目故障文件
async function writeFaultProfile(req, res) {
    const { categoryId, faultData } = req.body;
    if (
        FormatUnit.isNullOrEmpty(categoryId) ||
        FormatUnit.isNullOrEmpty(faultData)
    ) {
        res.send(
            common.makeErrorResponse(req, StatusCode.error_req_format, null)
        );
        return;
    }
    try {
        let pluginProjectName = ''
        let pluginProjectId = null
        //根据id查询插件包信息
        const pluginProjectData = await database.queryPluginProjectByCategoryId(categoryId);
        if (pluginProjectData.length > 0) {
            const { projectName, id } = pluginProjectData[0]
            pluginProjectName = projectName;
            pluginProjectId = id;
        } else {
            res.send(common.makeErrorResponse(req, StatusCode.error_res_none, '插件包信息数据不存在'));
            return;
        }
        let pluginProjectPath = PluginPath.root + '/' + pluginProjectName;
        if (!fs.existsSync(pluginProjectPath)) {
            res.send(common.makeErrorResponse(req, StatusCode.error_project_none, '插件包不存在'));
            return;
        }
        let p1 = new Promise((resolve, reject) => {
            let writeData = JSON.parse(faultData)
            if (writeData.length > 0) {
                let writeFile = JSON.stringify(writeData[0])
                dirExists(`${PluginPath.root}/${pluginProjectName}/Resources/Langs`);
                //写入zhError.json文件
                fs.writeFile(`${PluginPath.root}/${pluginProjectName}/Resources/Langs/zhError.json`, writeFile, 'utf8', function (err) {
                    if (err) {
                        reject('写入zhError.json文件失败')
                    } else {
                        resolve('写入zhError.json文件成功');
                    }
                });
            } else {
                reject(common.makeErrorResponse(req, StatusCode.error_req_format, null));
            }
        })
        let p2 = new Promise((resolve, reject) => {
            let writeData = JSON.parse(faultData)
            if (writeData.length > 0) {
                let writeFile = JSON.stringify(writeData[1])
                dirExists(`${PluginPath.root}/${pluginProjectName}/Resources/Langs`);
                //写入enError.json文件
                fs.writeFile(`${PluginPath.root}/${pluginProjectName}/Resources/Langs/enError.json`, writeFile, 'utf8', function (err) {
                    if (err) {
                        reject('写入enError.json文件失败')
                    } else {
                        resolve('写入enError.json文件成功');
                    }
                });
            } else {
                reject(common.makeErrorResponse(req, StatusCode.error_req_format, null));
            }
        })
        Promise.all([p1, p2]).then(async (result) => {
            //更新git项目
            let updateFaultMsg = '插件项目故障更新';
            await PluginProjectGit.gitPush(pluginProjectId, updateFaultMsg);
            res.send(common.makeSuccessResponse(req, null));
        }).catch((error) => {
            res.send(common.makeErrorResponse(req, StatusCode.error_db_query, error));
        })
    }
    catch (e) {
        res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    }
}
function dirExists(dir) {
    if (!fs.existsSync(dir)) {
        //拿到上级路径
        let tempDir = path.parse(dir).dir;
        dirExists(tempDir);
        fs.mkdirSync(dir);
    }
}

module.exports = {
    updatePluginProject,
    getPluginProjects,
    getPluginProjectById,
    getPluginProjectByProjectName,
    getPluginProjectByStatus,
    checkPluginProjectStatus,
    packagePluginProject,
    getPluginProjectZip,
    deleteProductsById,
    uploadLegalsZip,
    getLegals,
    readFaultProfile,
    writeFaultProfile
};
