const path = require('path')
const utils = require('./utils').default
const {
  fsLoader,
  unique,
  formatTime,
  loadPlugins,
  extract,
  parseConfig,
  mkdirsSync,
  writeFile,
  writeFileSync,
  deleteFolder,
  addPropertys,
  getOutputPath
} = utils

const name = 'preset'
// context 插件的公共环境
// options 入口文件配置项plugins里定义的配置(最终结果)
// conf 入口文件配置
const apply = function (context, options, conf) {
  let edit = false
  return {
    build() {
    },
    handleRoot(stats, data) {
    },
    handleBlock(stats, data) {
    },
    handleBlockRoot(stats, data) {
    },
    handleBlockFile(stats, data) {
      let ext = path.parse(stats.path).ext
      let outputPath = getOutputPath(stats.path, conf.input, conf.output)
      mkdirsSync(path.parse(outputPath).dir)
      let newData = addPropertys(data, function (config) {
        if (!edit && (!config.sid || !config.date)) {
          edit = true
        }
        let timestamp = +new Date(config.date || stats.birthtime)
        let base = config.sid ? {} : {
          sid: timestamp.toString(36) + Math.floor(Math.random() * 1e3 + 36).toString(36)
        }
        return Object.assign(base, config.date ? {} : {
          date: formatTime(stats.birthtime, 'yyyy-MM-dd hh:mm:ss')
        })
      })
      if (newData !== data) {
        writeFileSync(stats.path, newData)
        console.log(newData, 'preset')
        return newData
      }
    },
    handleBlockEnd(stats, data) {
    },
    buildEnd() {
      if (edit && process.argv.length > 2) {
        console.log('部分md文件未设置sid或date属性, 已自动写入, 可能需要重新add')
        process.exit(1)
      } else {
        edit && console.log('部分md文件未设置sid或date属性, 已自动写入')
      }
    }
  }
}
module.exports = {
  name,
  record: true,
  apply
}