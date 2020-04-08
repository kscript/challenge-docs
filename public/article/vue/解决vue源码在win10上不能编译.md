---
title: 解决vue源码在win10上不能编译
categories: vue
tags:
  - 源码
date: 2020-04-08 06:12:14
sid: k8r6bcgfcd
---
vue3在前端界沸沸扬扬了许久, 再有一段时间应该就能正式发布了, 现在正是读vue3.0或者vue2.+的时候, 前者还是雏形, 后者已基本尘埃落定, 所以近期准备重读下vue2.  
vue项目clone下来自己编译了一下, 遇到了下面描述的这个问题:  
[vue.js 2.0 alpha error on start on windows 10 x64](https://github.com/vuejs/vue/issues/2771)  
看了回答中作者以及其他开发者的回复得知, 编译脚本在win10上不支持的问题还没修复, 而我的系统环境正好是 win10(64). 当然, 有开发者给出了解决方案:
``` javascript
// This file: node_modules/rollup-plugin-alias/dist/rollup-plugin-alias.js

// 找到这一句
// let updatedId = normalizeId(importeeId.replace(toReplace, entry));
// 在后面加上

if (!/js$/.test(updatedId)) {
  console.log(updatedId + '  ---->  ' + updatedId + '.js');
  updatedId += '.js';
}

```
试了一下, 虽然解决了js文件找不到的问题, 但脚本仍然有其他的路径报出有问题
``` javascript
// 将
// const filePath = path.posix.resolve(directory, updatedId);
// 替换为
const filePath = IS_WINDOWS ? path.join(directory, updatedId) : path.posix.resolve(directory, updatedId);
```
现在暂时是可以了, 记录一下, 后面遇到问题了再看吧