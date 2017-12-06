
/**
 * スクレイピング用クラス
 * urlを基点にページ遷移をしながらスクレイピングをする処理時の一連の処理を
 * このクラスに隠蔽している
 *
 * @params options url     : 基点URL
 *                 injectJs: ページ毎に追加読み込みを行いJavaScriptライブラリ
 *                 interval: ページ遷移間隔(相手への高負荷を避けるため)
 */
var Zakutohatigau = function Zakutohatigau(options) {
	this.url = options.url;

	const injectJs = [].concat(options.injectJs || []);
	const interval = options.interval || 1000;
	
	this.fns = [];

	const page = _createActions(this.fns, injectJs, interval);
	this.page = page;
};

/**
 * ページロード後に実行する処理を登録する
 */
Zakutohatigau.prototype.entry = function(fn) {
	this.fns.push(fn);
};

/**
 * スクレイピングを開始する
 */
Zakutohatigau.prototype.run = function() {
	this.page.open(this.url);
};

function _createActions(fns, injectJs, interval) {
	var result = {};

	var page = _createWebPage(injectJs);
	
	var id = null;
	page.onCallback = function(data) {
		// ページ読み込み完了毎に登録関数を呼ぶ
		if (data === 'readyStateComplete') {
			if (id) { clearTimeout(id); id = null; }

			// ページ遷移先の処理が書かれていない
			if (fns.length === 0) {
				result['phantomjs'] = 'entry action is not found. (url:' + page.url + ')';
				_onResult(result);
				return;
			}

			try {
				const onNextPage = fns.shift()(result, page);

				if (typeof onNextPage !== 'undefined') {
					if (typeof onNextPage !== 'function') {
						result['phantomjs'] = 'onNextPage is not function. (url:' + page.url + ')';
						_onResult(result);
						return;
					}
					
					// NOTE: ページ遷移毎にインターバルを設けて、なるべく低負荷にする
					setTimeout(function() {
						onNextPage();
						id = setTimeout(function() {
							result['phantomjs'] = 'entry action call was timeout, page transition none?. (url:' + page.url + ')';
							_onResult(result);
						}, 10000);
					}, interval);
				} else if (fns.length > 0) {
					result['phantomjs'] = 'entry action is many. (url:' + page.url + ')';
					_onResult(result);
				} else {
					// ここに来ると正常終了
					_onResult(result);
				}
			} catch (e) { _handleError(e); }
		}
	};
	
	return page;
};

function _createWebPage(injectJs) {
	var page = require('webpage').create();
	
	page.onLoadFinished = function(/*status*/) {
		// ページが読み込み完了されるまで待つ
		function waitComplete() {
			try {
				var readyState = page.evaluate(function() {
					return document.readyState;
				});
				
				if (readyState === 'complete') {
					for (var i = 0, len = injectJs.length; i < len; i++) {
						page.injectJs(injectJs[i]);
					}
					page.evaluate(function() {
						window.callPhantom('readyStateComplete');
					});
				} else {
					// リトライ
					setTimeout(waitComplete, 100);
				}
			} catch (e) { _handleError(e); }
		}

		waitComplete();
	};

	return page;
};


function _onResult(result) {
	console.log(JSON.stringify(result));
	phantom.exit();
}
function _handleError(e) {
	console.log(JSON.stringify(
		{
			error: {
				message: e
			},
		}));
	phantom.exit();
}

exports.Zakutohatigau = Zakutohatigau;
