const { Database } = require('../../Config');
const mysql = require('mysql')
const dbConfig = require('./config.json');
const { FormatUnit } = require('../../Unit');
const { Sequelize, Model, DataTypes, QueryInterface } = require('sequelize');
const cls = require('cls-hooked');
const { values } = require('mobx');

// 创建一个 Sequelize 实例，连接数据库
const sequelize = new Sequelize(
    // 'database',
    //  'username', 'password',
    {
        database: Database.database,
        username: Database.user,
        password: Database.password,

        // 要连接的数据库的方言。
        dialect: 'mysql',
        // custom host; default: localhost
        host: Database.host,
        // custom port; default: dialect default
        port: Database.port,
        // disable inserting undefined values as NULL
        omitNull: true,
        // similar for sync: you can define this to always force sync for models
        sync: { force: true },

        // pool configuration used to pool database connections
        pool: {
            // 池中的最大连接数
            max: 20,
            // 释放连接之前空闲的最长时间(以毫秒为单位)。
            idle: 1000,
            // 在抛出错误之前，该池尝试连接的最大时间(以毫秒为单位)
            acquire: 2000,
        },
    }
)

// 关闭和数据库的连接，是异步的，并返回一个 Promise
// sequelize.close()

// 创建一个model，代表数据库中表的抽象
const category = sequelize.define('category', {
    "id": {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    "name": {
        type: DataTypes.TEXT,
    },
    "description": {
        type: DataTypes.TEXT,
    },
    "config": {
        type: DataTypes.TEXT,
    },
    "comment": {
        type: DataTypes.TEXT,
    },
    "params": {
        type: DataTypes.TEXT,
    }
}, {
    timestamps: false,
    freezeTableName: true
})

// 创建一个model，代表数据库中表的抽象
const product = sequelize.define('product', {
    "id": {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    "config": {
        type: DataTypes.STRING,
    },
    "params": {
        type: DataTypes.STRING,
    },
    "name": {
        type: DataTypes.STRING,
    },
    "model": {
        type: DataTypes.STRING,
    },
    "status": {
        type: DataTypes.INTEGER,
    },
    "type": {
        type: DataTypes.INTEGER,
    },
    "typeComment": {
        type: DataTypes.STRING,
    },
    "createdTime": {
        type: DataTypes.DATE,
    },
    "moduleId": {
        type: DataTypes.INTEGER,
    },
    "protocolName": {
        type: DataTypes.STRING,
    }
}, {
    timestamps: false,
    freezeTableName: true
})

// 创建一个model，代表数据库中表的抽象
const pluginProject = sequelize.define('plugin_projects', {
    "id": {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    "name": {
        type: DataTypes.STRING,
    },
    "projectName": {
        type: DataTypes.STRING,
    },
    "status": {
        type: DataTypes.INTEGER,
        // defaultValue:0
    },
    "platform": {
        type: DataTypes.INTEGER,
        // defaultValue:0
    },
    "categoryId": {
        type: DataTypes.INTEGER,
        // defaultValue:0
    },
    "git": {
        type: DataTypes.STRING,
    },
    "last_update_msg": {
        type: DataTypes.STRING,
    },
    "last_update_date": {
        type: DataTypes.STRING,
    }
}, {
    timestamps: false,
    freezeTableName: true
})

// 创建一个model，代表数据库中表的抽象
const user = sequelize.define('user', {
    "id": {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        validate: {
            notNull: {
                msg: 'Please enter your id'
            }
        }
    },
    "username": {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    "password": {
        type: DataTypes.STRING,
    },
    "nickname": {
        type: DataTypes.INTEGER,
        // defaultValue:0
    },
    "authority": {
        type: DataTypes.INTEGER,
        // defaultValue:0
    },
    "created": {
        type: DataTypes.INTEGER,
        // defaultValue:0
    },
    "updated": {
        type: DataTypes.STRING,
    },
    "accessToken": {
        type: DataTypes.STRING,
    },
    "tokenSigned": {
        type: DataTypes.STRING,
    },
    "tokenExpires": {
        type: DataTypes.STRING,
    },
    "verifyCode": {
        type: DataTypes.STRING,
    },
    "accessToken": {
        type: DataTypes.STRING,
    },
    "accessToken": {
        type: DataTypes.STRING,
    },
}, {
    timestamps: false,
    freezeTableName: true
})

/**
 * 根据type获取model型号
 * @param {*} 根据type获取model
 */
function queryProductByModel(type) {
    return category.findAll({ where: { type: type } });
}

/**
 * 根据品类id获取配置
 * @param {*} id 
 */
function queryConfigByCateId(id) {
    return category.findAll({ attributes: ['config'], where: { id: id } });
}

function replaceCategory(params) {
    return category.update(params);
}

function replaceCategory(params) {
    return category.update(params);
}

function replaceProduct(params) {
    return product.update(params);
}

function queryProductById(id) {
    return product.findAll({ where: { id: id } })
}

/**
 * 根据id查询产品的配置
 * @param {*} ids 
 */
function queryProductConfigByIds(ids) {
    const idsStr = ids.toString();

    return product.findAll({ attributes: ['id', 'config'], id: [idsStr] })
}

function queryCateConfigByIds(ids) {
    const idsStr = ids.toString();
    return category.findAll({ attributes: ['id', 'config'], id: [idsStr] })
}

//查询分类,输入字段名称数组，空，表示查询所有
function queryCategory(field) {
    let f = "*";
    if (!FormatUnit.isNullOrEmpty(field)) {
        f = field
        return category.findAll({ attributes: [f] })
    } else {
        return category.findAll()
    }
}

function queryCategoryById(id) {
    return category.findAll({ where: { id: id } })
}

//查询产品,输入字段名称数组，空，表示查询所有
function queryProduct(field) {
    if (typeof field == "undefined" || field == null || field == "") {
        return product.findAll()
    } else {
        return product.findAll({ attributes: ['f'] })
    }
}

function queryProductByCategoryId(id) {
    return product.findAll({ where: { id: id } })
}

function updateCategoryByConfig(id, config) {
    return category.update({ config: config, where: { id: id } });
}

function updateCategoryByParams(id, params) {
    return category.update({ params: params, where: { id: id } });
}

function queryProductParamsById(id) {
    return product.findAll({ attributes: ['params'], where: { id: id } })
}

function deleteLocalProductsById(id) {
    return product.destroy({ where: { id: id } });
}

function deleteProductsById(id) {
    return pluginProject.destroy({ where: { id: id } });
}

function queryPluginProjects() {
    return pluginProject.findAll()
}

function queryPluginProjectById(id) {
    return pluginProject.findAll({ where: { id: id } })
}

function queryPluginProjectByCategoryId(id) {
    return pluginProject.findAll({ where: { categoryId: id } })
}

function queryPluginProjectByProjectName(projectName) {
    return pluginProject.findAll({ where: { projectName: projectName } })
}

function queryPluginProjectByStatus(status) {
    return pluginProject.findAll({ where: { status: status } })
}

async function updatePluginProject(params) {
    const { id } = params;

    let isUpdate = false;
    if (id) {
        isUpdate = true;
    }

    //更新数据
    if (isUpdate) {
        return pluginProject.update(params, { where: { id: params.id } });
    } else {
        return pluginProject.upsert(params)
    }
}

module.exports = {
    // querySql,
    queryCategory,
    queryCategoryById,
    queryConfigByCateId,
    queryCateConfigByIds,
    queryProduct,
    queryProductById,
    queryProductByCategoryId,
    queryProductParamsById,
    queryProductConfigByIds,
    updateCategoryByConfig,
    updateCategoryByParams,
    deleteLocalProductsById,
    replaceCategory,
    replaceProduct,
    updatePluginProject,
    queryPluginProjects,
    queryPluginProjectById,
    queryPluginProjectByCategoryId,
    queryPluginProjectByProjectName,
    queryPluginProjectByStatus,
    queryProductByModel,
    deleteProductsById
}