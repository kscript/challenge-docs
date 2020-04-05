---
title: es6笔记
date: 2019-02-14 03:20:46
categories: js
tags:
  - js
  - es6
description: 闭包是函数和声明该函数的词法环境的组合. 在这个词法环境里, 包含了这个闭包创建时所能访问的所有局部变量
sid: js4249f4ke
---
# Set 和 Map 数据结构

在es6以前, js中的数据结构都是由 Object 和 Array 来模拟实现的。  
而在es6中又新增了 Set 和 Map, 我们可以近似地理解为是对原有的数据结构的扩展。比如:   
  * Set 类似于 Array, 区别是, Set 的成员的值是唯一的。  
  * Map 类似于 Object, 区别是, Map 可以使用 String 以外的类型作为键名。  

## Set
### [](#属性 "属性")属性
  *   size：实例的成员总数。

### 操作方法
  * add(value)：添加某个值，返回 Set 结构本身。
  * delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
  * has(value)：返回一个布尔值，表示该值是否为Set的成员。
  * clear()：清除所有成员，没有返回值。
  ``` js
  let set = new Set([NaN, NaN]) // {NaN}
  set.add(+0).add(-0) // {NaN, 0}
  set.size // 2
  set.has(-0) // true
  set.delete(-0) // {NaN}
  set.clear()
  // Set 对于键值的判断, 介于 === 和 Object.is 之间。
  // 在 Set 里, NaN 与 NaN 是相等的, 而 +0 与 -0 则是不等的
  ```

### 遍历方法

  Set 结构的实例有四个遍历方法，可以用于遍历成员。
  * keys()：返回键名的遍历器。
  * values()：返回键值的遍历器。
  * entries()：返回键值对的遍历器。
  * forEach()：使用回调函数遍历每个成员。

### 知识点

1. Set的遍历顺序就是插入顺序
2. Set 与 Array 互转
``` js
let arr = [NaN, 0]
// Array 转 Set
let set = new Set(arr)
// Set 转 Array
arr = [...set]
Array.from(set)
```

## WeakSet
> WeakSet 结构与 Set 类似，也是不重复的值的集合。但是，它与 Set 有两个区别。
  首先，WeakSet 的成员 **只能是对象**，而不能是其他类型的值。
  其次，WeakSet 中的 **对象都是弱引用**，即 **垃圾回收机制不考虑 WeakSet 对该对象的引用**，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于 WeakSet 之中。