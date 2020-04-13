const fs = require('fs')
const path = require('path')
const jsyaml = require('js-yaml')
const fsLoader = require('ks-file-loader').default

const formatTime = (time, str) => {
  var t = time
  if (!(time instanceof Date)) {
    try {
      t = new Date(time)
    } catch (err) {
      throw err
    }
  }
  var obj = {
    yyyyyyyy: t.getFullYear(),
    yy: t.getFullYear(),
    MM: t.getMonth() + 1,
    dd: t.getDate(),
    HH: t.getHours(),
    hh: t.getHours() % 12,
    mm: t.getMinutes(),
    ss: t.getSeconds(),
    ww: ['日', '一', '二', '三', '四', '五', '六'][t.getDay()]
  };
  return str.replace(/([a-z]+)/ig, function ($1) {
    return (obj[$1 + $1] === 0 ? '0' : obj[$1 + $1]) || ('0' + obj[$1]).slice(-2);
  });
}
const addProperty = (data, stringOrFn) => {
  const info = extract(data)
  const config = parseConfig(info.yaml)
  if (config.title) {
    const value = typeof stringOrFn === 'function' ? stringOrFn() : stringOrFn
    return addContent(data, value)
  }
  return data
}
const addContent = (data, value) => {
  const strs = (' ' + data).split('---')
  if (strs.length > 2) {
    strs[1] = strs[1] + (typeof value === 'string' ? value : '')
    return strs.join('---').slice(1)
  }
  return data
}
const addPropertys = (data, stringOrFn, over = false) => {
  const info = extract(data)
  const config = parseConfig(info.yaml)
  if (config.title) {
    const value = typeof stringOrFn === 'function' ? stringOrFn(config) : stringOrFn
    const contents = []
    if (typeof value === 'string') {
      contents.push(value)
    } else if (value instanceof Object) {
      for (let key in value) {
        if (!config.hasOwnProperty(key)) {
          contents.push(key + ': ' + value[key] + '')
        } else if (over) {
          contents.push(key + ': ' + value[key] + '')
        }
      }
    }
    let content = (contents.join('\n')).replace(/\n+/g, '\n')
    return addContent(data, content ? content + '\n' : '')
  }
  return data
}
const unique = (ary) => {
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
const getOutputPath = (currentPath, input, output) => {
  let relativePath = path.join(currentPath).slice(path.join(input).length)
  return path.join(output, relativePath)
}
const extract = (content: string = '', type?: string) => {
  const strs = (' ' + content).split('---')
  const resObj = {
    markdown: strs.slice(0, 1).concat(strs.slice(2).join('---')).join('').slice(1),
    yaml: strs[1] || ''
  }
  return type ? resObj[type] || resObj.markdown : resObj
}
const parseConfig = (yaml) => {
  try {
    let config = jsyaml.load(yaml) || {}
    if (config instanceof Object) {
      return config
    }
    console.log(config)
    throw new Error('配置信息读取失败!')
  } catch (err) {
    throw new Error(err)
  }
}
const mkdirsSync = (dir) => {
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
const writeFile = (...args) => {
  const [filePath] = args
  mkdirsSync(path.parse(filePath).dir)
  fs.writeFile.apply(fs, args)
}
const writeFileSync = (...args) => {
  const [filePath] = args
  mkdirsSync(path.parse(filePath).dir)
  fs.writeFileSync.apply(fs, args)
}
const deleteFolder = (path) => {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(function (file, index) {
      let curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
export default {
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
}