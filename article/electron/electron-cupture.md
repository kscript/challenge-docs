---
title: 在 electron 中使用截屏功能
categories: 
  - electron
tags: 
  - js
  - electron
---

### 前言
今天在 electron 技术群, 看到一个关于截屏的问题, 有人推荐使用第三方来实现. 
印象中 electron 应该有提供这方面的功能, 翻了下 API 文档, 果然是有的~ 在这里, 忍不住吐槽一下, 现在的人啊, 连文档都懒得翻, 一些技术群经常看到这样的伸手党, 真是让人无语.. 废话不多说, 说一说在 electron 里如何实现截屏功能

### API
截屏的话, 大概有两种, 这篇文章只讲第 1 种, 第 2 种以后有时间再讲
1. 应用内截屏, 涉及到的api (不太明白两者之前是否有区别)
  - [win.capturePage](https://electronjs.org/docs/all#wincapturepagerect-callback)
  - [contents.capturePage](https://electronjs.org/docs/all#contentscapturepagerect-callback)
2. 屏幕截屏 (对显示在桌面上的应用进行截屏)
  - [desktopCapturer](https://electronjs.org/docs/api/desktop-capturer#desktopcapturer)
   
### 实现
由于 [win.capturePage](https://electronjs.org/docs/all#wincapturepagerect-callback) / [contents.capturePage](https://electronjs.org/docs/all#contentscapturepagerect-callback) 是主进程的api, 而我们是在渲染进程里才会使用, 因此我们需要用到 [ipcMain](https://electronjs.org/docs/api/ipc-main) 和 [ipcRenderer](https://electronjs.org/docs/api/ipc-renderer) 来进行通信

``` js
// 主进程入口文件
import { BrowserWindow, ipcMain } from 'electron'
let win = new BrowserWindow()

// 注册 mainCapturePage 事件, 当 渲染进程 有截屏通知时调用
ipcMain.on('mainCapturePage', event => {
  // 应用窗口在正常显示状态下的 位置信息(在屏幕上的x,y坐标) 以及 (应用自己的尺寸)大小信息
  let size = win.getContentBounds()
  // 将 x, y 重置为 0
  size.x = 0
  size.y = 0
  // 调用 win.capturePage api
  win.capturePage(size, image => {
    // 通知渲染进程
    event.sender.send('renderCapturePage', [image.toDataURL()])
  })
})

// 渲染进程内的文件
// 先注册 renderCapturePage 事件
electron.ipcRenderer.on('renderCapturePage', (event, data) => {
  let base64Url = data[0]
  // 使用 a 标签 / 或 electron api 完成下载, 略
})

// 再通知 主进程 来截屏
electron.ipcRenderer.send('mainCapturePage')
```
