const path = require('path');
// 针对服务器端，对于require这样的代码进行与客户端不同的处理
const nodeExternals = require('webpack-node-externals');

// 需要额外的输入
// 1.宿主工程根路径
// 2.上下文构建的配置文件
// 3.configPath

// 宿主工程根路径
let contextRootPath;

// 构建服务端代码的配置文件，默认是crs.build.config.js，对构建服务代码进行自定义
let configPath;

/**
 * externals
 * @description - 对象的方式排除
 * @param externals
 * @return {{}}
 */
function externals(externals) {
  const result = {};

  externals.forEach((external) => {
    result[external] = `commonjs2 ${external}`;
  });

  return result;
}

/**
 * cssRuleDeal
 * @description - cssRuleDeal
 * @param cssRule
 */
function cssRuleDeal(cssRule) {
  cssRule.use.shift();
  cssRule.use[0].options.modules = {
    exportOnlyLocals: true,
  };
}

function lessCssModuleRuleDeal(lessRule, customWebpackConfig) {
  lessRule.use.shift();
  lessRule.use[0].options.modules = {
    exportOnlyLocals: true,
    getLocalIdent: getLocalIdent(customWebpackConfig),
    // localIdentName: customWebpackConfig.localIdentName || '[path][name]__[local]--[hash:base64:5]'
  };
}

function lessNoCssModuleRuleDeal(lessRule) {
  lessRule.use.shift();
  lessRule.use[0].options.modules = {
    exportOnlyLocals: true,
  };
}

function slash(input) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(input);

  if (isExtendedLengthPath) {
    return input;
  }

  return input.replace(/\\/g, '/');
}

/**
 * getLocalIdent
 * @description - getLocalIdent
 * @param customWebpackConfig
 */
function getLocalIdent(customWebpackConfig) {
  return function (context, localIdentName, localName) {
    if (
      customWebpackConfig.getLocalIdent &&
      (typeof customWebpackConfig.getLocalIdent).toLowerCase() === 'function'
    ) {
      return customWebpackConfig.getLocalIdent(context, localIdentName, localName);
    } else {
      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const path = match[1].replace('.less', '');

        const arr = slash(path)
          .split('/')
          .filter((t) => t)
          .map((a) => a.replace(/([A-Z])/g, '-$1'))
          .map((a) => a.toLowerCase());

        return `${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    }
  };
}

module.exports = {
  /**
   * getTheme
   * @description - 主题的提供
   * @param defineh
   * @return {*|{}}
   */
  getTheme({ define }) {
    const customWebpackConfig = require(define.get('configPath'));

    return ('getTheme' in customWebpackConfig && customWebpackConfig.getTheme()) || {};
  },
  /**
   * getConfig
   * @description - 构建的配置文件修改
   * @param webpackConfig
   * @param webpack
   * @param plugins
   * @param define
   */
  getConfig({ webpackConfig, webpack, plugins, define }) {
    contextRootPath = define.get('contextRootPath');

    configPath = define.get('configPath');

    const customWebpackConfig = require(configPath);

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
      // 在@ctsj/react-ssr根路径中创建build目录
      // path: path.join(__dirname, 'build'),
      path: path.join(contextRootPath, 'build'),
      clean: true,
    };

    // 排除
    const contextPackageJSON = require(path.join(contextRootPath, 'package.json'));
    // @ctsj/react-ssr的package.json
    // const packageJSON = require(path.join(__dirname, 'package.json'));
    webpackConfig.externalsPresets = { node: true };
    webpackConfig.externals = [
      nodeExternals(),
      // 排除宿主工程依赖
      externals(Object.keys(contextPackageJSON.dependencies || {})),
      externals(Object.keys(contextPackageJSON.devDependencies || {})),
      // 需要手动排除
      {
        'react-dom/server': 'commonjs2 react-dom/server',
      },
      // 排除自身工程依赖（不能排除自身因为nodejs在宿主工程里运行
      // externals(Object.keys(packageJSON.dependencies || {})),
    ];

    // 宿主工程前缀的alias(服务端代码来引用这个文件)
    webpackConfig.resolve.alias['#'] = path.join(contextRootPath, 'crs.module.js');

    // 模块引用的是main,因为target是node，node是commonjs
    webpackConfig.resolve.mainFields = ['main'];

    // plugins的处理
    // 使用ForkTsCheckerWebpackPlugin、WebpackBar
    webpackConfig.plugins = webpackConfig.plugins.slice(4);

    // optimization 不进行压缩
    webpackConfig.optimization = {
      splitChunks: false,
    };

    // css-loader处理
    cssRuleDeal(webpackConfig.module.rules[2]);
    // less-loader1处理
    lessCssModuleRuleDeal(webpackConfig.module.rules[3], customWebpackConfig);
    // less-loader2处理
    lessNoCssModuleRuleDeal(webpackConfig.module.rules[webpackConfig.module.rules.length - 1]);

    // isomorphic-style-loader的处理，将style-loader替换成isomorphic-style-loader
    // webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
    //   if (!('use' in rule) || !Array.isArray(rule.use)) return rule;
    //
    //   rule.use = rule.use.map((item) => {
    //     if (typeof item === 'string') {
    //       if (item === plugins.MiniCssExtractPlugin.loader) {
    //         return 'isomorphic-style-loader';
    //       }
    //     } else {
    //       if (
    //         typeof item === 'object' &&
    //         'loader' in item &&
    //         item.loader === plugins.MiniCssExtractPlugin.loader
    //       ) {
    //         return 'isomorphic-style-loader';
    //       }
    //     }
    //
    //     return item;
    //   });
    //
    //   return rule;
    // });

    // 交给用户在处理
    customWebpackConfig.getConfig({
      webpackConfig,
      webpack,
      plugins,
      define,
    });
  },
};
