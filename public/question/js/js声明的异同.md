---
title: 在js中声明语句之间有什么异同?
categories: 
  - js
tags: 
  - 声明
sid: k8o4upvafv
date: 20-04-06 03:08:00
---
在js中var、let、const都是用于声明变量的语句, 三者的区别在于:
- var 声明一个变量，可同时将其初始化为一个值.  
  如果只声明不赋值, 那么值默认是undefined. 在同一作用域内重复声明时, 后声明的会被忽略(但赋值仍然有效), 存在**声明提升**(会将声明提升到当前作用域的最前面)
- let 声明一个块级本地变量，可同时将其初始化为一个值.  
  如果只声明不赋值, 那么值默认是undefined. **在同一作用域内不能重复声明**, 存在**暂时性死区**(声明之前不能直接使用)
- const 声明一个常量, 声明时**必须有初始值**.   
  与let一样, 在同一作用域内不能重复声明, 存在暂时性死区. 并且**const声明的值不能修改**(值为引用类型时, 不能修改是指: **不能修改引用地址**)

> 注意: 非严格模式下, 不声明直接赋值的变量, 默认为全局变量

## 声明提升案例
不声明直接使用会报错
``` javascript
console.log(a) // 报错 ReferenceError
```
声明虽然在后, 但不会报错
``` javascript
  console.log(a) // undefined
  var a = 1
  console.log(a) // 1

  // 上面的代码相当于
  var a // 声明被提升
  console.log(a)
  a = 1
  console.log(a)
```

## 暂时性死区案例
``` javascript
console.log(1) // 报错 ReferenceError
let a = 1
```

## const声明常量值为引用类型案例
``` javascript
const a = {}
a.name = 'b' // 没有修改引用地址, 不会报错
a = {} // 报错 SyntaxError
```