---
title: 说说 computed 和 watch 的区别
categories: 
  - vue
tags: 
  - 原理
sid: kaaneuejjm
date: 2020-05-17 01:58:10
---
两者本质上都是Watcher, 区别在于:
- computed里创建的Watcher, options(Watcher第四个参数)的lazy为true, 其返回值是watcher.value
- watch里创建的Watcher, 带有cb回调(Watcher第三个参数), 其返回值是一个可以移除本次watch的函数
computed关注依赖数据改变后的结果, watch关注依赖数据改变这一行为

### computed相关的实现
``` javascript
const computedWatcherOptions = { lazy: true }

// function initComputed
watchers[key] = new Watcher(
    vm,
    getter || noop,
    noop,
    computedWatcherOptions
)

// defineComputed

sharedPropertyDefinition.get = shouldCache
    ? createComputedGetter(key)
    : createGetterInvoker(userDef)

// ...
function createComputedGetter (key) {
    return function computedGetter () {
        const watcher = this._computedWatchers && this._computedWatchers[key]
        if (watcher) {
        if (watcher.dirty) {
            watcher.evaluate()
        }
        if (Dep.target) {
            watcher.depend()
        }
        return watcher.value
        }
    }
}
```

### watch相关的实现

``` javascript
createWatcher(vm, key, handler[i])

// function createWatcher
return vm.$watch(expOrFn, handler, options)

// vm.$watch
return function unwatchFn () {
    watcher.teardown()
}
```