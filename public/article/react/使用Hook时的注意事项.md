---
title: 使用Hook时的注意事项
categories: 
  - react
tags: 
  - hook
sid: kad89zghrx
date: 2020-05-19 09:17:48
---
React 怎么知道哪个 state 对应哪个 useState？答案是 React 靠的是 Hook 调用的顺序。
只要 Hook 的调用顺序在多次渲染之间保持一致，React 就能正确地将内部 state 和对应的 Hook 进行关联。
因此, 在使用 Hook 的时候, 保证调用顺序很重要!  React为我们总结了使用它时需要遵循的两条规则

## 只在最顶层使用 Hook
不要在循环，条件或嵌套函数中调用 Hook， 确保总是在你的 React 函数的最顶层调用他们。遵守这条规则，你就能确保 Hook 在每一次渲染中都按照同样的顺序被调用。

## 只在 React 函数中调用 Hook
不要在普通的 JavaScript 函数中调用 Hook。 遵循此规则，确保组件的状态逻辑在代码中清晰可见。