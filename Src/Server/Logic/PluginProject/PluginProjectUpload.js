const database = require('../../Database/db');
const { StatusCode, PluginPath, IotHost, IotToken, Host, DevicesPlatform } = require('../../../Config');
const { FormatUnit } = require('../../../Unit');
const qs = require('qs');
const axios = require('axios');

const { LogUtil } = require('../../Util')

class PluginProjectUpload {
    async uploadBundleToIOT(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (FormatUnit.isNullOrEmpty(id)) {
                    reject(StatusCode.error_req_format);
                    return;
                }

                const result = await database.queryPluginProjectById(id);
                const projectName = result[0].projectName;

                for (const system in DevicesPlatform) {
                    const info = await this._getIotPluginInfo(projectName, system);
                    const fileName = projectName + '-' + system + '.zip';
                    const path = Host + PluginPath.bundle + '/' + fileName;

                    LogUtil.iotUploadLog.info(system + "插件包开始上传");
                    LogUtil.iotUploadLog.info({
                        packageId: info.id,
                        fileName: fileName,
                        url: path,
                        systemType: system === 'ios' ? 2 : 1
                    });
                    
                    const res = await axios.post(IotHost + '/plugins/pluginInfo/upload',
                        qs.stringify({
                            packageId: info.id,
                            fileName: fileName,
                            url: path,
                            systemType: system === 'ios' ? 2 : 1
                        }),
                        {
                            headers: {
                                authorization: IotToken
                            }
                        });

                    const mbr = res.data.mobBaseRes;

                    if (mbr.code !== StatusCode.success.code) {
                        reject(mbr.desc);
                        return;
                    }

                    // LogUtil.iotUploadLog.info(system + "插件包上传成功");
                    // LogUtil.iotUploadLog.info(mbr);
                }

                resolve('成功')
            }
            catch (e) {
                reject(e);
            }
        });
    }

    /**
     * 检查IOT平台的插件包详情
     * @param {*} id 
     */
    async _getIotPluginInfo(projectName, system) {
        return new Promise(async (resolve, reject) => {
            try {
                const pluginName = projectName + '.' + system;

                const pluginInfosResult = await axios.post(IotHost + '/plugins/package/findPackage?packageName=' + pluginName, {
                    packageName: pluginName
                }, {
                    headers: {
                        authorization: IotToken
                    }
                });

                const { code, result } = pluginInfosResult.data.mobBaseRes;

                if (code === StatusCode.success.code) {
                    if (result.length > 0) {
                        resolve(result[0]);
                    }
                    else {
                        reject("Iot上的插件包不存在: " + pluginName);
                    }
                }
                else {
                    reject(pluginInfosResult.data.mobBaseRes)
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
}

const ppu = new PluginProjectUpload();

module.exports = ppu;