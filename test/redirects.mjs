import assert from 'assert';

// arrays of [url to fetch, HTTP status, location header, keep /foo?]

const HTTP_TESTS = [
  // http -> https redirects
  ['http://blog.whatwg.org/', 301, 'https://blog.whatwg.org/', 'keep'],
  ['http://books.idea.whatwg.org/', 301, 'https://books.idea.whatwg.org/', 'keep'],
  ['http://books.spec.whatwg.org/', 301, 'https://books.spec.whatwg.org/', 'keep'],
  ['http://c.whatwg.org/', 301, 'https://c.whatwg.org/', 'keep'],
  ['http://compat.spec.whatwg.org/', 301, 'https://compat.spec.whatwg.org/', 'keep'],
  ['http://console.spec.whatwg.org/', 301, 'https://console.spec.whatwg.org/', 'keep'],
  ['http://developer.whatwg.org/', 301, 'https://developer.whatwg.org/', 'keep'],
  ['http://developers.whatwg.org/', 301, 'https://developers.whatwg.org/', 'keep'],
  ['http://dom.spec.whatwg.org/', 301, 'https://dom.spec.whatwg.org/', 'keep'],
  ['http://domparsing.spec.whatwg.org/', 301, 'https://domparsing.spec.whatwg.org/', 'keep'],
  ['http://encoding.spec.whatwg.org/', 301, 'https://encoding.spec.whatwg.org/', 'keep'],
  ['http://fetch.spec.whatwg.org/', 301, 'https://fetch.spec.whatwg.org/', 'keep'],
  ['http://figures.idea.whatwg.org/', 301, 'https://figures.idea.whatwg.org/', 'keep'],
  ['http://figures.spec.whatwg.org/', 301, 'https://figures.spec.whatwg.org/', 'keep'],
  ['http://forums.whatwg.org/', 301, 'https://forums.whatwg.org/', 'keep'],
  ['http://fullscreen.spec.whatwg.org/', 301, 'https://fullscreen.spec.whatwg.org/', 'keep'],
  ['http://help.whatwg.org/', 301, 'https://help.whatwg.org/', 'keep'],
  ['http://html-differences.whatwg.org/', 301, 'https://html-differences.whatwg.org/', 'keep'],
  ['http://html.spec.whatwg.org/', 301, 'https://html.spec.whatwg.org/', 'keep'],
  ['http://idea.whatwg.org/', 301, 'https://idea.whatwg.org/', 'keep'],
  ['http://images.whatwg.org/', 301, 'https://images.whatwg.org/', 'keep'],
  ['http://infra.spec.whatwg.org/', 301, 'https://infra.spec.whatwg.org/', 'keep'],
  ['http://javascript.spec.whatwg.org/', 301, 'https://javascript.spec.whatwg.org/', 'keep'],
  ['http://lists.whatwg.org/', 301, 'https://lists.whatwg.org/', 'keep'],
  ['http://mediasession.spec.whatwg.org/', 301, 'https://mediasession.spec.whatwg.org/', 'keep'],
  ['http://mimesniff.spec.whatwg.org/', 301, 'https://mimesniff.spec.whatwg.org/', 'keep'],
  ['http://n.whatwg.org/', 301, 'https://n.whatwg.org/', 'keep'],
  ['http://notifications.spec.whatwg.org/', 301, 'https://notifications.spec.whatwg.org/', 'keep'],
  ['http://participate.whatwg.org/', 301, 'https://participate.whatwg.org/', 'keep'],
  ['http://quirks.spec.whatwg.org/', 301, 'https://quirks.spec.whatwg.org/', 'keep'],
  ['http://resources.whatwg.org/', 301, 'https://resources.whatwg.org/', 'keep'],
  ['http://spec.whatwg.org/', 301, 'https://spec.whatwg.org/', 'keep'],
  ['http://specs.whatwg.org/', 301, 'https://specs.whatwg.org/', 'keep'],
  ['http://storage.spec.whatwg.org/', 301, 'https://storage.spec.whatwg.org/', 'keep'],
  ['http://streams.spec.whatwg.org/', 301, 'https://streams.spec.whatwg.org/', 'keep'],
  ['http://svn.whatwg.org/', 301, 'https://svn.whatwg.org/', 'keep'],
  ['http://url.spec.whatwg.org/', 301, 'https://url.spec.whatwg.org/', 'keep'],
  ['http://validator.whatwg.org/', 301, 'https://validator.whatwg.org/', 'keep'],
  ['http://webvtt.spec.whatwg.org/', 301, 'https://webvtt.spec.whatwg.org/', 'keep'],
  ['http://whatwg.org/', 301, 'https://whatwg.org/', 'keep'],
  ['http://whatwg.org/c', 301, 'https://whatwg.org/c', 'keep'],
  ['http://wiki.whatwg.org/', 301, 'https://wiki.whatwg.org/', 'keep'],
  ['http://www.whatwg.org/', 301, 'https://www.whatwg.org/', 'keep'],
  ['http://xhr.spec.whatwg.org/', 301, 'https://xhr.spec.whatwg.org/', 'keep'],
  ['http://xn--7ca.whatwg.org/', 301, 'https://xn--7ca.whatwg.org/', 'keep'],
];

