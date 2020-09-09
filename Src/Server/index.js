const express = require('express');
const app = express();
const category = require('./Logic/Category/Category');
const product = require('./Logic/Product/Product');
const pluginProject = require('./Logic/PluginProject/PluginProject');
const { Server, Host, StatusCode } = require('../Config');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const common = require('./Logic/Common/Common');
const db = require('./Database/db');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { LogUtil } = require('./Util');
const cors = require('cors');

app.use(LogUtil.httpLogger);
global.logger = LogUtil.logger;
//使用跨域的中间件
app.use(cors());
app.use(express.static(Server.outputDirectory));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());

const objMulter = multer({ dest: './Src/Server/Public/Upload' }); //实例化multer,传递的参数对象，dest表示上传文件的路径
app.use(express.static(path.join(__dirname, './Public/')));
app.use(objMulter.any()); //any表示任意类型的文件

app.use('/swagger', express.static(__dirname + '/Public/Swagger'));

app.listen(Server.port, () => {
    LogUtil.logger.info("服务器已启动: " + Host);
});

/**
 * @swagger
 * components:
 *  schemas:
 *    CommonResult:
 *      type: object
 *      properties:
 *        code:
 *          type: integer
 *          default: 100
 *        msg:
 *          type: string
 *          default: 成功
 *        result:
 *          type: object
 *          nullable: true
 */

app.post('/api/cmdtest', (req, res) => {
    const { cmd } = req.body;

    shell.exec(cmd, (code, stdout, stderr) => {
        if (code === 0) {
            res.send(common.makeSuccessResponse(req, stdout));
        } else {
            res.send(common.makeSuccessResponse(req, '执行失败=' + stderr));
        }
    });
});

app.post('/api/dbtest', async (req, res) => {
    const { sql } = req.body;

    const sqlTest = sql.toUpperCase();
    if (
        sqlTest.indexOf('DELETE') !== -1 ||
        sqlTest.indexOf('REPLACE') !== -1 ||
        sqlTest.indexOf('CREATE') !== -1 ||
        sqlTest.indexOf('ALTER') !== -1 ||
        sqlTest.indexOf('DROP') !== -1 ||
        sqlTest.indexOf('RENAME') !== -1 ||
        sqlTest.indexOf('INSERT') !== -1 ||
        sqlTest.indexOf('UPDATE') !== -1 ||
        sqlTest.indexOf('TRUNCATE') !== -1
    ) {
        res.send(common.makeErrorResponse(req, StatusCode.error_common));
        return;
    }

    // try {
    //     const result = await db.querySql(sql);
    //     let r = null;
    //     if (result != null) {
    //         r = JSON.stringify(result);
    //     }

    //     res.send(common.makeSuccessResponse(req, r));
    // } catch (e) {
    //     res.send(common.makeErrorResponse(req, StatusCode.error_db_query, e));
    // }
});

app.get('/api/v1/getCategorys', (req, res) => {
    category.getCategorys(req, res);
});

app.get('/api/v1/getLocalCategorys', (req, res) => {
    category.getLocalCategorys(req, res);
});

//更新品类配置
app.post('/api/v1/updateCategoryConfig', (req, res) => {
    category.updateCategoryConfig(req, res);
});

//更新品类参数
app.post("/api/v1/updateCategoryParams", (req, res) => {
    category.updateCategoryParams(req, res);
});

//上传品类参数Json文件
app.post('/api/v1/uploadCategoryParams', (req, res) => {
    category.uploadCategoryParams(req, res);
});

//获取产品数据
app.get('/api/v1/getProducts', (req, res) => {
    product.getProducts(req, res);
});

//获取本地产品数据
app.get('/api/v1/getLocalProducts', (req, res) => {
    product.getLocalProducts(req, res);
});

//根据id获取产品Params数据
app.get('/api/v1/getProductParams', (req, res) => {
    product.getProductParams(req, res);
});


//根据id删除本地产品数据
app.post('/api/v1/deleteLocalProductsById', (req, res) => {
    product.deleteLocalProductsById(req, res);
});

//更新产品配置
app.post('/api/v1/updateProductConfig', (req, res) => {
    product.updateProductConfig(req, res);
});

//更新产品参数
app.post('/api/v1/updateProductParams', (req, res) => {
    product.updateProductParams(req, res);
});

