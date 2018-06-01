# document

いわゆる製作メモ。

## TODO
* style要素による後付けのbackground-image監視
	- setTimeoutでpollingする？


## 構成
* dev.js
	- index.mjsを監視して自動圧縮する。
* index.mjs
	- 本体。

## devDependencies
* chokidar
	- 自動でuglifyする用。
* [uglify-es - npm](https://www.npmjs.com/package/uglify-es)
	- .min.mjs出力用。
