# CTSJ-React-SSR
# 概述
&ensp;&ensp;提供对React宿主工程的SSR支持，React的宿主工程可以是以任意脚手架搭建的(如：可以是用Create-React-App、UMI、或自己用Webpack搭建的)

# 安装
```js
  npm install @ctsj/react-ssr
```

# 使用

1.在宿主工程根路径下创建crsrc.js文件
```js
/*** 此文件是用来配置构建宿主工程的命令 ***/
module.exports = {
  // 构建宿主工程的命令和参数(如下所示)
  command: 'npm run buildapp:ssr',
};
```

2.在宿主工程根路径下创建crs.build.config.js
```js
/*** 此文件是用来配置构建服务端代码 ***/
module.exports = {
  // cssModule的生成规则
  getLocalIdent(context, localIdentName, localName){
  },
  // cssModule的生成规则
  localIdentName: '[name]__[local]',
  // less的主题文件
  getTheme(){
    return {}
  },
  // 构建服务端代码的webpack配置
  getConfig({webpackConfig,webpack,plugins,define})
};
```

3.在宿主工程根路径下创建crs.module.js
```js
/*** 此文件是用来为服务器端大妈提供相关的信息 ***/

/**
 * getRouterPathConfig
 * @description - 获取路由配置，以数组的形式返回
 * @return Array
 */
export function getRouterPathConfig() {
 return [
   '/',
   '/system',
 ];
};

/**
 * getStaticRouter
 * @description - 获取StaticRouter对象
 * @param props - location
 * @return {Promise<unknown>}
 */
export function getStaticRouter(props) {
  return <StaticRouter {...props} />
}

/**
 * getData
 * @description - 获取路由对应的数据
 * @param req
 * @return Promise
 */
export function getData(req) {
  return Promise.resolve('result');
}

/**
 * getHtmlTemplatePath
 * @description - 静态资源的html模板路径dist/template.html路径
 * @return string
 */
export function getHtmlTemplatePath() {
  return path.join(__dirname, '../', 'dist', 'template.html');
}

/**
 * getPublicResourcePath
 * @description - express的静态资源目录
 */
export function getPublicResourcePath() {
  return path.join(__dirname, '../', 'dist');
}

/**
 * getRootElementSelector
 * @description - 获取渲染的根元素选择器
 * @return {string}
 */
export function getRootElementSelector() {
  return '#app';
}
```

4.在宿主工程根路径下的package.json中加入ssr命令
```js
// 构建ssr
"buildssr": "crs build",
// 启动
"startssr": "crs start -t dev"
```

5.打开浏览器输入localhost:9080/路由地址

# CLI

### &ensp;csr build - 构建ssr
  - -hc --contextconfig
 上下文构建的配置文件 默认是宿主工程根路径下的crsrc.js
 此文件返回如下结构

 ```json
{
   command: '构建宿主工程的命令和参数，如npm run buildapp'
   cwd: 运行命令的路径(默认是buildssr运行的路径)
   env: 环境变量
   outputPath: 静态资源构建后的路径(一般是宿主路径中的dist)
   htmlRelativePath: 静态资源中模板'html相对路径'(一般是index.html)
   htmlTemplateName: 新创建的模板'html模板名称'(默认是template)
 }
```
 - -c --config
 构建服务端代码的配置文件，默认是宿主工程根路径下的crs.build.config.js，对构建过程进行控制

### &ensp;csr start - 启动
 - -t --type
 启动的类型
 dev: 开发模式使用node直接启动
 prod: 生产模式试用pm2启动
 
 - -n --name
 -t使用了prod的时候，pm2的name

 - p --port
 启动的端口默认是9080
 
### &ensp;csr stop - 停止
 - -n --name
 停止csr start -t prod -name 启动的服务 
 
### &ensp;csr start-dev - 开发运行
 - -hc --contextconfig
 参考build的-hc参数
 - -c --config
 参考build的-c参数
 - -p --port
 参考start的-p参数

# 配置文件

##crsrc.js
返回构建宿主工程的信息

```js
{
   command: '构建宿主工程的命令和参数，如npm run buildapp'
   cwd: 运行命令的路径(默认是buildssr运行的路径)
   env: 环境变量
   outputPath: 静态资源构建后的路径(一般是宿主路径中的dist)
   htmlRelativePath: 静态资源中模板'html相对路径'(一般是index.html)
   htmlTemplateName: 新创建的模板'html模板名称'(默认是template)
}
```

###crs.build.config.js
构建服务端的webpack配置文件
```js
module.exports = {
   /**
    * getLocalIdent cssModule生成规则
    */
   getLocalIdent(context, localIdentName, localName) {
   
   },
   /**
    * getTheme 返回less主题对象
    */
   getTheme() {
   
   },
   /**
    * getConfig webpack配置
    */
   getConfig({webpackConfig, webpack, plugins, define}) {
  
   }
}
```

###crs.module.js
用户提供的服务端代码片段
```js
/**
 * getRouterPathConfig
 * @description - 获取路由配置
 */
export function getRouterPathConfig() {
  return new Promise(resolve => {
      
  });
}

/**
 * getStaticRouter
 * @description - 获取StaticRouter对象
 * @param props
 * @return {Promise<unknown>}
 */
export function getStaticRouter(props) {
  return new Promise(resolve => {
       
  });
}

/**
 * getData
 * @param req
 * @return Promise
 */
export function getData(req) {
  return Promise.resolve('123');
}

/**
 * getHtmlTemplatePath
 * @description - 静态资源的html模板路径dist/template.html路径
 */
export function getHtmlTemplatePath() {
  return path.join(__dirname, '../', 'dist', 'template.html');
}

/**
 * getPublicResourcePath
 * @description - express的静态资源目录
 */
export function getPublicResourcePath() {
  return path.join(__dirname, '../', 'dist');
}

/**
 * getRootElementSelector
 * @description - 获取渲染的根元素选择器
 * @return {string}
 */
export function getRootElementSelector() {
  return '#app';
}

```
