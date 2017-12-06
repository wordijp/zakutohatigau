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
