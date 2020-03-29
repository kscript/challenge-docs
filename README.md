# challenge
针对前端开发者知识技能的考查 (数据文件)

## 项目结构及说明

- public
  - [block name] 与challenge项目菜单一一对应的区块
    - [...] 该区块包含的一些文件, 运行build命令时, 保留目录结构, 只处理.md文件
  - ._config.yml jekyll配置, 阻止jekyll将.md文件转换为html页面
- dist 开发challenge项目时, 需要有dist目录, 没有的话, mock服务读取不到数据
- .travis.yml ci配置
- index.js 用于处理数据文件的脚本
- package.json 项目信息