"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var path = require('path');
var jsyaml = require('js-yaml');
var fsLoader = require('ks-file-loader').default;
var formatTime = function (time, str) {
    var t = time;
    if (!(time instanceof Date)) {
        try {
            t = new Date(time);
        }
        catch (err) {
            throw err;
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
};
var addProperty = function (data, stringOrFn) {
    var info = extract(data);
    var config = parseConfig(info.yaml);
    if (config.title) {
        var value = typeof stringOrFn === 'function' ? stringOrFn() : stringOrFn;
        return addContent(data, value);
    }
    return data;
};
var addContent = function (data, value) {
    var strs = (' ' + data).split('---');
    if (strs.length > 2) {
        strs[1] = strs[1] + (typeof value === 'string' ? value : '');
        return strs.join('---').slice(1);
    }
    return data;
};
var addPropertys = function (data, stringOrFn, over) {
    if (over === void 0) { over = false; }
    var info = extract(data);
    var config = parseConfig(info.yaml);
    if (config.title) {
        var value = typeof stringOrFn === 'function' ? stringOrFn(config) : stringOrFn;
        var contents = [];
        if (typeof value === 'string') {
            contents.push(value);
        }
        else if (value instanceof Object) {
            for (var key in value) {
                if (!config.hasOwnProperty(key)) {
                    contents.push(key + ': ' + value[key] + '');
                }
                else if (over) {
                    contents.push(key + ': ' + value[key] + '');
                }
            }
        }
        var content = (contents.join('\n')).replace(/\n+/g, '\n');
        return addContent(data, content ? content + '\n' : '');
    }
    return data;
};
var unique = function (ary) {
    var obj = {};
    var newAry = [];
    ary.map(function (item) {
        if (!obj[item]) {
            obj[item] = 1;
            newAry.push(item);
        }
    });
    return newAry;
};
var getOutputPath = function (currentPath, input, output) {
    var relativePath = path.join(currentPath).slice(path.join(input).length);
    return path.join(output, relativePath);
};
var extract = function (content, type) {
    if (content === void 0) { content = ''; }
    var strs = (' ' + content).split('---');
    var resObj = {
        markdown: strs.slice(0, 1).concat(strs.slice(2).join('---')).join('').slice(1),
        yaml: strs[1] || ''
    };
    return type ? resObj[type] || resObj.markdown : resObj;
};
var parseConfig = function (yaml) {
    try {
        var config = jsyaml.load(yaml) || {};
        if (config instanceof Object) {
            return config;
        }
        console.log(config);
        throw new Error('配置信息读取失败!');
    }
    catch (err) {
        throw new Error(err);
    }
};
var mkdirsSync = function (dir) {
    dir = path.join(dir);
    if (fs.existsSync(dir)) {
        return true;
    }
    else {
        if (mkdirsSync(path.dirname(dir))) {
            fs.mkdirSync(dir);
            return true;
        }
    }
};
var writeFile = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var filePath = args[0];
    mkdirsSync(path.parse(filePath).dir);
    fs.writeFile.apply(fs, args);
};
var writeFileSync = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var filePath = args[0];
    mkdirsSync(path.parse(filePath).dir);
    fs.writeFileSync.apply(fs, args);
};
var deleteFolder = function (path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + '/' + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
exports.default = {
    fsLoader: fsLoader,
    unique: unique,
    formatTime: formatTime,
    extract: extract,
    parseConfig: parseConfig,
    mkdirsSync: mkdirsSync,
    writeFile: writeFile,
    writeFileSync: writeFileSync,
    deleteFolder: deleteFolder,
    addPropertys: addPropertys,
    getOutputPath: getOutputPath
};
