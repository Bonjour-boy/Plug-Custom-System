const database = require('../../Database/db');
const { StatusCode, PluginPath, DevicesPlatform } = require('../../../Config');
const { FormatUnit } = require('../../../Unit');
const GitManager = require('../../Manager/GitManager');
const { FileUtil, LogUtil } = require('../../Util/index');

const exec = require('child_process').exec;
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const compressing = require('compressing');
const pump = require('pump');

const shell = require('shelljs');

class PluginProjectBundle {
    async packageBundle(id) {
        return new Promise(async (resolve, reject) => {
            if (FormatUnit.isNullOrEmpty(id)) {
                reject(StatusCode.error_req_format);
                return;
            }

            LogUtil.bundleLog.info('开始打包');

            try {
                const result = await database.queryPluginProjectById(id);
                if (result.length > 0) {
                    const { projectName } = result[0];
                    const projects = '/projects/';

                    let fileNameEnd = '.zip';
                    let zipFile = PluginPath.zip + '/' + projectName + fileNameEnd;
                    let uncompressPath = PluginPath.RN54 + projects + projectName;
                    let buildEvn = PluginPath.RN54 + '/';
                    let buildEvnNode = PluginPath.RN54 + '/node_modules';
                    let buildOutPath = PluginPath.RN54 + projects + projectName + '/build';
                    let bundleOutPath = PluginPath.bundle + '/';

                    LogUtil.bundleLog.info('zip解压');
                    const r_uncompress = await this._uncompressPluginProject(zipFile, uncompressPath);
                    if (r_uncompress.code !== StatusCode.success.code) {
                        reject(StatusCode.error_common);
                        return;
                    }

                    //RN环境校验
                    if (!(await FileUtil.checkPath(buildEvnNode))) {
                        LogUtil.bundleLog.info('安装RN环境');
                        await GitManager.install(buildEvn);
                        //RN打包环境替换其中一个出错的文件
                        LogUtil.bundleLog.info('修复RN54兼容问题');
                        await this._replaceEnvFile();
                    }

                    //开始循环执行打包脚本
                    for (var device in DevicesPlatform) {
                        let selectPlatform = device;

                        let bundlePath = PluginPath.RN54 + projects + projectName + '/build/bundle-' + selectPlatform;
                        let bundleName = projectName + '-' + selectPlatform + fileNameEnd;

                        LogUtil.bundleLog.info('正在打包' + selectPlatform);
                        await this._runBuildRn54(projectName, selectPlatform);

                        LogUtil.bundleLog.info('压缩bundle');
                        const r_compressZip = await this._compressBundleToZip(bundleName, bundlePath, bundleOutPath);
                        if (r_compressZip.code === StatusCode.success.code) {
                            console.log('【bundle操作5】 成功平台:', selectPlatform);
                        } else {
                            console.log('【bundle操作5】 失败平台：', selectPlatform);
                            reject(StatusCode.error_common);
                            return;
                        }
                    }

                    LogUtil.bundleLog.info('bundle完成');

                    resolve(StatusCode.success);
                } else {
                    reject(StatusCode.error_db_query);
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    async _uncompressPluginProject(srcPath, targPath) {
        return new Promise(async (resolve, reject) => {
            if (FormatUnit.isNullOrEmpty(srcPath)) {
                reject(StatusCode.error_req_format);
                return;
            }

            if (FormatUnit.isNullOrEmpty(targPath)) {
                reject(StatusCode.error_req_format);
                return;
            }

            compressing.zip
                .uncompress(srcPath, targPath)
                .then(() => {
                    resolve(StatusCode.success);
                    return;
                })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }

    async _runBuildRn54(projectName, system) {
        return new Promise(async (resolve, reject) => {
            try {
                const projectPath = PluginPath.RN54 + '/projects/' + projectName;
                const buildPath = projectPath + '/build';
                if (await FileUtil.checkPath(buildPath)) {
                    await fsp.rmdir(buildPath, { recursive: true });
                }
                await fsp.mkdir(buildPath, { recursive: true });

                //bundle输出路径
                const bundlePath = projectPath + '/build/bundle-' + system;
                await fsp.mkdir(bundlePath, { recursive: true });

                const entryFilePath = './projects/' + projectName + '/viomiIndex.js';
                const bundleOutputPath = './projects/' + projectName + '/build/bundle-' + system + '/viomiIndex.bundle';
                const assetsDestPath = './projects/' + projectName + '/build/bundle-' + system;
                const buildCmd =
                    'cd ' + PluginPath.RN54 + 
                    ' && npx react-native bundle' +
                    // ' && node_modules/.bin/react-native bundle' +
                    ' --entry-file ' + entryFilePath +
                    ' --bundle-output ' + bundleOutputPath +
                    ' --platform ' + system +
                    ' --assets-dest ' + assetsDestPath +
                    ' --dev false';

                LogUtil.bundleLog.info('执行bundle指令');
                LogUtil.bundleLog.info(buildCmd);
                exec(buildCmd, function (error, stdout, stderr) {
                    if (error) {
                        reject(error);
                        return;
                    }
                    if (stderr) {
                        reject(stderr);
                        return;
                    }

                    LogUtil.bundleLog.info('bundle成功');
                    //更新bundlePath的配置文件
                    var obj = JSON.parse(
                        fs.readFileSync(projectPath + '/package-' + system + '.json')
                    );
                    var str = JSON.stringify(obj);
                    fs.writeFileSync(
                        bundlePath + '/package.json',
                        str
                    );

                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async _compressBundleToZip(bundleZipName, bundlePath, bundleOutPath) {
        return new Promise(async (resolve, reject) => {
            let filePath = bundleOutPath + bundleZipName;
            if (await FileUtil.checkPath(filePath)) {
                fs.unlinkSync(filePath);
            }

            this._projectCompress(bundleZipName, bundlePath, bundleOutPath, (isSuccess) => {
                if (isSuccess) {
                    resolve(StatusCode.success);
                } else {
                    reject();
                }
            });
        });
    }

    async _projectCompress(fileName, projectPath, outPath, callback) {
        try {
            let isExistProjectPath = await FileUtil.checkPath(projectPath);
            if (!isExistProjectPath) {
                callback(false);
                return;
            }

            let isExistOutPath = await FileUtil.checkPath(outPath);
            if (!isExistOutPath) {
                fs.mkdirSync(outPath);
            }

            let zipFile = outPath + '/' + fileName;
            if (await FileUtil.checkPath(zipFile)) {
                fs.unlinkSync(zipFile);
            }

            let zipStream = new compressing.zip.Stream();
            fs.readdirSync(projectPath).forEach((item, index) => {
                let zipItem = path.join(projectPath, item);
                zipStream.addEntry(zipItem);
            });

            pump(zipStream, fs.createWriteStream(zipFile), (err) => {
                if (err) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } catch (e) {
            console.log('compress err：', e);
            callback(false);
        }
    }

    async _replaceEnvFile() {
        return new Promise(async (resolve, reject) => {
            try {
                let envFile = PluginPath.RN54 + '/blacklist.js';
                let targFilePath = PluginPath.RN54 + '/node_modules/metro/src/';
                let targFile = PluginPath.RN54 + '/node_modules/metro/src/blacklist.js';
                let isExistFile = FileUtil.checkPath(envFile);
                if (isExistFile) {
                    if (await FileUtil.checkPath(targFile)) {
                        fs.unlinkSync(targFile);
                    }

                    fs.readFile(envFile, 'utf-8', async (err, data) => {
                        if (err) {
                            reject();
                        }
                        await fsp.mkdir(targFilePath, { recursive: true });
                        fs.writeFile(targFile, data, 'utf-8', (error) => {
                            if (error) {
                                reject();
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            } catch (e) {
                reject();
            }
        });
    }
}

const ppb = new PluginProjectBundle();

module.exports = ppb;
