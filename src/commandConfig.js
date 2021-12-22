const build = require('./build');
// const startprod = require('./startprod');
// const startdev = require('./startdev');

module.exports = {
  // build ssr
  // 需要build上下文和服务端代码
  // 这个命令应该在上下文根目录执行
  // 需要build上下文的命令
  build: {
    alias: 'build ssr',
    description: 'build ssr',
    options: [
      {
        // 上下文构建的配置文件
        // {
        //   command: '构建宿主工程的命令和参数'
        //   cwd: 运行命令的路径(默认是buildssr运行的路径)
        //   env: 环境变量
        //   outputPath: 构建后的路径(一般是宿主路径中的dist)
        //   htmlRelativePath: 'html相对路径'(一般是index.html)
        //   htmlTemplateName: 'html模板名称'(默认是template)
        // }
        command: '-hc --contextconfig <path>',
        description: 'Context build command,the default is crsrc.js',
      },
      {
        // 构建服务端代码的配置文件，默认是crs.build.config.js，对构建过程进行控制
        command: '-c, --config <path>',
        description: 'Build configuration file path,the default is crs.build.config.js'
      }
    ],
    action: (entry) => {
      console.log('build ssr');

      const { contextconfig, config } = entry;

      console.log(entry);

      build.build({
        contextconfig,
        config,
      });
    },
  },
};
