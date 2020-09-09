---
markdown:
  image_dir: /Doc
  path: README.md
  ignore_from_front_matter: true
  absolute_image_path: false

export_on_save:
  markdown: true
---

[TOC]

### 项目架构

```
 根目录
 ├── Build - 前端调试时webpack的打包目录
 ├── Dist - 前端发布时webpack的打包目录
 ├── Doc - 文档资源
 ├── node_modules - npm依赖库
 ├── Src - 资源文件目录
 │    ├── Client - 前端文件
 │    ├── Config - 配置文件
 |    ├── Server - 后台文件
 |    ├── Unit - 工具
 ├── .babelrc - babel配置文件
 ├── .gitignore - git忽略文件
 ├── config.json - 项目配置文件
 ├── package.json - npm配置文件
 ├── webpack.config.js - webpack配置文件
```

### 架构选型

* React+node+Express+Webpack+mySQL

名称|功能|描述|文档
--|--|--|--
React|页面展示|基于js构建的UI界面|https://react.docschina.org
node|服务器|基于 Chrome V8 引擎的 JavaScript 服务器|http://nodejs.cn/api/
Express|服务器扩展|基于node的扩展框架，封装了很多常用接口|https://www.expressjs.com.cn/4x/api.html
Webpack|打包工具|模块打包工具，可以将所有页面打包成一个bundle.js，然后通过index.html调用|https://www.webpackjs.com/concepts/


### 工具/组件选型
名称|功能|描述|文档
--|--|--|--
Ant Design|UI组件|蚂蚁金服的开源库，封装了大量UI组件|https://ant.design/components/button-cn/
Babel|转义工具|能够将不同的语法在编译后转换成相同的js语言|https://www.babeljs.cn
axios|网络工具|基于js封装的网络访问工具|https://github.com/axios/axios
swagger ui|接口面板|能够生成接口文档，以及支持接口在线调试、mock调试|https://swagger.io/docs/

### npm命令行

```
//打包前端和后台项目并启动服务器
//适用于前后端项目的正式发布
npm run start

//打包前端和后台项目并启动服务器，支持前端和后台的实时修改
//保存文件后就会自动映射，无需重新启动服务器
//适用于前后端项目的正式测试
npm run dev

//使用webpack打包前端项目，生成bundle.js文件
npm run build

//打包前端项目并启动测试服务器
//保存文件后就会自动映射，无需重新打包
//适用于单独的前端项目调试(不会调用后台项目)
npm run client

//启动后台服务器
//保存文件后就会自动映射，无需重新启动
//适用于单独的后台项目调试
npm run server
```

### 命名规范

#### 1.文件夹/文件 - 采用首字母大写的驼峰命名

* 备注：以下不按此规则

1. 配置文件
2. index.js，这个是默认导出路径
3. node_modules，这个是依赖库

```
//正确格式
 ├── MainConponent
 │    ├── Test
 │        ├── Test.js
 │        ├── index.js

//错误示范
 ├── mainConponent
 │    ├── test
 │        ├── test.js
 │        ├── index.js
```

#### 2.配置文件 - 采用小写分割

```
//正确格式
config.json
server.config.json

//错误示范
Config.json
serverConfig.json
...
```

#### 3.组件/类 - 采用首字母大写的驼峰命名

```
//正确格式
class MainConponent

//错误示范
class mainConponent
class mainconponent
class Main_Conponent
...
```

#### 4.属性/函数 - 采用首字母小写的驼峰命名

```
//正确格式
let mainConponent
function testFunc()

//错误示范
let main_conponent
function test_func()
function TestFunc()
...
```

#### 5.成员访问 - 头部添加下横线属于私有，否则属于开放

```
class A:{
  //开放成员
  let mainConponent;
  //私有成员
  let _mainConponent;

  //开放成员
  function testFunc()
  //私有成员
  function _testFunc()
}

class B:{
  test(){
    const A = new A();
    //合法，开放属性能够被访问
    console.log(A.mainConponent);
    //非法，不能访问私有属性
    console.log(A._mainConponent);
    
    //合法，开放函数能够被调用
    A.testFunc()
    //非法，不能访问私有函数
    A._testFunc();
  }
}
```

#### 5.行内注释 - 在代码顶部添加
```
//正确格式
function a() {
  //打印
  console.log('打印');
}

//错误示范
function a() {
  console.log('打印');//打印
}
```