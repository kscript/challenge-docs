const fs = require('fs')
const path = require('path')
const fsLoader = require('ks-file-loader').default
const utils = require('./utils')
const conf = {
  input: './public/',
  output: './dist/',
  // 部署路径应为输出路径的子集
  local_dir: 'dist',
  tagsNum: 5,
  sort: {
    key: 'birthtimeMs',
    desc: true
  }
}
const map = {}
const keys = {}
const cached = []
const resetProperty = function () {
  map.categories = {}
  map.tags = {}
  Object.keys(map).some(function (item) {
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
    return utils.unique(val).map(function (item) {
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
  let categories = []
  let basePath = path.join(conf.output, dirname)
  Object.keys(keys.categories).map(function (item) {
    categories.push([item, countSort(keys.categories[item]).slice(0, conf.tagsNum).join()])
  })
  fs.writeFileSync(path.join(basePath, 'categorys.json'), JSON.stringify(categories, null, 2))
  fs.writeFileSync(path.join(basePath, 'list.json'), JSON.stringify(cached.map(function(item){
    return sliceListInfo({}, item, conf)
  }), null, 2))
  Object.keys(map.categories).map(function (key) {
    let tags = map.categories[key]
    let res = tags.map(function (item) {
      return sliceTagInfo({}, item, conf)
    })
    fs.writeFileSync(path.join(basePath, key + '.json'), JSON.stringify(res, null, 2))
  })
}
const sliceInfo = function (info, file, conf) {
  return Object.assign({}, {
    time: file.config.date,
    title: file.config.title || file.stats.name,
    path: utils.getOutputPath(file.stats.path, conf.input, conf.output).slice(path.join(conf.local_dir).length)
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

const build = function (done) {
  utils.deleteFolder(conf.output)
  utils.mkdirsSync(conf.output)
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
        let outputPath = utils.getOutputPath(stats.path, conf.input, conf.output)
        fs.writeFile(outputPath, data, done)
        return false
      } else
        if (stats.type === 'dir') {
          let dirname = stats.name
          utils.mkdirsSync(path.join(conf.output, dirname))
          resetProperty()
          fsLoader({
            path: stats.path,
            mode: 'DFS',
            deep: true,
            showDir: true,
            readFile: true,
            loader: function (stats, data, done) {
              let ext = path.parse(stats.path).ext
              let outputPath = utils.getOutputPath(stats.path, conf.input, conf.output)
              if (stats.type === 'dir') {
                utils.mkdirsSync(outputPath)
              } else
                if (stats.type === 'file') {
                  utils.mkdirsSync(path.parse(outputPath).dir)
                  data = utils.setTime(stats, data)
                  
                  fs.writeFile(outputPath, data, function () {
                    if (ext === '.md') {
                      let info = utils.extract(data)
                      let config = utils.parseConfig(info.yaml, stats)
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
              countInfo(cached.sort(function (a, b) {
                return (a.stats[conf.sort.key] - b.stats[conf.sort.key]) * (conf.sort.desc ? -1 : 1)
              }))
              writeConfig(dirname)
              console.log(dirname + ' 类目处理完成')
              done()
            }
          })
          return false
        }
    },
    done() {
      typeof done === 'function' && done()
      console.log("执行完毕")
    }
  })
}
build()