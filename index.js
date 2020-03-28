const fs = require('fs')
const path = require('path')
const jsyaml = require('js-yaml')
const fsLoader = require('ks-file-loader').default
const conf = {
  output: './question/',
  tagNum: 5,
  sort: {
    key: 'birthtimeMs',
    desc: true
  }
}
const cached = []
const map = {
  category: {},
  tag: {}
}
const keys = {}
Object.keys(map).some(function(item) {
  keys[item] = {}
})
const countInfo = function(cached) {
  cached.map(function(file) {
    let category = countVal(map, 'category', file)
    let tag = countVal(map, 'tag', file)
    category.map(function(c) {
      tag.map(function(t) {
        keys.category[c] = (keys.category[c] || []).concat(t)
      })
    })
  })
  return map
}

const countVal = function(target, key, file) {
  let obj = target[key]
  let val = file.config[key]
  if (typeof val === 'string') {
    val = [val]
  }
  if (val instanceof Array) {
    return unique(val).map(function(item) {
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
const countSort = function(list) {
  let obj = {}
  list.map(function(item) {
    obj[item] = (obj[item] || 0) + 1
  })
  return Object.keys(obj).sort(function(a, b) {
    return obj[b] - obj[a]
  })
}
const writeConfig = function() {
  let category = []
  Object.keys(keys.category).map(function(item) {
    category.push([item, countSort(keys.category[item]).slice(0, conf.tagNum).join()])
  })
  fs.writeFileSync(path.join(conf.output, '/categorys.json'), JSON.stringify(category, null, 2))
  Object.keys(map.category).map(function(key) {
    let tag = map.category[key]
    let res = tag.map(function(item) {
      return {
        title: item.config.title || item.stats.name,
        path: item.stats.path
      }
    })
    console.log(key)
    console.log('')
    fs.writeFileSync(path.join(conf.output, '/' + key +'.json'), JSON.stringify(res, null, 2))
  })
}
const parseConfig = function (yaml, stats) {
  try {
    let config = jsyaml.load(yaml.slice(3, -3)) || {}
    if (config instanceof Object) {
      return config
    }
    console.log(config)
    throw(new Error('配置信息读取失败!'))
  } catch(err) {
    throw(new Error(err))
  }
}
const extract = function (content, type) {
  const str = '---'
  const index = content.indexOf(str)
  const nextIndex = content.slice(index + 1).indexOf(str)
  const resObj = {
    markdown: nextIndex < 0 ? content : content.slice(nextIndex + str.length),
    yaml: nextIndex < 0 ? '' : content.slice(index, nextIndex + str.length + 1)
  }
  return type ? resObj[type] || resObj.markdown : resObj
}
const unique = function(ary) {
  var obj = {}
  var newAry = []
  ary.map(function(item) {
    if (!obj[item]) {
      obj[item] = 1
      newAry.push(item)
    }
  })
  return newAry
}
fsLoader({
  // 要进行转换的目录
  // 相对于项目目录, 而非文件所在目录
  path: './',

  // 文件扩展名, 支持正则
  ext: 'md',

  // 是否深层遍历
  deep: true,

  // 是否读取文件内容
  readFile: true,
  /**
   * 加载器
   * @param {object} stats 文件信息
   * @param {string} data 文件内容 readFile 为 false 时返回空字符串
   * @param {function} done 文件处理完毕的回调 (必要的)
   */
  loader: function(stats, data, done){
    let info = extract(data)
    var config = parseConfig(info.yaml, stats)
    cached.push({
      info,
      data,
      stats,
      config
    })
  },
  // 转换完毕
  done: function(){
    let infos = countInfo(cached.sort(function(a, b) {
      return (a.stats[conf.sort.key] - b.stats[conf.sort.key]) * (conf.sort.desc ? -1 : 1)
    }))
    writeConfig()
  }
})