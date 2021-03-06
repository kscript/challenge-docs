---
title: 说说nextTick的用途及原理
categories: 
  - vue
tags: 
  - 原理
  - 事件循环
sid: k9a2t0jvl3
date: 2020-04-21 11:41:37
---
## 引入nextTick的起因及其用途
众所周知, 操作DOM是一项比较消耗性能的开销(主要是因为会引起回流和重绘), 因此在vuejs中, 为了避免频繁地更改DOM, DOM的更新一般是异步的.   
通过将DOM的变化存储为一个队列, 在其它任务处理完毕后, 一次性地集中更新DOM, 从而避免了大量不必要的开销(现代浏览器对于批量操作DOM会有优化, 类似于vue中所做的).
既然是异步更新DOM, 那么原来同步更新DOM时, 一些要在更新DOM后执行的代码, 就会先于更新DOM执行. 这样一来如何保证我们原来的其它代码, 是在DOM更新后再去执行的呢? 基于这样的情况, vue设计了一个API方法: nextTick, 一个异步更新DOM后的回调钩子
## nextTick原理
nextTick本质上是利用事件循环机制, 将 **处理 异步更新DOM队列** 和 **更新完DOM的回调**, 分别作为一个阶段的任务, 按前后次序执行.
实现nextTick函数, 首先是根据宿主环境, 然后依次尝试通过Promise, MutationObserver创建微任务, 如果宿主环境不支持, 则再尝试setImmediate, setTimeout创建宏任务. 最后在任务的回调里传入清空调用链的方法(调用链队列里存放着所有nextTick回调, 依次执行)
