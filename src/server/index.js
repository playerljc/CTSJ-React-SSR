const compression = require('compression');
const express = require('express');
const cheerio = require('cheerio');

// 引入宿主工程的crs.js文件
const { getRouterPathConfig, getHtmlTemplatePath, getPublicResourcePath } = require('#');

const commandArgs = require('./commandArgs');
const render = require('./render');

// 初始化命令行参数
commandArgs.initCommandArgs();

// 模板的dom的$
let $;

const port = commandArgs.getArg('port') || 9080;

// express对象
const app = express();

// 开启gzip
app.use(compression());

// 静态目录路径
app.use(express.static(getPublicResourcePath()));

// 迭代routerPath创建路由拦截器
getRouterPathConfig.forEach((path) => {
  app.get(path, (req, res) => {
    render(req, res, $);
  });
});

// 开启服务
app.listen(port, () => {
  console.log(`${port}started!`);

  // 读取模板文件
  const htmlStr = fs.readFileSync(getHtmlTemplatePath, {
    encoding: 'utf-8',
  });

  // 生成html模板对用的$
  $ = cheerio.load(htmlStr);
});
