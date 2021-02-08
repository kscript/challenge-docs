---
title: 自定义Hook
categories: 
  - react
tags: 
  - hook
sid: kad8k8n5hg
date: 2020-05-19 09:25:46
---
通过自定义 Hook，可以将组件逻辑提取到可重用的函数中。  

自定义 Hook 是一个函数，其名称以 “use” 开头，函数内部可以调用其他的 Hook。 我们可以自由的决定它的参数是什么，以及它应该返回什么（如果需要的话）  

与组件中一致，请确保只在自定义 Hook 的顶层无条件地调用其他 Hook。 
