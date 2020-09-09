const database = require('../../Database/db');
const {
    StatusCode,
    PluginPath,
    Git,
    Envs,
    CurrentEnv
} = require('../../../Config');
const { FormatUnit } = require('../../../Unit');
const GitManager = require('../../Manager/GitManager');
const fsp = require('fs').promises;
const GitStatus = require('./PluginProjectGitStatus');
const axios = require('axios');
const { FileUtil, LogUtil } = require('../../Util');
const db = require('../../Database/db');

class PluginProjectGit {
    /**
     * git checkout
     * @param {*} id
     * @param {*} force
     */
    async gitCheckout(id, force = null) {
        return new Promise(async (resolve, reject) => {
            if (GitStatus.has(id)) {
                reject(StatusCode.error_git_congestion);
                return;
            }

            if (FormatUnit.isNullOrEmpty(id)) {
                reject(StatusCode.error_req_format);
                return;
            }

            GitStatus.add(id);

            try {
                const result = await database.queryPluginProjectById(id);
                const { projectName, git } = result[0];
                const projectPath = PluginPath.root + '/' + projectName;
                const isExist = await this._checkPath(projectPath);

                if (isExist) {
                    if (force) {
                        //删除文件夹
                        await fsp.rmdir(projectPath, { recursive: true });
                        await this._gitClone(projectPath, git, id);
                        GitStatus.delete(id);
                        resolve(null);
                    } else {
                        await this._gitPull(projectPath, git, id);
                        GitStatus.delete(id);
                        resolve(null);
                    }
                } else {
                    await this._gitClone(projectPath, git, id);
                    GitStatus.delete(id);
                    resolve(null);
                }
            } catch (e) {
                GitStatus.delete(id);
                reject(e);
            }
        });
    }

    /**
     * git push
     * @param {*} id
     * @param {*} message
     */
    async gitPush(id, message = '更新配置文件') {

        return new Promise(async (resolve, reject) => {
            if (FormatUnit.isNullOrEmpty(id)) {
                reject(StatusCode.error_req_format);
                return;
            }
            if (FormatUnit.isNullOrEmpty(message)) {
                reject(StatusCode.error_req_format);
                return;
            }
            //测试环境不更新，防止数据污染，有需要手动注释
            if (CurrentEnv !== Envs.prod) {
                resolve();
                return;
            }

            LogUtil.gitLog.info('项目Push');
            try {
                const result = await database.queryPluginProjectById(id);
                const { projectName, git } = result[0];
                const projectPath = PluginPath.root + '/' + projectName;
                const isExist = await this._checkPath(projectPath);
                //如果存在
                if (isExist) {
                    const isUpdate = await GitManager.checkUpdate(projectPath);
                    const isAsync = await GitManager.checkCommit(projectPath);
                    // console.log('\nisUpdate:' + isUpdate, 'isAsync:' + isAsync);
                    if (isUpdate) {
                        await GitManager.config(projectPath);
                        await GitManager.add(projectPath);
                        await GitManager.commit(
                            projectPath,
                            '[自动构建]' + message
                        );
                    }
                    if (isUpdate || isAsync) {
                        await GitManager.push(projectPath, git);
                        await this._updateGitLog(id, projectPath);
                    }

                    resolve();
                }
                //如果不存在
                else {
                    reject(StatusCode.error_common);
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * 检查路径文件是否存在
     * @param {*} projectPath
     */
    async _checkPath(projectPath) {
        return new Promise(async (resolve, reject) => {
            fsp.access(projectPath)
                //文件存在
                .then(async () => {
                    resolve(true);
                })
                //文件夹不存在，clone项目
                .catch(e => {
                    resolve(false);
                });
        });
    }

    /**
     * git完全克隆
     * @param {*} projectPath
     */
    async _gitClone(projectPath, git, id) {
        return new Promise(async (resolve, reject) => {
            try {
                LogUtil.gitLog.info('项目Clone');
                await GitManager.clone(PluginPath.root, git);
                await GitManager.configSubmodule(
                    projectPath,
                    Git.submoduleName,
                    Git.submoduleGit
                );
                await GitManager.updateSubmodule(projectPath);
                await GitManager.install(projectPath);
                await this._updateGitLog(id, projectPath);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * git拉取
     * @param {*} projectPath
     * @param {*} git
     */
    async _gitPull(projectPath, git, id) {
        return new Promise(async (resolve, reject) => {
            try {
                LogUtil.gitLog.info('项目Pull');
                await GitManager.cleanCode(projectPath);
                await GitManager.pull(projectPath, git);
                await GitManager.updateSubmodule(projectPath);
                await GitManager.install(projectPath);
                await this._updateGitLog(id, projectPath);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    async _updateGitLog(id, projectPath) {
        return new Promise(async function (resolve, reject) {
            try {
                const log = await GitManager.getLastLog(projectPath);
                const logList = log.split('\n');
                const date = new Date(logList[2].slice(5));
                await db.updatePluginProject({
                    id,
                    last_update_msg: logList[4],
                    last_update_date:
                        date.getMonth() +
                        1 +
                        '月 ' +
                        date.getDate() +
                        '日 ' +
                        date.getHours() +
                        ':' +
                        date.getMinutes() +
                        ':' +
                        date.getSeconds()
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}

const ppg = new PluginProjectGit();

module.exports = ppg;
