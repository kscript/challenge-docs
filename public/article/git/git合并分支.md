---
title: git合并分支
categories: 
  - git
tags: 
  - git
  - 合并

date: 2020-04-01 19:48:03
sid: k8hqsvnccv
---

```git

// 在dev分支内进行开发
git checkout dev
git add .
git commit -m 'N次提交代码到dev'
git push -u origin dev

// 在dev分支完成某些任务后切换到master分支
git checkout master

git merge --squash dev
git commit -m '描述下合并过来的这些代码都做了什么'
git push -u origin master

```
