#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { getEnv, isWin32 } = require('./util');

// 运行命令的路径(也就是宿主工程的根路径)
const runtimePath = process.cwd();

// crs.sh所在路径
const commandPath = path.join(__dirname, '../', 'node_modules', '.bin', path.sep);

// 上下文构建的配置文件
let contextConfigPath;

// 构建服务端代码的配置文件，默认是crs.build.config.js，对构建服务代码进行自定义
let configPath;

/**
 * createHtmlTemplate
 * @description - 创建模板文件
 * @param outputPath
 * @param htmlRelativePath
 * @param htmlTemplateName
 */
function createHtmlTemplate({
  // outputPath: 构建后的路径(一般是宿主路径中的dist)
  outputPath,
  // htmlRelativePath: 'html相对路径'(一般是index.html)
  htmlRelativePath,
  // htmlTemplateName: 'html模板名称'(默认是template)
  htmlTemplateName,
}) {
  const distContextPath = outputPath || path.join(runtimePath, 'dist');
  const htmlFileName = htmlRelativePath || 'index.html';
  const templateFileName = htmlTemplateName || 'template.html';

  const dist = path.join(distContextPath, htmlFileName);
  const dest = path.join(distContextPath, templateFileName);
  fs.copyFileSync(dist, dest);
  fs.renameSync(dist, path.join(distContextPath, `${htmlFileName}.bak`));
}

/**
 * buildContext
 * @description - 构建宿主工程
 * @return Promise
 */
function buildContext() {
  return new Promise((resolve) => {
    const {
      // command: '构建宿主工程的命令和参数'
      command,
      // cwd: 运行命令的路径(默认是buildssr运行的路径)
      cwd,
      // env: 环境变量
      env,
      // outputPath: 构建后的路径(一般是宿主路径中的dist)
      outputPath,
      // htmlRelativePath: 'html相对路径'(一般是index.html)
      htmlRelativePath,
      // htmlTemplateName: 'html模板名称'(默认是template)
      htmlTemplateName,
    } = require(contextConfigPath);

    const commandArr = command.split(' ');
    const commandStr = commandArr[0];
    const commandParams = commandArr.slice(1);

    const cmd = isWin32() ? `${commandStr}.cmd` : commandStr;

    // console.log('cmd', cmd);
    // console.log('commandParams',commandParams);

    const handler = spawn(cmd, commandParams || [], {
      // 构建宿主工程应该在宿主工程根路径下执行
      cwd: cwd || runtimePath,
      encoding: 'utf-8',
      env: { ...getEnv(commandPath), ...(env || {}) },
    });

    handler.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    handler.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    handler.on('close', (code) => {
      // 构建成功后的操作,根据index.html生成template模板文件
      createHtmlTemplate({
        // outputPath: 构建后的路径(一般是宿主路径中的dist)
        outputPath,
        // htmlRelativePath: 'html相对路径'(一般是index.html)
        htmlRelativePath,
        // htmlTemplateName: 'html模板名称'(默认是template)
        htmlTemplateName,
      });

      console.log(`close：${code}`);

      resolve();
    });
  });
}

/**
 * buildServer
 * @description - 构建服务端代码
 * @return Promise
 */
function buildServer() {
  return new Promise((resolve) => {
    // 运行ctbuild去构建server
    const cmd = isWin32() ? 'cross-env.cmd' : 'cross-env';

    const handler = spawn(
      cmd,
      [
        'mode=production',
        'ctbuild',
        'buildapp',
        '-c',
        path.join(__dirname, '../', 'ctbuild.config.js'),
        '--define',
        [
          'alias=@',
          'cssModules=true',
          `contextRootPath=${runtimePath}`,
          `configPath=${configPath}`,
        ].join(','),
      ],
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
      resolve();
    });
  });
}

module.exports =
  /**
   * build
   * @description - build ssr
   * @param contextconfig - 上下文构建的配置文件
   * {
       command: '构建宿主工程的命令和参数，如npm run buildapp'
       cwd: 运行命令的路径(默认是buildssr运行的路径)
       env: 环境变量
       outputPath: 静态资源构建后的路径(一般是宿主路径中的dist)
       htmlRelativePath: 静态资源中模板'html相对路径'(一般是index.html)
       htmlTemplateName: 新创建的模板'html模板名称'(默认是template)
     }
   * @param config - 构建服务端代码的配置文件，默认是crs.build.config.js，对构建服务代码进行自定义
 */
  function ({ contextconfig, config }) {
    // 构建宿主工程的配置文件路径
    if (contextconfig) {
      if (path.isAbsolute(contextconfig)) {
        contextConfigPath = contextconfig;
      } else {
        contextConfigPath = path.join(runtimePath, contextconfig);
      }
    } else {
      contextConfigPath = path.join(runtimePath, 'crsrc.js');
    }

    // 构建服务端代码的配置文件路径
    if (config) {
      if (path.isAbsolute(config)) {
        configPath = config;
      } else {
        configPath = path.join(runtimePath, config);
      }
    } else {
      configPath = path.join(runtimePath, 'crs.build.config.js');
    }

    // 1.对宿主工程进行build
    // 2.对服务端代码进行build
    // 二者是并行的互补干扰
    return Promise.all([buildContext(), buildServer()])
      .then(() => {
        console.log('build finish');
        // process.exit();
      })
      .catch((error) => {
        console.log('build error', error);
      });
  };
