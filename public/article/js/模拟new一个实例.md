---
title: 模拟new一个实例
date: 2018-12-26 09:49:16
categories: js
tags: 
  - js
description: 模拟使用 new 实例化一个实例的过程
sid: jq4zza74so
---
#### 实现方法
```js
function newInstace (func) {
  if (func instanceof Function) {
    // 基于函数原型创建一个对象
    var instace = Object.create(func.prototype);
    // 修改函数的指向并调用
    var result = func.apply(instace, [].slice.call(arguments, 1));
    // 如果返回值是对象, 则返回这个对象, 否则返回前面创建的实例
    return result instanceof Object ? result : instace;
  }
  throw '第一个参数不是函数~';
}
```
<!-- more -->
#### 调用方法
```js
function Person(name){
  this.name = name;
}
function Cat(name){
  this.name = name;
  return {
    name: 'c'
  }
}
console.log(newInstace(Person, 'a')); // Person{ name: "a" }
console.log(newInstace(Cat, 'b')); // { name: "c" }
```
