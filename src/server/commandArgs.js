const map = new Map();

module.exports = {
  /**
   * 初始化命令行参数
   * --type 构建类型
   * --config 另外的配置文件
   * @return {Map}
   */
  initCommandArgs() {
    const customArgs = process.argv.slice(2);

    for (let i = 0; i < customArgs.length; i++) {
      const entryArr = customArgs[0].split('=');

      map.set(entryArr[0],entryArr[1]);
    }
  },
  getArg(key) {
    return map.get(key);
  },
};
