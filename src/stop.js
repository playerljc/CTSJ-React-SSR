#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');
const { getEnv, isWin32 } = require('./util');

// 运行命令的路径(也就是宿主工程的根路径)
const runtimePath = process.cwd();

// crs.sh所在路径
const commandPath = path.join(__dirname, '../', 'node_modules', '.bin', path.sep);

/**
 * stopProd
 * @description stopProd
 * @param name - pm2启动的名称
 */
function stopProd(name) {
  const cmd = isWin32() ? 'pm2.cmd' : 'pm2';

  const handler = spawn(cmd, ['stop', name], {
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

    resolve();
  });
}

/**
 * stop
 * @description - 停止prod
 */
module.exports = function (entry) {
  stopProd(entry.name);
};
