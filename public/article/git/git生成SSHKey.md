---
title: git生成SSHKey
categories: 
  - git
tags: 
  - git

date: 2020-04-01 19:48:03
---

1. 配置全局 name 和 email
```git
git config --global user.name "your_account"
git config –-global user.email your_email@example.com
```

2. 生成 SSH Key  
将以下命令中的邮箱改为自己的邮箱后, 执行命令, 然后连续按回车键三次
```git
ssh-keygen -t rsa -C your_email@example.com
```

3. 查看生成的 SSH Key  
```git
cat ~/.ssh/id_rsa.pub
```

4. 添加 SSH Key 到 github 配置  
使用第3步的命令, 或者打开 C:\Users\Administrator\\.ssh\id_rsa.pub 文件来获取 SSH Key,  
然后打开 [添加 SSH Key](https://github.com/settings/ssh/new) 页面, 自定义一个 title, 并将 SSH Key 粘贴到 Key 输入框, 最后点击 Add

5. 测试 SSH Key
```git
ssh git@github.com
```
