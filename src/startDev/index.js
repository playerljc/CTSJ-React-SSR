#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');
const { getEnv, isWin32 } = require('../util');

let commandArgs;

// 运行命令的路径(也就是宿主工程的根路径)
const runtimePath = process.cwd();

// crs.sh所在路径
const commandPath = path.join(__dirname, '../../', 'node_modules', '.bin', path.sep);

/**
 * start
 * @description - 使用nodemon build || strat
 */
function start() {
  return new Promise((resolve) => {
    const cmd = isWin32() ? 'nodemon.cmd' : 'nodemon';

    const env = getEnv(commandPath);

    const args = [
      '-w',
      // 监控宿主工程源码目录文件的更改
      path.join(runtimePath, 'src'),
      '-e',
      // 监控的文件扩展名
      ['js', 'jsx', 'ts', 'tsx', 'css', 'less', 'sass', 'html', 'json'].join(','),
      // build -> start
      path.join(__dirname, 'exec.js'),
      ...Object.keys(commandArgs).map((key) => `${key}=${commandArgs[key]}`),
    ];

    const handler = spawn(cmd, args, {
      // 构建宿主工程应该在宿主工程根路径下执行
      cwd: runtimePath,
      encoding: 'utf-8',
      env,
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
  });
}

/**
 *
 */
module.exports = function (entry) {
  commandArgs = entry;

  start();
};
