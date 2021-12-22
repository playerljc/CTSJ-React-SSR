const path = require('path');
// 针对服务器端，对于require这样的代码进行与客户端不同的处理
const nodeExternals = require('webpack-node-externals');

// 需要额外的输入
// 1.宿主工程根路径
// 2.上下文构建的配置文件
// 3.configPath

// 宿主工程根路径
let contextRootPath;

// 构建服务端代码的配置文件，默认是ctbuild.config.ssr.js，对构建服务代码进行自定义
let configPath;

function externals(externals) {
  const result = {};

  externals.forEach((external) => {
    result[external] = `commonjs2 ${external}`;
  });

  return result;
}

module.exports = {
  getConfig({ webpackConfig, webpack, plugins, define }) {
    contextRootPath = define.get('contextRootPath');

    configPath = define.get('configPath');

    // 针对服务器端，对于require这样的代码进行与客户端不同的处理
    webpackConfig.target = 'node';

    // development
    webpackConfig.mode = 'development';

    // devtool(无sourcemap)
    webpackConfig.devtool = false;

    // 入口点
    webpackConfig.entry.index = path.join(__dirname, 'src', 'server', 'index.js');

    // 出口点
    webpackConfig.output = {
      filename: 'server.js',
      path: path.join(contextRootPath, 'build'),
      clean: true,
    };

    // 排除
    const contextPackageJSON = require(path.join(contextRootPath, 'package.json'));
    // const packageJSON = require(path.join(__dirname, 'package.json'));
    webpackConfig.externalsPresets = { node: true };
    webpackConfig.externals = [
      nodeExternals(),
      externals(Object.keys(contextPackageJSON.dependencies || {})),
      externals(Object.keys(contextPackageJSON.devDependencies || {})),
      // externals(Object.keys(packageJSON.dependencies || {})),
    ];

    // 宿主工程前缀的alias(服务端代码来引用这个文件)
    webpackConfig.resolve.alias['#'] = path.join(contextRootPath, 'crs.module.js');

    // 模块引用的是main
    webpackConfig.resolve.mainFields = ['main'];

    // plugins的处理
    // 使用ForkTsCheckerWebpackPlugin、WebpackBar
    webpackConfig.plugins = webpackConfig.plugins.slice(4);

    // optimization
    webpackConfig.optimization = {
      splitChunks: false,
    };

    // isomorphic-style-loader的处理，将style-loader替换成isomorphic-style-loader
    webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
      if (!('use' in rule) || !Array.isArray(rule.use)) return rule;

      rule.use = rule.use.map((item) => {
        if (typeof item === 'string') {
          if (item === plugins.MiniCssExtractPlugin.loader) {
            return 'isomorphic-style-loader';
          }
        } else {
          if (
            typeof item === 'object' &&
            'loader' in item &&
            item.loader === plugins.MiniCssExtractPlugin.loader
          ) {
            return 'isomorphic-style-loader';
          }
        }

        return item;
      });

      return rule;
    });

    // 交给用户在处理
    const customWebpackConfig = require(configPath);
    customWebpackConfig.getConfig({
      webpackConfig,
      webpack,
      plugins,
      define,
    });
  },
};
