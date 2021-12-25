#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');
const { getEnv, isWin32 } = require('./util');

// 运行命令的路径(也就是宿主工程的根路径)
const runtimePath = process.cwd();

// crs.sh所在路径
const commandPath = path.join(__dirname, '../', 'node_modules', '.bin', path.sep);

/**
 * startDev
 * @description - startDev
 * @param port - 端口 默认9080
 */
function startDev(port) {
  const cmd = isWin32() ? 'node.cmd' : 'node';

  const handler = spawn(
    cmd,
    [path.join(runtimePath, 'build', 'server.js'), `port=${port || 9080}`],
    {
      // 构建宿主工程应该在宿主工程根路径下执行
      cwd: runtimePath,
      encoding: 'utf-8',
      env: { ...getEnv(commandPath) },
    },
  );

  handler.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  handler.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  handler.on('close', (code) => {
    console.log(`close：${code}`);
  });
}

/**
 * startProd
 * @description startProd
 * @param name - pm2启动的名称
 * @param port
 */
function startProd({ name, port }) {
  const cmd = isWin32() ? 'pm2.cmd' : 'pm2';

  const params = ['start'];

  if (name) {
    params.push('--name', name);
  }

  params.push(path.join(runtimePath, 'build', 'server.js'), `port=${port || 9080}`);

  const handler = spawn(cmd, params, {
    // 构建宿主工程应该在宿主工程根路径下执行
    cwd: runtimePath,
    encoding: 'utf-8',
    env: { ...getEnv(commandPath) },
  });

  handler.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  handler.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  handler.on('close', (code) => {
    console.log(`close：${code}`);
  });
}

const tasks = new Map([
  [
    'dev',
    ({ port }) => {
      startDev(port);
    },
  ],
  [
    'prod',
    (params) => {
      startProd(params);
    },
  ],
]);

/**
 * start
 * @description - 启动
 * @param type - 类型 dev|prod
 * @param name - pm2启动的名称 只有type=prod时才生效
 */
module.exports = function ({ type, ...other }) {
  tasks.get(type)(other);
};
