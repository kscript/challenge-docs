---
title: git合并远程提交记录
date: 2018-12-22 17:57:44
tags: 
  - git
categories: git
description: git进阶用法, 使用 git + vim 命令, 对远程提交记录进行操作
sid: jpzro1q8fn
---
#### 1. 选择要操作的记录
```git
// 选择要合并记录的分支
git checkout dev
// 查看提交记录
git log

// 选取要操作的记录
// -i 后面为一个区间, 它可以是:
// 1. 提交记录的hash, 表示选择该记录(不含), 到 最新提交 这个区间
// 2. N ~ N1 区间
git rebase -i  [startpoint]  [endpoint]

```
<!-- more -->
#### 2. 选择完, 进入vim模式

首先, 使用 insert 键切换到编辑模式

```vim
  // 编辑前显示的文本
  pick [hash1] [commit]
  pick [hash2] [commit]
  pick [hash3] [commit]
  
  // pick 合并后保留的 commit
  pick [hash1] [commit]
  // 改为s, 意为合并到 pick 里
  s [hash2] [commit]
  s [hash3] [commit]
```

编辑完毕, 按ESC键, 进入命令模式
| 命令 | 说明 |
--|--
| :w | 写入
| :q | 退出, 如果内容有修改, 会提示错误 
| :q! | 不保存, 强制退出
| :wq | 写入并退出 
| :wq! | 强制写入并退出 
| :e! | 放弃所有修改，从上次保存文件开始再编辑
上面列举了用到的部分命令, 更多命令自己搜...

#### 3. 合并
退出vim模式后, git 会对选择的提交记录进行合并,

如果合并时有冲突, 需要修改, 修改以后使用命令
```git
git add .
git rebase --continue
```
你也可以放弃合并
```git
  // 放弃合并
  git rebase --abort
```

#### 4. 提交
```git
// 强制提交到dev分支
git push -f origin dev
```
