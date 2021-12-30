const compression = require('compression');
const express = require('express');

const port = 9080;

// express对象
const app = express();

// 开启gzip
app.use(compression());

// 静态目录路径
app.use(express.static('public'));

// 迭代routerPath创建路由拦截器
app.get('/', (req, res) => {
    console.log('req.path', req.path);
});

/** 当以上路径都没有匹配成功时  */
app.all('*', (req, res) => {
  console.log('app.all',req.path);
});

// 开启服务
app.listen(port, () => {
    console.log(`${port} started!`);
});
