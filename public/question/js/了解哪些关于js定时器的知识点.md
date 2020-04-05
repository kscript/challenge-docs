---
title: 你都了解哪些关于js定时器的知识点?
categories: 
  - js
tags: 
  - 定时器
---
在js中有两种定时器:
- setTimeout
- setInterval
两者的参数及返回值形式相同, setTimeout创建的定时器是一次性的, 而setInterval创建的定时器则会周而复始地执行.  
setTimeout和setInterval之间可以互相转换, **但在实际使用中, 推荐使用setTimeout替代setInterval**, 原因如下:  
- setTimeout有更好的参数控制粒度, setInterVal一旦确定不能更改  
- setTimeout会因为线程被阻塞而卡顿, 但不会'掉帧', setInterVal会因为线程阻塞而卡顿, 进而'掉帧'  
- setTimeout替代setInterVal后的写法, 不会比setInterval复杂, 并且通常不需要外部变量参与  

```
// setInterval 不能很方便地改变其初始参数的值 (即使仿照setTimeout来写, 也得多一步清除)
// 并且清除时必须有外部变量才可以
// 而setTimeout除非你需要中断定时器, 才有必要引入外部变量
var count = 0
var timer1 = setInterval(function(){
  if (++count > 50) {
    clearInterval(timer1)
  }
}, 1000)

// setTimeout 是一次性的, 不需要清除
// 给setTimeout设置具名函数和第三个参数后, 就可以很方便的实现setInterval的效果
setTimeout(function clock(count){
  if (++count <= 50) {
    setTimeout(clock, 1000, count)
  }
}, 1000, 0)

```

js定时器属于宏任务, 在调用栈所有微任务执行完毕才执行