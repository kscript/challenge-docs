---
title: 使用verdaccio搭建本地npm仓库
copyright: true
author: 
home: 
url: 
categories: npm
tags: 
  - npm
description: 使用 verdaccio 搭建本地 npm 仓库
date: 2018-12-26 18:23:10
sid: jq5ic5v4o5
---
### 前言
在前端日益工程化的今天, 我们几乎每天都在和node, npm, webpack这些工具打交道.
它们极大地提升了我们的开发效率, 却也带来了不少的问题.
比如webpack的难配置, npm包的依赖地狱, 动不动就需要安装一堆依赖等...
今天记录一下 使用verdaccio搭建本地npm仓库 的办法, 解决npm依赖过重的问题.
关于webpack的配置, 如果有闲暇时间的话, 我准备再写一篇[从零配置一个webpack项目]的文章.
<!-- more -->
---

### 使用本地仓库的优势
1. 减少重复安装
2. 可以发布一些私有包

### 环境搭建
1. 全局安装 verdaccio
```cmd
npm install --global verdaccio
```

### 使用说明

1. 运行 verdaccio
```cmd
verdaccio
```

2. 修改配置
在运行 verdaccio 命令时的输出信息里, 找到 config.yaml文件
```
// 本地仓库没有指定包时的上游仓库
uplinks:
  npmjs:
    url: https://registry.npm.taobao.org/  
// 文末添加监听端口
listen: 0.0.0.0:4873
```

3. 设置仓库地址
```cmd
npm set registry http://localhost:4873/
```

4. 添加账户
```cmd
npm adduser admin --registry http://localhost:4873
```

5. 发布私有包
```cmd
npm publish --registry http://localhost:4873
```

### 守护进程
1. 试过一些教程中说的pm2, 可惜在windows系统中不太好用, 只好退而求次使用 开机启动 + vbs脚本打开一个隐藏的命令行 这种方法. 代码如下, 将其放入Startup文件夹即可.
**注意: 文件的名字不要是verdaccio.vbs, 会覆盖verdaccio命令**

```vbs
// verda.vbs
Set ws = CreateObject("Wscript.Shell") 
ws.run "cmd /c verdaccio",vbhide
```
嗯 .. 对于不会vbs的我来说, 这个进程很安全很安全.
话说, 这个进程除了删文件关电脑外, 还有什么办法可以很方便地关掉~
