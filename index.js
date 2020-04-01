const fs = require('fs')
const path = require('path')
const jsyaml = require('js-yaml')
const fsLoader = require('ks-file-loader').default
const conf = {
  input: './public/',
  output: './dist/',
  // 部署路径应为输出路径的子集
  local_dir: 'dist',
  tagNum: 5,
  sort: {
    key: 'birthtimeMs',
    desc: true
  }
}
const cached = []
const map = {}
const keys = {}
const resetProperty = function () {
  map.category = {}
  map.tag = {}
  Object.keys(map).some(function (item) {
    keys[item] = {}
  })
  cached.splice(0)
}
const countInfo = function (cached) {
  cached.map(function (file) {
    let category = countVal(map, 'category', file)
    let tag = countVal(map, 'tag', file)
    category.map(function (c) {
      tag.map(function (t) {
        keys.category[c] = (keys.category[c] || []).concat(t)
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
  let category = []
  let basePath = path.join(conf.output, dirname)
  Object.keys(keys.category).map(function (item) {
    category.push([item, countSort(keys.category[item]).slice(0, conf.tagNum).join()])
  })
  fs.writeFileSync(path.join(basePath, 'categorys.json'), JSON.stringify(category, null, 2))
  fs.writeFileSync(path.join(basePath, 'list.json'), JSON.stringify(cached.map(function(item){
    return sliceListInfo({}, item, conf)
  }), null, 2))
  Object.keys(map.category).map(function (key) {
    let tag = map.category[key]
    let res = tag.map(function (item) {
      return sliceTagInfo({}, item, conf)
    })
    fs.writeFileSync(path.join(basePath, key + '.json'), JSON.stringify(res, null, 2))
  })
}
const sliceInfo = function (info, file, conf) {
  return Object.assign({}, {
    time: file.stats.birthtimeMs,
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
    category: file.config.category instanceof Array ? file.config.category : [file.config.category]
  })
}
const parseConfig = function (yaml, stats) {
  try {
    let config = jsyaml.load(yaml) || {}
    if (config instanceof Object) {
      return config
    }
    console.log(config)
    throw (new Error('配置信息读取失败!'))
  } catch (err) {
    throw (new Error(err))
  }
}
const mkdirsSync = function (dir) {
  dir = path.join(dir)
  if (fs.existsSync(dir)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dir))) {
      fs.mkdirSync(dir)
      return true
    }
  }
}

const extract = function (content, type) {
  const strs = (' ' + content).split('---')
  const resObj = {
    markdown: strs.slice(0, 1).concat(strs.slice(2)).join('').slice(1),
    yaml: strs[1] || ''
  }
  return type ? resObj[type] || resObj.markdown : resObj
}

const unique = function (ary) {
  var obj = {}
  var newAry = []
  ary.map(function (item) {
    if (!obj[item]) {
      obj[item] = 1
      newAry.push(item)
    }
  })
  return newAry
}

const getOutputPath = function (currentPath, input, output) {
  let relativePath = path.join(currentPath).slice(path.join(input).length)
  return path.join(output, relativePath)
}
const deleteFolder = function (path) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(function (file, index) {
      let curPath = path + "/" + file
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
const build = function (done) {
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
        fs.writeFile(outputPath, data, done)
        return false
      } else
        if (stats.type === 'dir') {
          let dirname = stats.name
          mkdirsSync(path.join(conf.output, dirname))
          resetProperty()
          fsLoader({
            path: stats.path,
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
                  fs.writeFile(outputPath, data, function () {
                    if (ext === '.md') {
                      let info = extract(data)
                      let config = parseConfig(info.yaml, stats)
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