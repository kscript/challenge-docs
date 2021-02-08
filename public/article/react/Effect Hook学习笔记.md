---
title: Effect Hook学习笔记
categories: 
  - react
tags: 
  - hook
sid: kad5re51sg
date: 2020-05-19 08:07:21
---
## 用途
Effect Hook 可以让你在函数组件中执行副作用操作, 在 React 组件中有两种常见副作用操作：需要清除的和不需要清除的。
> 可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合
## 不需要清除的
不返回清除函数即可. 每次重新渲染时，都会生成新的 effect，替换掉之前的。

## 需要清除的
在 effect 中返回一个函数用于清除, React 会在组件卸载的时候执行清除操作。

## 跳过 Effect
给Effect Hook传递第二个参数, 一个依赖数据的数组, React在每次执行Effect Hook前比较数组中的数据有无改变, 未改变则跳过.  
如果使用了这种优化, 需要了解[如何处理函数](https://zh-hans.reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)以及[数组频繁变化时的措施内容](https://zh-hans.reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often)  
如果传入 [], Effect Hook显然不会被执行第二次, 相当于只用到了 componentDidMount 和 componentWillUnmount  
