---
title: webpack概念
exclude: false
categories: 
  - webpack
sid: ka9f28m11k
date: 2020-05-16 05:16:39
---
## 概述
webpack 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle。  
webpack有四个核心概念:
- entry(入口)  
- output(出口)  
- loader(加载器)  
- plugin(插件)  

## entry(入口)
entry: string | [string] | object { <key>: string | [string] } | (function: () => string | [string] | object { <key>: string | [string] }) = "./src"  
entry是webpack的起点, webpack会从这个起点, 找出哪些模块和库和它存在依赖关系, 每个依赖项随即被处理, 最后输出到称之为 bundles 的文件中。    
### 命名
如果传入一个字符串或字符串数组，chunk 会被命名为 main。如果传入一个对象，则每个键(key)会是 chunk 的名称，该值描述了 chunk 的入口起点。  
简单来说, 字符串和字符串数组最终是一个入口(chunk名是main), 它们组合成一个对象时, 则这个对象的每一个属性值都是一个入口(一般可作多页应用, 则其key作为chunk名)
### 动态入口
所谓动态入口即entry为函数时, 执行后得到的最终值(一般为函数返回值, 若返回值是Promise时, 取resolved的值)
``` javascript
entry: () => './demo'
```
或
``` javascript
entry: () => new Promise((resolve) => resolve(['./demo', './demo2']))
```
## output(输出)
output 位于对象最顶级键(key)，包括了一组选项，指示 webpack 如何去输出、以及在哪里输出你的「bundle、asset 和其他你所打包或使用 webpack 载入的任何内容」**注意，即使可以存在多个入口起点，但只指定一个输出配置。**
在 webpack 中配置 output 属性的最低要求是，将它的值设置为一个对象，包括以下两点：
- filename 用于输出文件的文件名。
- 目标输出目录 path 的绝对路径。

### 多个入口起点
如果配置创建了多个单独的 "chunk", 则应该使用[占位符(substitutions)](https://www.webpackjs.com/configuration/output/#output-filename)来确保每个文件具有唯一的名称。
| 模板 | 描述 |
| -- | -- |
| [hash] | 模块标识符(module identifier)的 hash |
| [chunkhash] | chunk 内容的 hash |
| [name] | 模块名称 |
| [id] | 模块标识符(module identifier) |
| [query] | 模块的 query，例如，文件名 ? 后面的字符串 |

## loader(加载器)
loader 用于对模块的源代码进行转换。loader关注匹配到的文件中要处理的那一部分(或者整个文件).  
当我们定义好匹配规则和要使用的loaders后, 如果有一个匹配到的文件被加载, 那么它所要使用的loaders, 就会像流水线一样从右到左依次执行, 将返回值传递给下一个loader, 在最后一个 loader，返回 webpack 所预期的 JavaScript。

### 同步 loader
无论是 return 还是 this.callback 都可以同步地返回转换后的 content 内容 (当调用 callback() 时总是返回 undefined)
### 异步 loader
使用 this.async 来获取 callback 函数 (很好理解, 由开发者自己决定何时调用callback)
### "Raw" loader
默认情况下，资源文件会被转化为 UTF-8 字符串，然后传给 loader。通过设置 raw，loader 可以接收原始的 Buffer。每一个 loader 都可以用 String 或者 Buffer 的形式传递它的处理结果。Complier 将会把它们在 loader 之间相互转换。

## plugins(插件)
webpack 插件是一个具有 apply 属性的 JavaScript 对象。apply 属性会被 webpack compiler 调用，并且 compiler 对象可在整个编译生命周期访问。  
[compiler 钩子](https://www.webpackjs.com/api/compiler-hooks/)