//获取全部插件包信息
app.get('/api/v1/getPluginProjects', (req, res) => {
    pluginProject.getPluginProjects(req, res);
});

//根据id获取插件包信息
app.get('/api/v1/getPluginProjectById', (req, res) => {
    pluginProject.getPluginProjectById(req, res);
});

// 根据ID删除插件包
app.post('/api/v1/deleteProductsById', (req, res) => {
    pluginProject.deleteProductsById(req, res);
});

//更新插件包信息
app.post('/api/v1/updatePluginProject', (req, res) => {
    pluginProject.updatePluginProject(req, res);
});

//打包插件
app.post('/api/v1/packagePluginProject', (req, res) => {
    pluginProject.packagePluginProject(req, res);
});

//打bundle插件包
app.post('/api/v1/packageBundlePluginProject', (req, res) => {
    pluginProject.packageBundlePluginProject(req, res);
});

app.post('/api/v1/uncompressPluginProject', (req, res) => {
    pluginProject.uncompressPluginProject(req, res);
});

//根据项目名称查询插件包信息
app.get('/api/v1/getPluginProjectByProjectName', (req, res) => {
    pluginProject.getPluginProjectByProjectName(req, res);
});

//获取zip包
app.get('/api/v1/getPluginProjectZip', (req, res) => {
    pluginProject.getPluginProjectZip(req, res);
});

//根据状态获取插件包
app.get('/api/v1/getPluginProjectByStatus', (req, res) => {
    pluginProject.getPluginProjectByStatus(req, res);
});

//检查当前的插件包状态
app.get('/api/v1/checkPluginProjectStatus', (req, res) => {
    pluginProject.checkPluginProjectStatus(req, res);
});

//获取插件项目故障信息
app.get('/api/v1/readFaultProfile', (req, res) => {
    pluginProject.readFaultProfile(req, res);
});

//写入插件项目故障文件
app.post('/api/v1/writeFaultProfile', (req, res) => {
    pluginProject.writeFaultProfile(req, res);
});

//将插件包路径的绝对路径作为静态资源文件
app.use(
    __dirname + '/PluginProjects/Zip/',
    express.static(__dirname + '/PluginProjects/Zip/')
);
app.use(
    __dirname + '/PluginProjects/Bundle/',
    express.static(__dirname + '/PluginProjects/Bundle/')
);

app.post('/api/upload', (req, res) => {
    let oldName = req.files[0].path;
    let newName = req.files[0].path + path.parse(req.files[0].originalname).ext;
    fs.renameSync(oldName, newName);

    //写入数据库
    /*  const sql = " INSERT INTO `tb_upload_file`(`file_name`, `file_type`, `file_format`, `file_size`, `file_path`, `file_md5`) VALUES ('abc', 'image', 'gif', 111, '/usr/', '11111111')";
     db.querySql(sql, (err, result) => {
         if (err) {
             console.log(err);
         } else {
             console.log(result);
             res.send("insert data to cartoon_frame success!")
         }
     }) */
    res.send({
        code: 100,
        desc: '处理成功',
        result: {
            url:
                'http://localhost:8080/Upload/' +
                req.files[0].filename +
                path.parse(req.files[0].originalname).ext
        }
    });
});

app.get('/api/getLog', (req, res) => {
    var type = req.query.type;
    var dateStr = req.query.dateStr;
    if (!type || !dateStr) {
        res.send(common.makeErrorResponse(req, StatusCode.error_req_format));
        return;
    }
    if (dateStr === 'today') {
        dateStr = '';
    }
    var logPath = path.resolve(__dirname, '../../Logs');
    logPath = logPath + '/' + type + '.log' + (dateStr ? ('.' + dateStr) : '');
    // logger.info('access logfile',logPath);
    if (fs.existsSync(logPath)) {
        fs.readFile(logPath, 'utf-8', (err, result) => {
            if (err) {
                res.send(common.makeSuccessResponse(req, err));
                return;
            }
            res.send(common.makeSuccessResponse(req, result));
        });
    } else {
        res.send(common.makeSuccessResponse(req, ''));
    }
});

app.post('/api/uploadLegalsZip', (req, res) => {
    pluginProject.uploadLegalsZip(req, res);
});

app.post('/api/v1/getPluginProjectLegalsInfo', (req, res) => {
    pluginProject.getLegals(req, res);
});