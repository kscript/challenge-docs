import * as path from 'path'
import utils from './utils'
const {
  fsLoader,
  mkdirsSync,
  writeFile,
  deleteFolder,
  getOutputPath
} = utils

const config: anyObject = {
  input: './public/',
  output: './dist/',
  // 部署路径应为输出路径的子集
  local_dir: 'dist',
  // 分类显示标签数
  tagsNum: 5,
  // 分页
  page: {
    size: 10
  },
  sort: {
    key: 'birthtimeMs',
    // 由于一些文件是迁移过来的, 根据创建时间排序的话有问题
    // 因此这些文件的date可能是手动指定的
    // 手动写入的数据优先
    manual: true,
    // 是否采用降序
    desc: true
  }
}
let plugins = []
let context = {
  old: {},
  last: {}
}

// plugins数据中支持的类型:
// - string  插件路径/包名(用于require加载, 路径是相对于项目根目录的)
// - [string,Object|()=>Object]  插件路径/包名+配置项的一个数组,配置项是函数时,若调用结果不为对象则舍弃掉
// require进来的如果不是一个提供有apply方法的对象, 则忽略该插件

const loadPlugins = (plugins, context, config) => {
  if (!Array.isArray(plugins)) {
    plugins = [plugins]
  }
  return plugins.map((props) => {
    props = typeof props === 'string' ? [props, {}] : props
    if (Array.isArray(props)) {
      try {
        const plugin = require(props[0])
        if (plugin instanceof Object && typeof plugin.apply === 'function') {
          let options = typeof props[1] === 'function' ? props[1]() : props[1]
          options = options instanceof Object ? options : {}
          return [plugin.apply(context, options, config, plugin), options, plugin]
        }
      } catch (err) {
        console.log(err)
      }
    }
  }).filter(item => item)
}

const execPlugins = async (fn, ...rest) => {
  let result
  plugins.forEach(async ([plugin, options, info]) => {
    if (typeof plugin[fn] === 'function') {
      let res = await plugin[fn](...rest)
      result = res === void 0 ? result : res
      if (result instanceof Object) {
        context.old = context.last
        context.last = {
          name: info.name,
          hook: fn,
          result
        }
        if (info.name && info.record) {
          let name = '_' + info.name
          context[name] = context[name] || {}
          context[name][fn] = result
        }
      }
    }
  })
  return result
}
const mutationHook = async (hook, stats, data) => {
  return mutationData(await execPlugins(hook, stats, data), data)
}
const mutationData = (newData, data) => {
  return typeof newData === 'string' ? newData : data
}
const handleBlock = (dir, config, done) => {
  fsLoader({
    path: dir,
    mode: 'DFS',
    deep: true,
    showDir: true,
    readFile: true,
    async loader(stats, data, done) {
      const outputPath = getOutputPath(stats.path, config.input, config.output)
      await mutationHook('handleBlockRoot', stats, data)
      if (stats.type === 'dir') {
        mkdirsSync(outputPath)
      } else
        if (stats.type === 'file') {
          data = await mutationHook('handleBlockFile', stats, data)
          writeFile(outputPath, data, done)
          return false
        }
    },
    done
  })
}
const build = async (_config: anyObject = {}, done?:() => void) => {
  Object.assign(config, _config)
  plugins = loadPlugins(config.plugins, context, config)
  await execPlugins('build')
  deleteFolder(config.output)
  mkdirsSync(config.output)

  // 第一层的子目录, 是与项目对应的类目
  // 当然, 这一层还可能有别的文件
  // 如果是目录, 整理该类目下的信息
  // 如果是文件, 直接复制到相应的输出目录
  fsLoader({
    path: config.input,
    deep: false,
    showDir: true,
    readFile: true,
    async loader(stats, data, done) {
      data = await mutationHook('handleRoot', stats, data)
      if (stats.type === 'file') {
        writeFile(getOutputPath(stats.path, config.input, config.output), data, done)
      } else
        if (stats.type === 'dir') {
          mkdirsSync(path.join(config.output, stats.name))
          data = await mutationHook('handleBlock', stats, data)
          handleBlock(stats.path, config, async () => {
            await mutationHook('handleBlockEnd', stats, data)
            done()
          })
        }
      return false
    },
    async done() {
      typeof done === 'function' && done()
      await execPlugins('buildEnd')
      console.log('执行完毕')
    }
  })
}
export default build