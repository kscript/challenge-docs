---
title: v-show和v-if的区别
categories: 
  - vue
tags: 
  - 指令

date: 2020-04-02 00:08:20
sid: k8i03lswbb
---

v-show和v-if的区别：
v-show是css切换，v-if是完整的销毁和重新创建。

频繁切换时用v-show，运行时较少改变时用v-if
v-if="false" v-if是条件渲染，当false的时候不会渲染
