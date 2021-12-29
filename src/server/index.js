import fs from 'fs';
import compression from 'compression';
import express from 'express';
import cheerio from 'cheerio';

// 引入宿主工程的crs.js文件
import { getRouterPathConfig, getHtmlTemplatePath, getPublicResourcePath } from '#';

import { initCommandArgs, getArg } from './commandArgs.js';
import render from './render';

/**
 * $
 */
function $() {
  // 读取模板文件
  const htmlStr = fs.readFileSync(getHtmlTemplatePath(), {
    encoding: 'utf-8',
  });

  // 生成html模板对用的$
  return cheerio.load(htmlStr);
}

// 初始化命令行参数
initCommandArgs();

const port = getArg('port') || 9080;

// express对象
const app = express();

// 开启gzip
app.use(compression());

// 静态目录路径
app.use(express.static(getPublicResourcePath()));

// 迭代routerPath创建路由拦截器
getRouterPathConfig().then((config) => {
  // console.log('config', config);

  config.forEach((path) => {
    app.get(path, (req, res) => {
      // console.log('path', path);
      render(req, res, $());
    });
  });

  /** 当以上路径都没有匹配成功时  */
  app.all('*', (req, res) => {
    // console.log('app.all', req.path);
    // console.log('$().html()',$().html());
    res.send($().html());
  });
});



// 开启服务
app.listen(port, () => {
  console.log(`${port} started!`);
});
