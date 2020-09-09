const { FormatUnit } = require('../../Unit/index');

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const compressing = require('compressing');
const pump = require('pump');

class FileUtil {
    /**
     * 检查路径文件是否存在
     * @param {*} projectPath
     */
    static async checkPath(projectPath) {
        return new Promise(async (resolve, reject) => {
            fsp.access(projectPath)
                //文件存在
                .then(async () => {
                    resolve(true);
                })
                //文件夹不存在
                .catch((e) => {
                    resolve(false);
                });
        });
    }

    static zipDecompression(srcPath, targPath) {
        return new Promise(async (resolve, reject) => {
            if (FormatUnit.isNullOrEmpty(srcPath)) {
                reject(false);
                return;
            }

            if (FormatUnit.isNullOrEmpty(targPath)) {
                reject(false);
                return;
            }

            compressing.zip
                .uncompress(srcPath, targPath)
                .then(() => {
                    resolve(true);
                    return;
                })
                .catch((err) => {
                    reject(true);
                    return;
                });
        });
    }

    static zipCompress(fileName, projectPath, outPath, callback) {
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

            pump(zipStream, fs.createWriteStream(zipFile), (err) => {
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

module.exports = FileUtil;
