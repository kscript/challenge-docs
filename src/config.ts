export default {
  "input": "./public/",
  "output": "./dist/",
  "local_dir": "dist",
  "tagsNum": 5,
  "page": {
    "size": 10
  },
  "sort": {
    "key": "birthtimeMs",
    "manual": true,
    "desc": true
  },
  "loaders": [
    [
      "./loaders/preset",
      {
        "edit": false
      }
    ],
    "./loaders/base"
  ]
}