const HTTPS_TESTS = [
  ['https://books.spec.whatwg.org/', 302, 'https://books.idea.whatwg.org/', 'keep'],
  ['https://c.whatwg.org/', 301, 'https://html.spec.whatwg.org/', 'keep'],
  ['https://developer.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', 'keep'],
  ['https://developers.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', 'keep'],
  ['https://domparsing.spec.whatwg.org/', 302, 'https://w3c.github.io/DOM-Parsing/', 'drop'],
  ['https://encoding.spec.whatwg.org/index-gbk.txt', 410],
  ['https://figures.spec.whatwg.org/', 302, 'https://figures.idea.whatwg.org/', 'keep'],
  ['https://forums.whatwg.org/', 301, 'https://forums.whatwg.org/bb3/'],
  ['https://forums.whatwg.org/bb3/viewtopic.php?f=3&p=8538&sid=1cb9e434c59258d940d476648b0301df', 301, 'https://forums.whatwg.org/bb3/viewtopic.php?f=3&p=8538'],
  ['https://help.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', 'drop'],
  ['https://html-differences.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', 'drop'],
  ['https://html.spec.whatwg.org/C', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://html.spec.whatwg.org/complete', 301, 'https://html.spec.whatwg.org/', 'keep'],
  ['https://html.spec.whatwg.org/complete.html', 301, 'https://html.spec.whatwg.org/'],
  ['https://html.spec.whatwg.org/demos/offline/clock/clock.html', 301, 'https://html.spec.whatwg.org/demos/offline/clock/clock2.html'],
  ['https://html.spec.whatwg.org/demos/workers/stocks/', 301, 'https://github.com/whatwg/html/tree/1332efd5e4c27ae859bf2316c6b477d77cf93716/demos/workers/stocks/', 'keep'],
  ['https://html.spec.whatwg.org/images/content-venn.png', 301, 'https://html.spec.whatwg.org/images/content-venn.svg'],
  ['https://html.spec.whatwg.org/images/contextmenu-collapsed.png', 410],
  ['https://html.spec.whatwg.org/images/contextmenu-expanded.png', 410],
  ['https://html.spec.whatwg.org/images/parsing-model-overview.png', 301, 'https://html.spec.whatwg.org/images/parsing-model-overview.svg'],
  ['https://html.spec.whatwg.org/images/sample-email-1.png', 301, 'https://html.spec.whatwg.org/images/sample-email-1.svg'],
  ['https://html.spec.whatwg.org/images/sample-email-2.png', 301, 'https://html.spec.whatwg.org/images/sample-email-2.svg'],
  ['https://html.spec.whatwg.org/images/sample-url.png', 301, 'https://html.spec.whatwg.org/images/sample-url.svg'],
  ['https://html.spec.whatwg.org/index', 301, 'https://html.spec.whatwg.org/'],
  ['https://html.spec.whatwg.org/multipage/embedded-content-0.html', 301, 'https://html.spec.whatwg.org/multipage/embedded-content.html'],
  ['https://html.spec.whatwg.org/multipage/entities.json', 301, 'https://html.spec.whatwg.org/entities.json'],
  ['https://html.spec.whatwg.org/multipage/images/', 301, 'https://html.spec.whatwg.org/images/'],
  ['https://html.spec.whatwg.org/multipage/link-fixup.js', 301, 'https://html.spec.whatwg.org/link-fixup.js'],
  ['https://html.spec.whatwg.org/multipage/scripting-1.html', 301, 'https://html.spec.whatwg.org/multipage/scripting.html'],
  ['https://html.spec.whatwg.org/multipage/section-sql.html', 410],
  ['https://html.spec.whatwg.org/multipage/tabular-data.html', 301, 'https://html.spec.whatwg.org/multipage/tables.html'],
  ['https://html.spec.whatwg.org/multipage/websockets', 301, 'https://websockets.spec.whatwg.org/', 'keep'],
  ['https://javascript.spec.whatwg.org/', 302, 'https://github.com/tc39/ecma262/labels/web%20reality', 'drop'],
  ['https://lists.whatwg.org/htdig.cgi', 301, 'https://lists.whatwg.org/pipermail/', 'keep'],
  ['https://lists.whatwg.org/listinfo.cgi', 301, 'https://lists.whatwg.org/'],
  ['https://mediasession.spec.whatwg.org/', 302, 'https://w3c.github.io/mediasession/', 'drop'],
  ['https://resources.whatwg.org/logo-mime.png', 301, 'https://resources.whatwg.org/logo-mimesniff.png'],
  ['https://resources.whatwg.org/logo-mime.svg', 301, 'https://resources.whatwg.org/logo-mimesniff.svg'],
  ['https://specs.whatwg.org/', 301, 'https://spec.whatwg.org/', 'drop'],
  ['https://svn.whatwg.org/', 301, 'https://github.com/whatwg', 'drop'],
  ['https://url.spec.whatwg.org/interop/', 410],
  ['https://url.spec.whatwg.org/reference-implementation/', 410],
  ['https://url.spec.whatwg.org/reference-implementation/liveview.html', 301, 'https://quuz.org/url/liveview.html'],
  ['https://url.spec.whatwg.org/reference-implementation/liveview2.html', 301, 'https://quuz.org/url/liveview2.html'],
  ['https://url.spec.whatwg.org/reference-implementation/liveview3.html', 301, 'https://quuz.org/url/liveview3.html'],
  ['https://url.spec.whatwg.org/reference-implementation/uri-validate.html', 301, 'https://quuz.org/url/uri-validate.html'],
  ['https://validator.whatwg.org/', 301, 'https://whatwg.org/validator/', 'keep'],
  ['https://websocket.spec.whatwg.org/', 301, 'https://websockets.spec.whatwg.org/', 'keep'],
  ['https://webvtt.spec.whatwg.org/', 302, 'https://w3c.github.io/webvtt/', 'keep'],
  ['https://whatwg.org/C', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/HTML', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/HTML5', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/c', 301, 'https://html.spec.whatwg.org/', 'keep'],
  ['https://whatwg.org/charter.pl', 410],
  ['https://whatwg.org/cors', 301, 'https://fetch.spec.whatwg.org/'],
  ['https://whatwg.org/current-work', 301, 'https://spec.whatwg.org/', 'keep'],
  ['https://whatwg.org/d', 301, 'https://dom.spec.whatwg.org/'],
  ['https://whatwg.org/demos/canvas/', 301, 'https://html.spec.whatwg.org/demos/canvas/', 'keep'],
  ['https://whatwg.org/demos/date-01/', 301, 'https://github.com/whatwg/whatwg.org/tree/417c7bf7a19375c4fbf4a68146153a6baeadecdb/demos/date-01/', 'keep'],
  ['https://whatwg.org/demos/multiform-01/', 301, 'https://github.com/whatwg/whatwg.org/tree/417c7bf7a19375c4fbf4a68146153a6baeadecdb/demos/multiform-01/', 'keep'],
  ['https://whatwg.org/demos/offline/clock/', 301, 'https://html.spec.whatwg.org/demos/offline/clock/', 'keep'],
  ['https://whatwg.org/demos/offline/clock/live-demo/', 301, 'https://html.spec.whatwg.org/demos/offline/clock/', 'keep'],
  ['https://whatwg.org/demos/repeat-01/', 301, 'https://github.com/whatwg/whatwg.org/tree/417c7bf7a19375c4fbf4a68146153a6baeadecdb/demos/repeat-01/', 'keep'],
  ['https://whatwg.org/demos/workers/', 301, 'https://html.spec.whatwg.org/demos/workers/', 'keep'],
  ['https://whatwg.org/dom', 301, 'https://dom.spec.whatwg.org/'],
  ['https://whatwg.org/domparsing', 301, 'https://domparsing.spec.whatwg.org/'],
  ['https://whatwg.org/dp', 301, 'https://domparsing.spec.whatwg.org/'],
  ['https://whatwg.org/e', 301, 'https://encoding.spec.whatwg.org/'],
  ['https://whatwg.org/encoding', 301, 'https://encoding.spec.whatwg.org/'],
  ['https://whatwg.org/f', 301, 'https://fullscreen.spec.whatwg.org/'],
  ['https://whatwg.org/fetch', 301, 'https://fetch.spec.whatwg.org/'],
  ['https://whatwg.org/fs', 301, 'https://fullscreen.spec.whatwg.org/'],
  ['https://whatwg.org/fullscreen', 301, 'https://fullscreen.spec.whatwg.org/'],
  ['https://whatwg.org/html', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/html5', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/images', 302, 'https://images.whatwg.org/'],
  ['https://whatwg.org/images/', 302, 'https://images.whatwg.org/', 'keep'],
  ['https://whatwg.org/issues', 410],
  ['https://whatwg.org/j', 301, 'https://javascript.spec.whatwg.org/'],
  ['https://whatwg.org/javascript', 301, 'https://javascript.spec.whatwg.org/'],
  ['https://whatwg.org/js', 301, 'https://javascript.spec.whatwg.org/'],
  ['https://whatwg.org/link-fixup.js', 301, 'https://html.spec.whatwg.org/multipage/link-fixup.js'],
  ['https://whatwg.org/m', 301, 'https://mimesniff.spec.whatwg.org/'],
  ['https://whatwg.org/mailing-list)', 301, 'https://whatwg.org/mailing-list'],
  ['https://whatwg.org/mailing-list', 301, 'https://lists.whatwg.org/'],
  ['https://whatwg.org/mailing-list.pl', 410],
  ['https://whatwg.org/mimesniff', 301, 'https://mimesniff.spec.whatwg.org/'],
  ['https://whatwg.org/n', 301, 'https://notifications.spec.whatwg.org/'],
  ['https://whatwg.org/newbug', 302, 'https://github.com/whatwg/html/issues/new/choose'],
  ['https://whatwg.org/notifications', 301, 'https://notifications.spec.whatwg.org/'],
  ['https://whatwg.org/pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/position-paper', 301, 'https://www.w3.org/2004/04/webapps-cdf-ws/papers/opera.html'],
  ['https://whatwg.org/q', 301, 'https://quirks.spec.whatwg.org/'],
  ['https://whatwg.org/quirks', 301, 'https://quirks.spec.whatwg.org/'],
  ['https://whatwg.org/specs', 301, 'https://spec.whatwg.org/'],
  ['https://whatwg.org/specs/', 301, 'https://spec.whatwg.org/'],
  ['https://whatwg.org/specs/foo', 404, null],
  ['https://whatwg.org/specs/html5', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/specs/url/current-work', 301, 'https://url.spec.whatwg.org/', 'keep'],
  ['https://whatwg.org/specs/vocabs', 301, 'https://html.spec.whatwg.org/multipage/microdata.html', 'drop'],
  ['https://whatwg.org/specs/web-apps/2007-10-26/multipage/images/', 301, 'https://whatwg.org/specs/web-apps/2007-10-26/images/', 'keep'],
  ['https://whatwg.org/specs/web-apps/current-work', 301, 'https://html.spec.whatwg.org/'],
  ['https://whatwg.org/specs/web-apps/current-work/', 301, 'https://html.spec.whatwg.org/', 'keep'],
  ['https://whatwg.org/specs/web-apps/current-work/complete.html', 301, 'https://html.spec.whatwg.org/'],
  ['https://whatwg.org/specs/web-apps/current-work/complete/', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/specs/web-apps/current-work/html-a4.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html-letter.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html5-a4.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html5-letter.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/multipage/', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/specs/web-apps/current-work/webrtc.html', 301, 'https://w3c.github.io/webrtc-pc/'],
  ['https://whatwg.org/specs/web-apps/current-work/websrt.html', 301, 'https://w3c.github.io/webvtt/'],
  ['https://whatwg.org/specs/web-apps/current-work/webvtt.html', 301, 'https://w3c.github.io/webvtt/'],
  ['https://whatwg.org/specs/web-apps/html5', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/specs/web-forms/tests', 301, 'https://github.com/w3c/web-platform-tests', 'drop'],
  ['https://whatwg.org/specs/web-socket-protocol', 301, 'https://tools.ietf.org/html/rfc6455', 'drop'],
  ['https://whatwg.org/specs/web-workers/current-work/', 301, 'https://html.spec.whatwg.org/multipage/workers.html'],
  ['https://whatwg.org/u', 301, 'https://url.spec.whatwg.org/'],
  ['https://whatwg.org/url', 301, 'https://url.spec.whatwg.org/'],
  ['https://whatwg.org/wf2', 301, 'https://html.spec.whatwg.org/multipage/#forms'],
  ['https://whatwg.org/ws', 301, 'https://html.spec.whatwg.org/multipage/#network'],
  ['https://whatwg.org/ww', 301, 'https://html.spec.whatwg.org/multipage/#workers'],
  ['https://whatwg.org/x', 301, 'https://xhr.spec.whatwg.org/'],
  ['https://whatwg.org/xhr', 301, 'https://xhr.spec.whatwg.org/'],
  ['https://www.whatwg.org/', 301, 'https://whatwg.org/', 'keep'],
  ['https://xn--7ca.whatwg.org/', 301, 'https://html.spec.whatwg.org/', 'keep'],
];

function test(url, status, location) {
  specify(url, async function() {
    const response = await fetch(url, { redirect: 'manual' });
    assert.strictEqual(response.status, status);
    assert.strictEqual(response.headers.get('location'), location);
  });
}

function appendFoo(url) {
  if (url.endsWith('/')) {
    return url + 'foo';
  }
  return url + '/foo';
}

function generateTests([url, status, location, trailing]) {
  test(url, status, location || null);
  if (trailing !== undefined) {
    assert(trailing === 'keep' || trailing === 'drop');
    test(appendFoo(url), status,
         trailing === 'keep' ? appendFoo(location) : location);
  }
}

describe('redirects', function() {
  describe('HTTP (to HTTPS)', function() {
    HTTP_TESTS.map(generateTests);
  });

  describe('HTTPS (the good stuff)', function() {
    HTTPS_TESTS.map(generateTests);
  });
});
