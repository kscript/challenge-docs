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

const map = {}
const keys = {}
const cached = []
const menu = []
const conf = {}

const resetProperty = function () {
  map.tags = {}
  map.categories = {}
  keys.tags = {}
  keys.categories = {}
  cached.splice(0)
}
const countInfo = function (files) {
  files.map(function (file) {
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

const writeConfig = function (files, dirname) {
  try {
    const basePath = path.join(conf.output, dirname)
    splitCategorys(files, dirname, basePath)
    splitCategory(files, dirname, basePath)
    splitTimeline(files, dirname, basePath)
    writeFileSync(path.join(conf.output, 'info.json'), JSON.stringify({
      data: conf
    }, null, 2))
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

const splitCategorys = function(files, dirname, basePath) {
  const size = 100 // conf.page.size
  let categories = []
  Object.keys(keys.categories).map(function (item) {
    categories.push([item, countSort(keys.categories[item]).slice(0, conf.tagsNum).join()])
  })
  splitList(categories, size, function(pageno, data) {
    writeFileSync(path.join(basePath, 'categorys.json'), JSON.stringify({
      total: categories.length,
      size,
      pageno,
      data
    }, null, 2))
  })
}
const splitCategory = function(files, dirname, basePath) {
  const size = conf.page.size
  Object.keys(map.categories).map(function (key) {
    let category = map.categories[key]
    let list = category.map(function (item, index) {
      return sliceTagInfo({
        pageno: ~~(index / size + 1)
      }, item, conf)
    })
    splitList(list, size, function(pageno, data) {
      writeFileSync(path.join(basePath, key, 'category_' + pageno + '.json'), JSON.stringify({
        total: list.length,
        size,
        pageno,
        data
      }, null, 2))
    })
  })
}
const splitTimeline = function(files, dirname, basePath) {
  const size = conf.page.size
  const list = files.map(function (item, index) {
    return sliceListInfo({
      pageno: ~~(index / size + 1)
    }, item, conf)
  })
  splitList(list, size, function(pageno, data) {
    writeFileSync(path.join(basePath, 'timeline_' + pageno + '.json'), JSON.stringify({
      total: list.length,
      size,
      pageno,
      data
    }, null, 2))
  })
}
const splitList = function(list, size, func) {
  if (Array.isArray(list)) {
    let index = 0
    while(index * conf.page.size < list.length) {
      func(index + 1, list.slice(index * conf.page.size, (index += 1) * conf.page.size))
    }
  }
}

// context 插件的公共环境
// options 入口文件配置项plugins里定义的配置(最终结果)
// config 入口文件配置
const apply = function (context, options, config) {
  Object.assign(conf, config)
  return {
    build() {
    },
    handleRoot(stats, data) {
      if (stats.type === 'dir') {
        menu.push(stats.name)
      }
    },
    handleBlockRoot(stats, data) {
    },
    handleBlock(stats, data) {
      resetProperty()
    },
    handleBlockFile(stats, data) {
      let ext = path.parse(stats.path).ext
      if (ext === '.md') {
        let info = extract(data)
        let config = parseConfig(info.yaml)
        if (config.sid === 'k90k20kaks') {
          console.log(data, 'base')
        }
        cached.push({
          info,
          data,
          stats,
          config
        })
      }
    },
    handleBlockEnd(stats, data) {
      const manual = conf.sort.key === 'birthtimeMs' && conf.sort.manual
      countInfo(cached.sort(function (a, b) {
        if (manual && a.config.date && b.config.date) {
          return (a.config.date - b.config.date) * (conf.sort.desc ? -1 : 1)
        }
        return (a.stats[conf.sort.key] - b.stats[conf.sort.key]) * (conf.sort.desc ? -1 : 1)
      }))
      writeConfig(cached, stats.name)
      console.log(stats.name + ' 类目处理完成')
    },
    buildEnd() {
      writeFileSync(path.join(conf.output, 'menu.json'), JSON.stringify({
        data: menu
      }, null, 2))
    }
  }
}
module.exports = {
  name,
  record: true,
  apply
}