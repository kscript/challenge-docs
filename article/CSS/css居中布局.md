---
title: css居中布局
categories: css
tags: 
  - css

date: 2020-03-30 23:37:32


---
### css布局

#### 水平垂直居中
dom结构
``` html
    <div class="parent">
        <div class="child">
            Hello world!
        </div>
    </div>
```

``` css
.parent {
    height: 300px;
    color: #fff;
    background: #333;
}
.child {
  width: 200px;
  height: 200px;
  line-height: 200px;
  text-align: center;
  background: #666;
}
/* 1. padding + margin
 * 需要知道自身和子元素的高
 */
.parent.layout1 {
  /* 使子元素垂直居中 */
  padding: 50px 0;
  box-sizing: border-box;
}
.parent.layout1 .child {
    /* 子元素水平居中 */
    margin: 0 auto;
}

/* 2. absolute + margin负值
 * 需要知道子元素的宽度
 */
.parent.layout2 {
    position: relative;
}
.parent.layout2 .child{
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -100px 0 0 -100px;
}

/* 3. absolute + transform
 * transform 是css3属性, 不支持ie8及ie8以下浏览器
 */
parent.layout3 {
    position: relative;
}
.parent.layout3 .child{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* 4. flex + margin
 * display: flex 是在css3新增的display布局方式, 不支持ie9及ie9以下浏览器
 */
.parent.layout4 {
    display: flex;
}
.parent.layout4 .child{
    margin: auto;
}
/* 5. flex
 * display: flex 是在css3新增的display布局方式, 不支持ie9及ie9以下浏览器
 */
.parent.layout5 {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 6. table-cell 
 * 虽然实现了水平垂直居中, 但子元素的宽高..
 * 看来table-cell更适合 占满剩余空间 的布局
 */
.parent.layout6 {
    width: 100%;
    display: table;
}
.parent.layout6 .child{
    display: table-cell;
    vertical-align: middle;
}

```
