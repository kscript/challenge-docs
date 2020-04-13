/// <reference path='./index.d.ts' />
import build from './build'
build({
  plugins: [
    ['./plugins/preset', {
      edit: false
    }],
    './plugins/base'
  ]
})