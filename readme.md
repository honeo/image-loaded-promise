# image-loaded-promise
* [honeo/image-loaded-promise](https://github.com/honeo/image-loaded-promise)  
* [image-loaded-promise](https://www.npmjs.com/package/image-loaded-promise)


## なにこれ
要素の画像読み込みを待つ。  
Lazy Load対応。


## 使い方
```bash
$ npm i image-loaded-promise
```
```js
import imageLoadedPromise from 'image-loaded-promise';


// img.srcを監視
await imageLoadedPromise(img);

// background-imageを監視
await imageLoadedPromise(div);

// PNG画像がURLに設定されるまで待ってから監視
await imageLoadedPromise(img, /\.png$/);
```



## API

### imageLoadedPromise(element [, regexp])
引数1要素の画像読み込みを監視する。  
読み込み終了時に要素を引数に解决するpromiseを返す。  

* 引数2に正規表現があるとき
	- 要素にそれとmatchする画像URLが設定されるまで待機する。

* 既に要素の画像読込が終了しているとき
	- 即座に解決する。

* 要素にsrc属性やbackground-Imageが未設定なとき
	- 要素に画像URLが設定されるまで待機する。


## 注意
* [MutationObserver - Web API インターフェイス | MDN](https://developer.mozilla.org/ja/docs/Web/API/MutationObserver)を使っている。
	- レガシー環境では要Polyfill.
* 同じような名前の他ライブラリ・モジュールとは一切関係ない。
