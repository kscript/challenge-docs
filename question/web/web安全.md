---
title: 说说对web安全的认识?
categories: 
  - web
tags: 
  - 安全
sid: k8on8yv72j
date: 2020-04-08 07:41:55
---
在web开发中, 由于网站系统漏洞和开发者的疏于防范, 给了别有用心者可乘之机, 致使网站数据泄露, 内容被篡改, 权限被窃取等一些安全问题, 常见的web安全主要有:
1. xss(跨站脚本攻击)
xss是前端主要面临的安全问题. 攻击者通过代码漏洞, 向网站注入恶意脚本, 以达到窃取网站信息的目的.  
xss分为三类:
- 反射型XSS：<非持久化> 攻击者事先制作好攻击链接, 需要欺骗用户自己访问链接才能触发XSS代码（服务器中没有这样的页面和内容），一般容易出现在搜索页面。
反射型XSS主要是后端对url的参数警惕不够疏忽大意造成的, 后端对于要输出的参数要先验证是否合规, 不能直接输出给前端
``` html
<!--
  攻击者伪造url简单示例(有些浏览器可能会拦截): 
  http://example.com/?id=</script>
  http://example.com/?id=/*
-->
<script>
  var id = "<? echo $_GET['id']; ?>"
</script>
```
- 存储型XSS：<持久化> 代码是存储在服务器中的，如在个人信息或发表文章等地方，加入代码，如果没有过滤或过滤不严，那么这些代码将储存到服务器中，每当有用户访问该页面的时候都会触发代码执行，这种XSS非常危险，容易造成蠕虫，大量盗窃cookie（虽然还有种DOM型XSS，但是也还是包括在存储型XSS内）。

存储型XSS是前后端没有对用户提交的信息进行正确的过滤转义, 对于前端而言, 通过后端返回数据(或者其它形式)生成的html, 必须严格的过滤转义, 建立黑名单或白名单  

- DOM型XSS：基于文档对象模型Document Objeet Model，DOM)的一种漏洞。DOM是一个与平台、编程语言无关的接口，它允许程序或脚本动态地访问和更新文档内容、结构和样式，处理后的结果能够成为显示页面的一部分。DOM中有很多对象，其中一些是用户可以操纵的，如URI ，location，refelTer等。客户端的脚本程序可以通过DOM动态地检查和修改页面内容，它不依赖于提交数据到服务器端，而从客户端获得DOM中的数据在本地执行，如果DOM中的数据没有经过严格确认，就会产生DOM XSS漏洞。 

DOM型XSS既可能是反射型也可能是存储型, DOM 型 XSS 跟前两种 XSS 的区别：DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞  

### 防御
- 关键 cookie 设置 httponly
- 对输入进行检查, 验证是否符合要求
- 对输出进行检查, 转义<>'"&\/等字符
- 提高对所有可能造成js代码执行的途径的防范: eval, new Function, setTimeout/setInterval, document.write, innerHTML等方法属性, DOM 中的内联事件

2. csrf(跨站请求伪造)
主要是后端没有有效地鉴别请求的来源, 使用户被攻击者冒用身份. 具体方式为: 当用户在本网站处于登录的状态下, 访问包含有csrf攻击的外网站, 被攻击者伪造请求
``` html
<!-- get 方式 -->
<img src="http://example.com/pay?money=1000">
<!-- post 方式 -->
<body onload="form.submit">
<form id="form" action="http://example.com/pay" method="POST">
  <input type="hidden" name="money" value="100">
</form>
</body>
```
### 防御
- 验证 HTTP Referer 字段
  HTTP Referer来着于客户端, 可以作为加强手段, 但不能依赖
- 生成随机token, 在用户提交时进行比对验证
  随机生成token由于浏览器的安全机制, 不会被跨域的攻击者利用, 网站一般都采用这种方式
- 在 HTTP 头中自定义属性并验证
- 增加验证码进行验证

3. sql注入

---
参考引用: 
[跨站脚本漏洞(XSS)基础讲解](https://www.jianshu.com/p/4fcb4b411a66)  
[浅谈CSRF攻击方式](https://www.cnblogs.com/hyddd/archive/2009/04/09/1432744.html)  
[CSRF 攻击的应对之道](https://www.ibm.com/developerworks/cn/web/1102_niugang_csrf/)  