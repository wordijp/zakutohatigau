# zakugohatigau

PhantomJS用を利用してのスクレイピング時に雑多なコードを隠蔽するラッパーライブラリ。

## usage

```js
// example/google.js
const Dom = require('../zakutohatigau').Zakutohatigau;

const dom = new Dom({
  url: 'http://google.co.jp',
  interval: 1000,
});

dom.entry(function (jsonobj, page) {
  var title = page.evaluate(function() {
    return document.querySelector('title').textContent;
  });

  jsonobj['title'] = title;
});

dom.run();

```

```
$ phantomjs example/google.js
{"title":"Google"}
```
