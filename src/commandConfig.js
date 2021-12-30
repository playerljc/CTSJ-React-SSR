const build = require('./build');
const start = require('./start');
const stop = require('./stop');
const startDev = require('./startDev/index.js');

module.exports = {
  /**
   * build(build ssr)
   * @description - ssr构建
     .需要build上下文(前端静态资源)和服务端代码
     .这个命令应该在上下文根目录执行
     .build上下文各自平台提供命令(可以任意的平台，如create-react-app、ant-pro或自己搭建的框架，只要有构建的命令(能力)即可)
     .服务器端代码用@ctsj/build进行构建
   */
  build: {
    alias: 'build ssr',
    description: 'build ssr',
    options: [
      {
        /**
         * 上下文构建的配置文件 默认是宿主工程根路径下的crsrc.js
           {
             command: '构建宿主工程的命令和参数，如npm run buildapp'
             cwd: 运行命令的路径(默认是buildssr运行的路径)
             env: 环境变量
             outputPath: 静态资源构建后的路径(一般是宿主路径中的dist)
             htmlRelativePath: 静态资源中模板'html相对路径'(一般是index.html)
             htmlTemplateName: 新创建的模板'html模板名称'(默认是template)
           }
         */
        command: '-hc --contextconfig <path>',
        description: 'Context build command,the default is crsrc.js',
      },
      {
        /**
         * 构建服务端代码的配置文件，默认是宿主工程根路径下的crs.build.config.js，对构建过程进行控制
         */
        command: '-c, --config <path>',
        description: 'Build configuration file path,the default is crs.build.config.js',
      },
    ],
    action: (entry) => {
      build(entry).then(() => {
        process.exit();
      }).catch(() => {
        process.exit();
      });
    },
  },
  /**
   * start
   * @description - 启动ssr type dev|prod prod使用pm2和--name启动 dev用node启动
   */
  start: {
    alias: 'start ssr',
    description: 'start ssr',
    options: [
      {
        command: '-t --type <path>',
        description: 'Startup type dev Development prod Production',
      },
      {
        command: '-n --name <path>',
        description: 'pm2 start name type is prod to take effect',
      },
      {
        command: '-p --port <path>',
        description: 'port default 9080',
      },
    ],
    action: (entry) => {
      start(entry);
    },
  },
  /**
   * stop
   * @description - 停止prod
   */
  stop: {
    alias: 'stop ssr',
    description: 'stop prod',
    options: [
      {
        command: '-n --name <path>',
        description: 'pm2 stop name',
      },
    ],
    action: (entry) => {
      stop(entry);
    },
  },
  /**
   * start-dev
   * @description 开发模式构建+启动ssr服务，支持修改文件后重新编译和启动服务
   */
  'start-dev': {
    alias: 'start-dev ssr',
    description: 'start by development',
    options: [
      {
        command: '-hc --contextconfig <path>',
        description: 'Context build command,the default is crsrc.js',
      },
      {
        command: '-c, --config <path>',
        description: 'Build configuration file path,the default is crs.build.config.js',
      },
      {
        command: '-p --port <path>',
        description: 'port default 9080',
      },
    ],
    action: (entry) => {
      startDev(entry);
    },
  },
};
