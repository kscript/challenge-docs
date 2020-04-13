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

const name = 'base'
// context 插件的公共环境
// options 入口文件配置项plugins里定义的配置(最终结果)
// conf 入口文件配置
const apply = function (context, options, conf) {
  return {
    build() {
    },
    handleRoot(stats, data, done) {
    },
    handleBlock(stats, data, done) {
    },
    handleBlockRoot(stats, data, done) {
    },
    handleBlockFile(stats, data, done) {
    },
    handleBlockEnd(stats, data, done) {
    },
    buildEnd() {
    }
  }
}
module.exports = {
  name,
  record: true,
  apply
}