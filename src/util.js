const fs = require('fs');
const path = require('path');

/**
 * sortPath
 * @description - 对path进行降序排序
 * @param path
 * @return {string}
 */
function sortPath(path) {
  let regExp = '';

  if(Util.isWin32()) {
    regExp = /;{1,}/;
  } else {
    regExp = /:{1,}/;
  }

  const pathArr = path.split(regExp);

  pathArr.sort((p1, p2) => {
    if (p1.length > p2.length) return -1;
    else if (p1.length < p2.length) return 1;
    else return 0;
  });

  return pathArr.join(getEvnSplit());
}

const Util = {
  /**
   * 获取env
   * @param commandPath
   */
  getEnv(commandPath) {
    const obj = {};

    if (process.env && process.env.Path && process.env.Path.indexOf(commandPath) === -1) {
      obj.Path = process.env.Path + getEvnSplit() + commandPath;
      obj.Path = sortPath(obj.Path);
    }

    // 这个Path需要按照路径从大到小进行排序

    if (process.env && process.env.PATH && process.env.PATH.indexOf(commandPath) === -1) {
      obj.PATH = process.env.PATH + getEvnSplit() + commandPath;
      obj.PATH = sortPath(obj.PATH);
    }

    return Object.assign(process.env, obj);
  },
  /**
   * getPostCssConfigPath - 获取runtimePath下postcss.config.js文件路径
   * @param runtimePath
   * @return {string}
   */
  getPostCssConfigPath(runtimePath) {
    if (fs.existsSync(path.join(runtimePath, 'postcss.config.js'))) {
      return path.join(runtimePath, 'postcss.config.js');
    }
    return path.join(__dirname, '../', 'postcss.config.js');
  },
  /**
   * getEntryIndex - 获取entry的index入口文件路径
   */
  getEntryIndex(runtimePath) {
    const extensionNames = ['.js', '.jsx', '.ts', '.tsx'];
    let index = -1;
    for (let i = 0; i < extensionNames.length; i++) {
      const extensionName = extensionNames[i];
      const exists = fs.existsSync(path.join(runtimePath, 'src', `index${extensionName}`));
      if (exists) {
        index = i;
        break;
      }
    }

    const entryIndexName = index !== -1 ? `index${extensionNames[index]}` : 'index.js';
    return path.join(runtimePath, 'src', entryIndexName);
  },
  isWin32() {
    return process.platform === 'win32';
  },
};

function getEvnSplit() {
  return Util.isWin32() ? ';' : ':';
}

module.exports = Util;
