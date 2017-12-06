const Dom = require('../zakutohatigau').Zakutohatigau;

const dom = new Dom({
  url: 'https://qiita.com/search',
  // サイト側でjQueryを使っていてもぶつからないように、
  // _を先頭に付けて改造したjQueryを追加で読み込ませる
  injectJs: ['./lib/_jquery-3.2.1.min.js'],
  // ページ遷移間隔
  interval: 1000,
});

// Qiitaから「スクレイピング」の単語で検索した結果一覧を収集する

// 検索画面
dom.entry(function (jsonobj, page) {
  jsonobj['here 1'] = 'from search page';

  // 単語セット
  page.evaluate(function() {
    _$('input[id=q]').val('スクレイピング');
  });

  // ページ遷移をする場合は、ページ遷移関数を返す
  return function onNextPage () {
    // 検索開始
    page.evaluate(function() {
      _$("button[type=submit]").click();
    });
  };
});

// 検索結果画面
dom.entry(function (jsonobj, page) {
  jsonobj['here 2'] = 'from result page';

  // 結果一覧を収集
  var list = page.evaluate(function() {
    return _$('.searchResult_itemTitle')
      .find('a[href]')
      .map(function() {
        var $self = _$(this);
        return {
          title: $self.text(),
          href: $self.attr('href'),
        };
      })
      .get();
  });

  jsonobj['list'] = list;
});

dom.run();
