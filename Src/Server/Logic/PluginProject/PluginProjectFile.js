const database = require('../../Database/db');
const { StatusCode, PluginPath, Platform } = require('../../../Config');
const { FormatUnit } = require('../../../Unit');
const { FileUtil, LogUtil } = require('../../Util/index');

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const compressing = require('compressing');
const pump = require('pump');
const moment = require('moment');

function dirExists(dir) {
    if (!fs.existsSync(dir)) {
        //拿到上级路径
        let tempDir = path.parse(dir).dir;
        dirExists(tempDir);
        fs.mkdirSync(dir);
    }
}

class PluginProjectFile {
    async insertConfigFile(id) {
        return new Promise(async (resolve, reject) => {
            if (FormatUnit.isNullOrEmpty(id)) {
                reject(StatusCode.error_req_format);
                return;
            }
            LogUtil.packageLog.info('更新配置文件');

            try {
                const msg =
                    '写入配置文件 - ' + moment().format('YYYY-MM-DD HH:mm:ss');
                //model键名
                let modelKeys = [];
                let allModel = [];
                let obj = {};
                let configData = [];
                let paramsData = [];
                //根据id查询插件包信息
                const pluginProjectData = await database.queryPluginProjectById(
                    id
                );
                if (pluginProjectData.length === 0) {
                    reject(StatusCode.error_res_none);
                    return;
                }

                const { projectName, categoryId } = pluginProjectData[0];

                //根据type（CategoryId）查询所有model
                const typeModels = await database.queryProductByModel(
                    categoryId
                );

                if (typeModels.length > 0) {
                    typeModels.map(item => {
                        let { model, config, params } = item;
                        configData.push(config);
                        paramsData.push(params);
                        let arr = model.split('.');
                        let s = arr.shift() + '_' + arr.pop();
                        modelKeys.push(s);
                        obj[s] = model;
                        allModel.push(model);
                    });
                } else {
                    reject(StatusCode.error_res_none);
                    return;
                }

                const DevicesPath = `${PluginPath.root}/${projectName}/Main/Config/Model`;
                const DeviceModelConfigPath = `${DevicesPath}/DeviceModelConfig.js`;

                const DeviceModelParamsPath = `${DevicesPath}/DeviceModelParams.js`;

                //生成DeviceConfig.js文件，model关系映射表
                const c1 = new Promise(function (resolve, reject) {
                    const configFilePath = `${PluginPath.root}/${projectName}/Main/Config/DeviceConfig.js`;
                    var writeContent = `export default ${JSON.stringify(obj)}`;
                    dirExists(`${PluginPath.root}/${projectName}/Main/Config`);
                    //写入DeviceConfig文件
                    fs.writeFile(
                        configFilePath,
                        writeContent,
                        'utf8',
                        function (err) {
                            if (err) {
                                reject('写入DeviceConfig文件失败');
                            } else {
                                resolve('写入DeviceConfig文件成功');
                            }
                        }
                    );
                });

                //生成每个产品的config和params文件
                const c2 = new Promise(function (resolve, reject) {
                    dirExists(`${DevicesPath}/Devices`);
                    dirExists(`${DevicesPath}/Params`);
                    modelKeys.map((item, index) => {
                        console.log(111, item);
                        //写入配置文件，没有则创建文件
                        fs.writeFile(
                            `${DevicesPath}/Devices/${item}_model_config.json`,
                            configData[index],
                            function (error) {
                                if (error) {
                                    reject('写入配置文件失败');
                                } else {
                                    resolve('写入配置文件成功');
                                }
                            }
                        );

                        //如果存在参数文件
                        const params = paramsData[index];
                        if (!FormatUnit.isNullOrEmpty(params)) {
                            fs.writeFile(
                                `${DevicesPath}/Params/${item}_model_params.json`,
                                params,
                                function (error) {
                                    if (error) {
                                        reject('写入配置文件失败');
                                    } else {
                                        resolve('写入配置文件成功');
                                    }
                                }
                            );
                        }
                    });
                });

                //生成每个产品的config和params映射关系
                const c3 = new Promise(function (resolve, reject) {
                    let deviceConfigs = '';
                    let deviceParams = '';

                    modelKeys
                        .map((item, index) => {
                            deviceConfigs += `
                        case DeviceConfig.${item}: {
                            deviceModelConfig = require('./Devices/${item}_model_config.json');
                        }
                        break;
                        `;

                            //如果存在参数文件
                            const params = paramsData[index];
                            if (!FormatUnit.isNullOrEmpty(params)) {
                                deviceParams += `
                            case DeviceConfig.${item}: {
                                deviceModelParams = require('./Params/${item}_model_params.json');
                            }
                            break;
                            `;
                            }
                        })
                        .join('');

                    var writeDatas = `
                        import CommonAdapter from '../../../Viomi-plugin-sdk/Adapter/CommonAdapter';
                        import DeviceConfig from '../DeviceConfig';
                        let deviceModelConfig = null;  
                        switch (CommonAdapter.deviceModel) {
                            ${deviceConfigs}
                        }
                        export default deviceModelConfig;
                        `;
                    dirExists(`${DevicesPath}`);
                    //写入DeviceModelConfig文件
                    fs.writeFile(
                        DeviceModelConfigPath,
                        writeDatas,
                        'utf8',
                        function (err) {
                            if (err) {
                                reject('写入DeviceModelConfig文件失败');
                            } else {
                                resolve('写入DeviceModelConfig文件成功');
                            }
                        }
                    );

                    //如果存在参数文件
                    if (!FormatUnit.isNullOrEmpty(deviceParams)) {
                        const writeParamsDatas = `
                            import CommonAdapter from '../../../Viomi-plugin-sdk/Adapter/CommonAdapter';
                            import DeviceConfig from '../DeviceConfig';
                            let deviceModelParams = null;  
                            switch (CommonAdapter.deviceModel) {
                                ${deviceParams}
                            }
                            export default deviceModelParams;
                            `;
                        //写入DeviceModelParams文件
                        fs.writeFile(
                            DeviceModelParamsPath,
                            writeParamsDatas,
                            'utf8',
                            function (err) {
                                if (err) {
                                    reject('写入DeviceModelParams文件失败');
                                } else {
                                    resolve('写入DeviceModelParams文件成功');
                                }
                            }
                        );
                    }
                });

                //增加ios的构建版本号
                const c4 = new Promise((resolve, reject) => {
                    let str = '';
                    fs.readFile(
                        `${PluginPath.root}/${projectName}/package-ios.json`,
                        'utf8',
                        (err, files) => {
                            if (err) {
                                reject('读取package-ios文件失败');
                            } else {
                                if (FormatUnit.isJsonString(files)) {
                                    let data = JSON.parse(files);
                                    let { models, versionCode } = data;
                                    allModel.map((item, index) => {
                                        if (index == allModel.length - 1) {
                                            str += `${item}`;
                                        } else {
                                            str += `${item}|`;
                                        }
                                    });
                                    var writeContent1 = files.replace(
                                        models,
                                        str
                                    );
                                    var writeContent2 = writeContent1.replace(
                                        versionCode,
                                        versionCode + 1
                                    );
                                    //写入package-ios.json文件
                                    fs.writeFile(
                                        `${PluginPath.root}/${projectName}/package-ios.json`,
                                        writeContent2,
                                        'utf8',
                                        function (err) {
                                            if (err) {
                                                reject(
                                                    '写入package-ios文件失败'
                                                );
                                            } else {
                                                resolve(
                                                    '写入package-ios文件成功'
                                                );
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                });

                //增加android的构建版本号
                const c5 = new Promise((resolve, reject) => {
                    let str = '';
                    fs.readFile(
                        `${PluginPath.root}/${projectName}/package-android.json`,
                        'utf8',
                        (err, files) => {
                            if (err) {
                                reject('读取package-android文件失败');
                            } else {
                                if (FormatUnit.isJsonString(files)) {
                                    let data = JSON.parse(files);
                                    let { models, versionCode } = data;
                                    allModel.map((item, index) => {
                                        if (index == allModel.length - 1) {
                                            str += `${item}`;
                                        } else {
                                            str += `${item}|`;
                                        }
                                    });
                                    var writeContent1 = files.replace(
                                        models,
                                        str
                                    );
                                    var writeContent2 = writeContent1.replace(
                                        versionCode,
                                        versionCode + 1
                                    );
                                    //写入package-android.json文件
                                    fs.writeFile(
                                        `${PluginPath.root}/${projectName}/package-android.json`,
                                        writeContent2,
                                        'utf8',
                                        function (err) {
                                            if (err) {
                                                reject(
                                                    '写入package-android文件失败'
                                                );
                                            } else {
                                                resolve(
                                                    '写入package-android文件成功'
                                                );
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                });
                Promise.all([c1, c2, c3, c4, c5])
                    .then(result => {
                        resolve(msg);
                    })
                    .catch(error => {
                        reject(error);
                    });
            } catch (e) {
                reject(e);
            }
        });
    }

    async updateLegals(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const productResult = await database.queryPluginProjectById(id);
                if (productResult.length > 0) {
                    const { categoryId, projectName } = productResult[0];
                    const legalsFileZip =
                        PluginPath.upload + '/legals_' + categoryId + '.zip';
                    const projectPath = PluginPath.root + '/' + projectName;
                    const isZipExist = await FileUtil.checkPath(legalsFileZip);
                    const isProjectPath = await FileUtil.checkPath(projectPath);
                    const legalsPath = projectPath + '/Resources/Legals';

                    if (isZipExist && isProjectPath) {
                        await fsp.rmdir(legalsPath, { recursive: true });
                        await FileUtil.zipDecompression(
                            legalsFileZip,
                            legalsPath
                        );
                        await fsp.rmdir(legalsFileZip, { recursive: true });
                        resolve();
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            } catch (e) {
                resolve();
            }
        });
    }

    async compressPluginProject(id, platform) {
        return new Promise(async (resolve, reject) => {
            if (FormatUnit.isNullOrEmpty(id)) {
                reject(StatusCode.error_req_format);
                return;
            }
            LogUtil.packageLog.info('压缩项目代码');
            try {
                const result = await database.queryPluginProjectById(id);
                if (result.length > 0) {
                    const { projectName } = result[0];
                    let fileName = projectName;
                    let fileNameEnd =
                        platform === Platform.viot ? '.zip' : '.mpkg';
                    let projectPath = PluginPath.root + '/' + projectName;
                    let outPath = PluginPath.zip;

                    this._projectCompress(
                        fileName + fileNameEnd,
                        projectPath,
                        outPath,
                        isSuccess => {
                            if (isSuccess) {
                                resolve();
                            } else {
                                reject('压缩失败');
                            }
                        }
                    );
                } else {
                    reject(StatusCode.error_db_query);
                }
            } catch (e) {
                reject(StatusCode.error_db_query);
            }
        });
    }

    async checkLegals(filePath) {
        return new Promise(async (resolve, reject) => {
            let srcPath = filePath;
            let tmpPath = PluginPath.upload + '/tmplegals';
            const isSuccess = await FileUtil.zipDecompression(srcPath, tmpPath);
            if (isSuccess) {
                let isLegals = false;
                let fileList = fs.readdirSync(tmpPath);
                LogUtil.logger.log('检查压缩包：', fileList);
                for (var idx in fileList) {
                    let item = fileList[idx];
                    //MAC系统压缩文件的信息包
                    if (item === '__MACOSX') {
                        isLegals = true;
                    } else {
                        if (
                            item.indexOf('private') !== -1 ||
                            item.indexOf('useragreement') !== -1
                        ) {
                            isLegals = true;
                        } else {
                            isLegals = false;
                            break;
                        }
                    }
                }

                if (!isLegals) {
                    await fsp.rmdir(filePath, { recursive: true });
                }
                await fsp.rmdir(tmpPath, { recursive: true });
                resolve(isLegals);
            } else {
                console.log('解压失败');
                resolve(false);
            }
        });
    }

    async getLegalsList(path) {
        return new Promise(async (resolve, rejects) => {
            let fileList = fs.readdirSync(path);
            let list = [];
            for (let idx in fileList) {
                let item = fileList[idx];
                if (item === '__MACOSX') {
                    continue;
                }
                let itemPath = path + '/' + item;
                // console.log('itemPath :', itemPath);
                let data = fs.readFileSync(itemPath, 'utf-8');
                list.push({ itemName: item, data: data });
            }
            resolve(list);
        });
    }

    _projectCompress(fileName, projectPath, outPath, callback) {
        let zipFile = outPath + '/' + fileName;

        if (!fs.existsSync(projectPath)) {
            callback(false);
            return;
        }

        if (!fs.existsSync(outPath)) {
            fs.mkdirSync(outPath);
        }

        if (fs.existsSync(zipFile)) {
            fs.unlinkSync(zipFile);
        }

        try {
            let zipStream = new compressing.zip.Stream();
            fs.readdirSync(projectPath).forEach((item, index) => {
                let zipItem = path.join(projectPath, item);
                zipStream.addEntry(zipItem);
            });

            pump(zipStream, fs.createWriteStream(zipFile), err => {
                if (err) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } catch (e) {
            console.log('compress err：', e);
        }
    }
}

const ppf = new PluginProjectFile();

module.exports = ppf;
