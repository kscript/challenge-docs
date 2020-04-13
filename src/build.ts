import * as path from 'path'
import utils from './utils'
const {
  fsLoader,
  unique,
  formatTime,
  extract,
  parseConfig,
  mkdirsSync,
  writeFile,
  writeFileSync,
  deleteFolder,
  addPropertys,
  getOutputPath
} = utils
const map: map = {}
const keys: map = {}
const cached: anyObject[] = []
const conf = {
  input: './public/',
  output: './dist/',
  // 部署路径应为输出路径的子集
  local_dir: 'dist',
  // 分类显示标签数
  tagsNum: 5,
  // 分页
  pageSize: 25,
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
const resetProperty = function () {
  map.tags = {}
  map.categories = {}
  Object.keys(map).forEach(function (item) {
    keys[item] = {}
  })
  cached.splice(0)
}
const countInfo = function (cached) {
  cached.map(function (file) {
    let categories = countVal(map, 'categories', file)
    let tags = countVal(map, 'tags', file)
    categories.map(function (c) {
      tags.map(function (t) {
        keys.categories[c] = (keys.categories[c] || []).concat(t)
      })
    })
  })
  return map
}
const countVal = function (target, key, file) {
  let obj = target[key]
  let val = file.config[key]
  if (typeof val === 'string') {
    val = [val]
  }
  if (val instanceof Array) {
    return unique(val).map(function (item) {
      if (obj[item]) {
        obj[item].push(file)
      } else {
        obj[item] = [file]
      }
      return item
    })
  }
  return []
}
const countSort = function (list) {
  let obj = {}
  list.map(function (item) {
    obj[item] = (obj[item] || 0) + 1
  })
  return Object.keys(obj).sort(function (a, b) {
    return obj[b] - obj[a]
  })
}

const writeConfig = function (dirname) {
  try {
    let categories = []
    let basePath = path.join(conf.output, dirname)
    Object.keys(keys.categories).map(function (item) {
      categories.push([item, countSort(keys.categories[item]).slice(0, conf.tagsNum).join()])
    })
    writeFileSync(path.join(basePath, 'categorys.json'), JSON.stringify(categories, null, 2))
    writeFileSync(path.join(conf.output, 'info.json'), JSON.stringify(conf, null, 2))
    
    writeFileSync(path.join(basePath, 'timeline.json'), JSON.stringify(cached.map(function (item, index) {
      return sliceListInfo({
      }, item, conf)
    }), null, 2))

    Object.keys(map.categories).map(function (key) {
      let category = map.categories[key]
      let res = category.map(function (item, index) {
        return sliceTagInfo({
          pageno: ~~(index / conf.pageSize + 1)
        }, item, conf)
      })
      writeFileSync(path.join(basePath, key, 'category.json'), JSON.stringify(res, null, 2))
    })
  } catch (e) {
    console.log(e)
  }
}
const sliceInfo = function (info, file, conf) {
  return Object.assign({}, {
    time: formatTime(file.config.date, 'yyyy-MM-dd hh:mm:ss'),
    sid: file.config.sid,
    title: file.config.title || file.stats.name,
    path: getOutputPath(file.stats.path, conf.input, conf.output).slice(path.join(conf.local_dir).length)
  }, info)
}
const sliceTagInfo = function (info, file, conf) {
  return Object.assign(sliceInfo(info, file, conf), {
  })
}
const sliceListInfo = function (info, file, conf) {
  return Object.assign(sliceInfo(info, file, conf), {
    category: file.config.categories instanceof Array ? file.config.categories : [file.config.categories]
  })
}

const handleBlock = function (dir, done) {
  let edit = false
  fsLoader({
    path: dir,
    mode: 'DFS',
    deep: true,
    showDir: true,
    readFile: true,
    loader: function (stats, data, done) {
      let ext = path.parse(stats.path).ext
      let outputPath = getOutputPath(stats.path, conf.input, conf.output)
      if (stats.type === 'dir') {
        mkdirsSync(outputPath)
      } else
        if (stats.type === 'file') {
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
            data = newData
          }
          writeFile(outputPath, data, function () {
            if (ext === '.md') {
              let info = extract(data)
              let config = parseConfig(info.yaml)
              cached.push({
                info,
                data,
                stats,
                config
              })
            }
            done()
          })
          return false
        }
    },
    done: function () {
      done(edit)
    }
  })
}
const build = function (done?) {
  let edit = false
  const menu = []
  deleteFolder(conf.output)
  mkdirsSync(conf.output)
  // 第一层的子目录, 是与项目对应的类目
  // 当然, 这一层还可能有别的文件
  // 如果是目录, 整理该类目下的信息
  // 如果是文件, 直接复制到相应的输出目录
  fsLoader({
    path: conf.input,
    deep: false,
    showDir: true,
    readFile: true,
    loader(stats, data, done) {
      if (stats.type === 'file') {
        let outputPath = getOutputPath(stats.path, conf.input, conf.output)
        writeFile(outputPath, data, done)
        return false
      } else
        if (stats.type === 'dir') {
          let dirname = stats.name
          menu.push(dirname)
          mkdirsSync(path.join(conf.output, dirname))
          resetProperty()
          handleBlock(stats.path, function (isEdit) {
            if (!edit) {
              edit = isEdit
            }
            const manual = conf.sort.key === 'birthtimeMs' && conf.sort.manual
            countInfo(cached.sort(function (a, b) {
              if (manual && a.config.date && b.config.date) {
                return (a.config.date - b.config.date) * (conf.sort.desc ? -1 : 1)
              }
              return (a.stats[conf.sort.key] - b.stats[conf.sort.key]) * (conf.sort.desc ? -1 : 1)
            }))
            writeConfig(dirname)
            console.log(dirname + ' 类目处理完成')
            done()
          })
          return false
        }
    },
    done() {
      writeFileSync(path.join(conf.output, 'menu.json'), JSON.stringify(menu, null, 2))
      typeof done === 'function' && done()
      console.log('执行完毕')
      if (edit && process.argv.length > 2) {
        console.log('部分md文件未设置sid或date属性, 已自动写入, 可能需要重新add')
        process.exit(1)
      }
    }
  })
}
export default build