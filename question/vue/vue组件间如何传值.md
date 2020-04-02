---
title: vue组件间如何传值
categories: 
  - vue
tags: 
  - 组件
date: 2020-04-02 00:12:46
---
父子组件:

父组件:
``` html
  <v-child :value="value" @changeValue="valueChange"></v-child>
```
子组件:
``` html
<script>
new Vue({
  // 父组件传给子组件的值在props里
  props: {
    value: {
      type: 'number',
      default: 0
    }
  },
  methods: {
    change() {
      // 子组件修改父组件的值, 通过一个事件
      this.$emit('changeValue', 11111)
    }
  }
})
</script>
```

通用的组件间传值: 
- eventBus, 将一个公共的Vue实例作为媒介, 按需引用或者挂载到Vue原型上

- Vuex 一个vue项目的状态管理器
``` js
// Vuex
new Vuex.Store({
  getters: {
    // 可以看作计算属性
    count({ state }) {
      return state.count || localStorage.getItem('count')
    }
  }
  // 异步的一些动作, 使用commit方法触发mutation, 使用dispatch触发action
  actions: {
    count({ state, dispatch, getters, commit }, value){
      // ..
      commit('count', value)
    }
  }
  // 用于提交状态值
  mutations: {
    count(state, value) {
      state.count = value
    }
  }
  // 存放状态值
  state: {
    count: 1
  }
})
// 在组件中使用

// 访问
this.$store.state.count
// 修改
this.$store.dispatch('count', 1)
this.$store.commit('count', 1)

```