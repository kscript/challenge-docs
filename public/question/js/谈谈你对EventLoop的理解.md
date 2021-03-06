---
title: 谈谈你对事件循环(EventLoop)的理解
categories: 
  - js
tags: 
  - 事件循环
sid: k8srg56jdv
date: 2020-04-09 08:51:36
---
js是一种单线程的脚本语言, 这意味着它只能按照任务的先后, 一个一个地执行, 不能并行地去做多个任务.   
这样一来, 一些容易阻塞线程的任务(想象一下同步的http请求, 类似php中sleep函数一样的setTimeout), 就会拖慢整体代码的执行速度, 因此浏览器的js引擎实现了一套EventLoop的运行机制, 以尽可能地避免这样的情况发生.
想要了解EventLoop, 可以先简单地认识下浏览器renderer进程的一些线程, 在浏览器中有多个线程:
- GUI渲染线程
  用于处理ui相关的任务. 解析HTML，CSS，构建DOM树和RenderObject树，布局和绘制, 当界面需要重绘或回流时, 该线程就会执行, **GUI渲染线程与JS引擎线程是互斥的**, 当JS引擎执行时GUI线程会被挂起（相当于被冻结了），GUI更新会被**保存在一个队列中等到JS引擎空闲时立即被执行**。
- JS引擎线程
  JS引擎线程负责解析Javascript脚本，运行代码, **与GUI渲染线程互斥**
- 事件触发线程
  用来控制事件循环, 当一个事件被触发时, 该线程会把事件添加到待处理队列的队尾，等待JS引擎的处理, 这些事件可以是当前执行的代码块如定时任务、也可来自浏览器内核的其他线程如鼠标点击、AJAX异步请求等
- 定时触发器线程
  定时器在浏览器中是一个单独的线程, 很多文章上说, 定时触发线程之所以跟JS引擎线程分开, 是因为"JS引擎是单线程的, 如果处于阻塞线程状态就会影响记计时的准确". 我不是很认同这种解释, 很明显即便是两者分开, 定时器依然会被JS引擎阻塞, 我倒是觉得分开的考量应该在 当js引擎有空闲, 而定时器未到时间 上
- 异步http请求线程
  在XMLHttpRequest连接后, 通过浏览器新开一个线程请求.
  将检测到状态变更时，如果设置有回调函数，异步线程就产生状态变更事件，将这个回调再放入事件队列中。再由JavaScript引擎执行。

大概知道了浏览器的这些线程, 那么EventLoop运行机制是怎样的呢?
简单来说, JS引擎之外有一个专门的线程, 用于维护EventLoop的任务队列, 每当JS引擎中的代码执行完, 就到任务队列取任务并执行, 直到队列为空.
EventLoop的任务队列分为: 宏任务和微任务
宏任务: 主代码块script > setImmediate(非标准特性, 浏览器环境慎用) > MessageChannel(Web Worker) > setTimeout / setInterval
微任务: process.nextTick(NodeJs) > Promise > MutationObserver
整个EventLoop的过程如下:
1. 从主代码块开始, 自上而下执行代码, 遇到微任务将其加入微任务队列, 遇到宏任务将其加入宏任务队列.
2. 主代码块的代码执行完毕, 检查微任务队列, 按照先后顺序依次执行. 执行过程中有微任务/宏任务, 处理方式同1. 当微任务队列里没有任务时, 从宏任务队列依次取任务并按1执行, 直到宏任务队列为空, 整个EventLoop机制的流程就算是走完了

> Promise的参数executor函数本身不属于微任务, 会立即执行
> 不确定不同的微任务/宏任务是否有优先级问题, 很少同时用到, 浏览器端本身实现也不太统一, 暂时不作考虑