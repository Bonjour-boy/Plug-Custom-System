const shell = require('shelljs');
const { Git } = require('../../Config');

class GitManager {
    static pull(path, git) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git pull');
            const url = this._getGitHttp(git);
            const gitCMD = 'git pull ' + url;
            shell.cd(path);
            shell.exec(gitCMD, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static push(path, git) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git push');
            const url = this._getGitHttp(git);
            const gitCMD = 'git push ' + url;
            shell.cd(path);
            shell.exec(gitCMD, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static add(path) {
        return new Promise((resolve, reject) => {
            const gitCMD = 'git add .';
            shell.cd(path);
            shell.exec(gitCMD, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static commit(path, msg) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git commit');
            const userName = '--author="系统<' + Git.email + '>"';
            const gitCMD = 'git commit ' + userName + ' -m "' + msg + '"';
            shell.cd(path);
            shell.exec(gitCMD, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static clone(path, git) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git clone');
            const url = this._getGitHttp(git);
            const gitCMD = 'git clone ' + url;
            shell.cd(path);
            shell.exec(gitCMD, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static configSubmodule(path, moduleName, moduleGit) {
        return new Promise((resolve, reject) => {
            shell.cd(path);
            const url = this._getGitHttp(moduleGit);
            const gitCMD = 'git config submodule.' + moduleName + '.url ' + url;
            shell.exec(gitCMD, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static updateSubmodule(path) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git submodule update');
            shell.cd(path);
            const gitCMD = 'git submodule update';
            shell.exec(gitCMD, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static config(path) {
        return new Promise((resolve, reject) => {
            shell.cd(path);
            const gitCMD_1 = 'git config user.name ' + Git.userName;
            shell.exec(gitCMD_1, (code, stdout, stderr) => {
                if (code === 0) {
                    const gitCMD_2 = 'git config user.email ' + Git.email;
                    shell.exec(gitCMD_2, (code, stdout, stderr) => {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(stderr);
                        }
                    });
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static install(path) {
        return new Promise((resolve, reject) => {
            //设置为http数据源，解决新版本node的证书问题
            shell.exec('npm config set registry http://registry.npmjs.org/');
            shell.cd(path);
            shell.exec('npm install', (code, stdout, stderr) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static checkUpdate(path) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git status -z');
            shell.cd(path);
            shell.exec('git status -z', (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static checkCommit(path) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git log origin..HEAD');
            shell.cd(path);
            shell.exec('git log origin..HEAD', (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static reset(path, n) {
        return new Promise((resolve, reject) => {
            if (n) {
                // console.log('【Git操作】git reset HEAD~n');
                shell.cd(path);
                const gitCMD = 'git reset HEAD~' + n;
                shell.exec(gitCMD, (code, stdout, stderr) => {
                    if (code === 0) {
                        resolve(stdout);
                    } else {
                        reject(stderr);
                    }
                });
            } else {
                resolve();
            }
        });
    }

    static checkoutAll(path) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git checkout .');
            shell.cd(path);
            shell.exec('git checkout .', (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static resetAll(path) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git reset .');
            shell.cd(path);
            shell.exec('git reset .', (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static cleanAll(path) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git clean -df');
            shell.cd(path);
            shell.exec('git clean -df', (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static cleanCode(path) {
        return new Promise(async (resolve, reject) => {
            try {
                const isAsync = await GitManager.checkCommit(path);
                const commitTimes = getShowTimes(isAsync, 'commit');
                if (commitTimes) {
                    await GitManager.reset(path, commitTimes);
                }
                const isUpdate = await GitManager.checkUpdate(path);
                if (isUpdate) {
                    await GitManager.checkoutAll(path);
                    await GitManager.resetAll(path);
                    await GitManager.checkoutAll(path);
                    await GitManager.cleanAll(path);
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    static getLastLog(path) {
        return new Promise((resolve, reject) => {
            // console.log('【Git操作】git log -1');
            shell.cd(path);
            shell.exec('git log -1', (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(stderr);
                }
            });
        });
    }

    static _getGitHttp(git) {
        const subStr = git.substring(8, git.length);
        const str =
            'https://' + Git.userName + ':' + Git.password + '@' + subStr;
        return str;
    }
}

module.exports = GitManager;

function getShowTimes(str = '', check = '') {
    let i = 0;
    if (str && check) {
        const reg = new RegExp(check, 'g');
        while (reg.test(str)) {
            i++;
        }
    }
    return i;
}
