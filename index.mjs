/*
	要素を監視し、img.srcやbackground-imageの読み込みを終了を検知する。
		img.srcやstyle.backgroundImageがなければ、さらにそれが設定されるまで監視する。
		監視開始後のstyle要素による後付けの selector{background-image: url();} には非対応。

		その他
			validationはここで済ませる。

		引数
			1: element
			2: op, regexp
				lazyload用。
				一致するsrc, url()になるまで監視してから読み込みを待つ。
				default: /.?/
		返り値
			promise
				引数1のelementを引数に解决する。
*/
function awaitImageLoaded(element, re=/.?/){
	if( !(element instanceof HTMLElement) ){
		throw new TypeError(`Invalid arguments[0]: ${element}`);
	}else if( !(re instanceof RegExp) ){
		throw new TypeError(`Invalid arguments[1]: ${re}`);
	}

	return element.tagName==='IMG' ?
		imgLoaded(element, re):
		backgroundImageLoaded(element, re);
}


/*
	img.srcの読み込み検知

		引数
			1: img要素
			2: regexp
				読み込み検知の対象とするsrc属性値と一致する正規表現。
		返り値
			promise
				img要素を引数に解决する。
*/
async function imgLoaded(img, re){
	// srcがスカか、非対象URLなら対象URLになるまで監視する
	if( !img.src || !re.test(img.src) ){
		await watchAttributeP(img, 'src', (value)=>{
			return re.test(value);
		});
	}

	// 既に読み込みが終わっていれば成功チェック
	if( img.complete ){
		const hasImage = !!(img.naturalWidth && img.naturalHeight);
		if( hasImage ){
			return img;
		}else{
			throw new Error(`load failed: ${img.src}`);
		}
	}

	return new Promise( (res, rej)=>{
		img.addEventListener('load', (e)=>{
			res(img);
		}, {once: true});
		img.addEventListener('error', (e)=>{
			rej(e);
		}, {once: true});
	});
}


/*
	background-imageの読込み検知
		リフローが発生するから注意。

		引数
			1: element
			2: regexp
				読み込み検知の対象とするurl(value)と一致するもの。
		返り値
			promise
				引数1の要素を引数に解决する。
*/
async function backgroundImageLoaded(element, re){
	const str_backgroundImage = window.getComputedStyle(element)['background-image'];
	let str_imageURL = getBackgroundImageURL(str_backgroundImage) || '';

	// スカ or、非対象urlなら、対象url()になるまで監視する
	if( !str_imageURL || !re.test(str_imageURL) ){
		const {value} = await watchAttributeP(element, 'style', ({backgroundImage})=>{
			const imageURL = getBackgroundImageURL(backgroundImage);
			return imageURL && re.test(str_imageURL) && imageURL;
		});
		str_imageURL = value;
	}

	const img = document.createElement('img');
	return new Promise( (res, rej)=>{
		img.addEventListener('load', (e)=>{
			res(element);
		}, {once: true});
		img.addEventListener('error', (e)=>{
			rej(e);
		}, {once: true});
		img.src = str_imageURL;
	});
}


/*
	background-imageの値がスカではないか
		alsyなもの, 空文字, "none"だとスカ扱い。

		引数
			1: string
				element.style.backgroundImageの値。
		返り値
			boolean
*/
function hasBackgroundImageValue(str){
	return typeof str==='string' && !!str && str!=='none';
}


/*
	background-Imageの値から画像pathを得る
		引数
			1: string
				element.style.backgroundImageの値。
		返り値
			string or null
*/
function getBackgroundImageURL(str){
	if( !hasBackgroundImageValue(str) ){
		return null;
	}
	const result = str.match(/^(url\(")(.+)("\))$/);
	return result && result[2];
}


/*
	要素の属性を監視
		MurationObserverに要素単位の監視解除APIがないため使い捨て形式。

		引数
			1： element
				属性の変化を監視する要素
			2: string
				変化を監視する属性名
			3: function
				引数1の要素をthis、変化後の新しい値を引数に、属性の変化時に呼び出される。
				truthyな値を返すと監視を終了する。
			4: function
				引数1の要素をthis、引数3のfunctionの最後の返り値を引数に、監視の終了時に実行される。
*/
function watchAttribute(element, attrName, onChange, callback){
	const mo = new MutationObserver( ([mr], mo)=>{
		const element = mr.target;
		const newValue = element[mr.attributeName];
		const result = onChange.call(element, newValue);
		if( result ){
			mo.disconnect();
			callback.call(element, result);
		}
	});
	mo.observe(element, {
	    attributes: true,
	    attributeFilter: [attrName]
	});
}


/*
	watchAttributeのPromise版

		引数
			watchAttributeの1-3と同じ。
		返り値
			promise
				以下のオブジェクトを引数に、監視の終了時に解决する。
				object {
					target: element, 監視している要素
					name: string, 監視している属性名
					value: any, 変更後の属性値
				}
*/
function watchAttributeP(element, attrName, callback){
	return new Promise( (resolve, reject)=>{
		watchAttribute(element, attrName, callback, (result)=>{
			resolve({
				target: element,
				name: attrName,
				value: result
			});
		});
	});
}

export default awaitImageLoaded;
