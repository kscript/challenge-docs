---
title: vue中使用mixins的一些要点
categories: vue
tags:
  - vue
description: 混入 (mixins) 是一种分发 Vue 组件中可复用功能的非常灵活的方式。混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被混入该组件本身的选项。
date: 2019-01-24 08:57:28
sid: jradwddsdu
---

### 选项合并

1. 同名选项的合并:  
数据对象在内部会进行 **浅合并** (一层属性深度), 在和组件的数据发生冲突时 **以组件数据优先** 。
2. 同名钩子函数合并:  
混合为 **一个数组** , 混入对象的钩子将在 **组件自身钩子之前** 调用。
3. 值为对象的选项合并:  
例如 methods, components 和 directives, 将被混合为 **同一个对象** 。两个对象键名冲突时， **取组件对象** 的键值对。

### 全局混入

使用全局混入对象，将会影响到 所有 之后创建的 Vue 实例  

### 自定义选项合并策略

自定义选项将使用默认策略，即简单地覆盖已有值。如果想让自定义选项以自定义逻辑合并，可以向 Vue.config.optionMergeStrategies 添加一个函数  
``` javascript
Vue.config.optionMergeStrategies.myOption = function (toVal, fromVal) {
  // return mergedVal
}
```