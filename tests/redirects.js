'use strict';

const fetch = require('node-fetch');

// The following TODOs should all be resolved by
// https://github.com/whatwg/misc-server/issues/7.

// arrays of [url to fetch, HTTP status, location header, try /foo?]
const TEST_DATA = [
  // http -> https redirects
  ['http://blog.whatwg.org/', 301, 'https://blog.whatwg.org/', true],
  ['http://books.idea.whatwg.org/', 301, 'https://books.idea.whatwg.org/', true],
  ['http://books.spec.whatwg.org/', 301, 'https://books.spec.whatwg.org/', true],
  // build.whatwg.org isn't avilable over HTTP
  ['http://c.whatwg.org/', 301, 'https://c.whatwg.org/', true],
  ['http://compat.spec.whatwg.org/', 301, 'https://compat.spec.whatwg.org/', true],
  ['http://console.spec.whatwg.org/', 301, 'https://console.spec.whatwg.org/', true],
  ['http://developer.whatwg.org/', 301, 'https://developer.whatwg.org/', true],
  ['http://developers.whatwg.org/', 301, 'https://developers.whatwg.org/', true],
  ['http://dom.spec.whatwg.org/', 301, 'https://dom.spec.whatwg.org/', true],
  ['http://domparsing.spec.whatwg.org/', 301, 'https://domparsing.spec.whatwg.org/', true],
  ['http://encoding.spec.whatwg.org/', 301, 'https://encoding.spec.whatwg.org/', true],
  ['http://fetch.spec.whatwg.org/', 301, 'https://fetch.spec.whatwg.org/', true],
  ['http://figures.idea.whatwg.org/', 301, 'https://figures.idea.whatwg.org/', true],
  ['http://figures.spec.whatwg.org/', 301, 'https://figures.spec.whatwg.org/', true],
  ['http://forums.whatwg.org/', 301, 'https://forums.whatwg.org/', true],
  ['http://fullscreen.spec.whatwg.org/', 301, 'https://fullscreen.spec.whatwg.org/', true],
  ['http://help.whatwg.org/', 301, 'https://help.whatwg.org/', true],
  ['http://html-differences.whatwg.org/', 301, 'https://html-differences.whatwg.org/', true],
  ['http://html.spec.whatwg.org/foo', 404], // TODO
  ['http://idea.whatwg.org/', 301, 'https://idea.whatwg.org/', true],
  ['http://images.whatwg.org/', 301, 'https://images.whatwg.org/', true],
  ['http://infra.spec.whatwg.org/', 301, 'https://infra.spec.whatwg.org/', true],
  ['http://javascript.spec.whatwg.org/', 301, 'https://javascript.spec.whatwg.org/', true],
  ['http://lists.whatwg.org/', 302, 'http://lists.whatwg.org/listinfo.cgi'], // TODO
  ['http://mediasession.spec.whatwg.org/', 301, 'https://mediasession.spec.whatwg.org/', true],
  ['http://mimesniff.spec.whatwg.org/', 301, 'https://mimesniff.spec.whatwg.org/', true],
  ['http://n.whatwg.org/', 301, 'https://n.whatwg.org/', true],
  ['http://notifications.spec.whatwg.org/', 301, 'https://notifications.spec.whatwg.org/', true],
  ['http://quirks.spec.whatwg.org/', 301, 'https://quirks.spec.whatwg.org/', true],
  ['http://resources.whatwg.org/', 301, 'https://resources.whatwg.org/', true],
  ['http://spec.whatwg.org/', 301, 'https://spec.whatwg.org/', true],
  ['http://specs.whatwg.org/', 301, 'https://specs.whatwg.org/', true],
  ['http://storage.spec.whatwg.org/', 301, 'https://storage.spec.whatwg.org/', true],
  ['http://streams.spec.whatwg.org/', 301, 'https://streams.spec.whatwg.org/', true],
  ['http://svn.whatwg.org/', 301, 'https://svn.whatwg.org/', true],
  ['http://url.spec.whatwg.org/', 301, 'https://url.spec.whatwg.org/', true],
  ['http://validator.whatwg.org/', 301, 'https://validator.whatwg.org/', true],
  ['http://webvtt.spec.whatwg.org/', 301, 'https://webvtt.spec.whatwg.org/', true],
  ['http://whatwg.org/', 301, 'http://www.whatwg.org/', true], // TODO
  ['http://wiki.whatwg.org/', 302, 'https://wiki.whatwg.org/', true],
  ['http://www.whatwg.org/foo', 404], // TODO
  ['http://xhr.spec.whatwg.org/', 301, 'https://xhr.spec.whatwg.org/', true],
  ['http://xn--7ca.whatwg.org/', 301, 'https://xn--7ca.whatwg.org/', true],

  // https -> https redirects (the interesting ones)
  ['https://books.spec.whatwg.org/', 302, 'https://books.idea.whatwg.org/', true],
  ['https://c.whatwg.org/', 301, 'https://html.spec.whatwg.org/', true],
  ['https://developer.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', true],
  ['https://developers.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', true],
  ['https://domparsing.spec.whatwg.org/', 302, 'https://w3c.github.io/DOM-Parsing/'],
  ['https://figures.spec.whatwg.org/', 302, 'https://figures.idea.whatwg.org/', true],
  ['https://forums.whatwg.org/', 301, 'https://forums.whatwg.org/bb3/index.php'],
  ['https://help.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/'],
  ['https://javascript.spec.whatwg.org/', 302, 'https://github.com/tc39/ecma262/labels/web%20reality'],
  ['https://mediasession.spec.whatwg.org/', 302, 'https://wicg.github.io/mediasession/'],
  ['https://specs.whatwg.org/', 301, 'https://spec.whatwg.org/'],
  ['https://svn.whatwg.org/', 301, 'https://github.com/whatwg'],
  ['https://validator.whatwg.org/', 301, 'https://whatwg.org/validator/', true],
  ['https://webvtt.spec.whatwg.org/', 302, 'https://w3c.github.io/webvtt/', true],
  ['https://whatwg.org/C', 301, 'https://html.spec.whatwg.org/multipage/'],
  ['https://whatwg.org/HTML', 301, 'https://html.spec.whatwg.org/multipage/'],
  ['https://whatwg.org/HTML5', 301, 'https://html.spec.whatwg.org/multipage/'],
  ['https://whatwg.org/c', 301, 'https://html.spec.whatwg.org/'],
  ['https://whatwg.org/charter.pl', 410],
  ['https://whatwg.org/cors', 301, 'https://fetch.spec.whatwg.org/'],
  ['https://whatwg.org/current-work', 301, 'https://spec.whatwg.org/'],
  ['https://whatwg.org/d', 301, 'https://dom.spec.whatwg.org/'],
  ['https://whatwg.org/demos/canvas/', 301, 'https://html.spec.whatwg.org/demos/canvas/', true],
  ['https://whatwg.org/demos/offline/clock/', 301, 'https://html.spec.whatwg.org/demos/offline/clock/', true],
  ['https://whatwg.org/demos/offline/clock/live-demo/', 301, 'https://html.spec.whatwg.org/demos/offline/clock/', true],
  ['https://whatwg.org/demos/workers/', 301, 'https://html.spec.whatwg.org/demos/workers/', true],
  ['https://whatwg.org/dom', 301, 'https://dom.spec.whatwg.org/'],
  ['https://whatwg.org/domparsing', 301, 'https://domparsing.spec.whatwg.org/'],
  ['https://whatwg.org/dp', 301, 'https://domparsing.spec.whatwg.org/'],
  ['https://whatwg.org/e', 301, 'https://encoding.spec.whatwg.org/'],
  ['https://whatwg.org/encoding', 301, 'https://encoding.spec.whatwg.org/'],
  ['https://whatwg.org/f', 301, 'https://fullscreen.spec.whatwg.org/'],
  ['https://whatwg.org/fetch', 301, 'https://fetch.spec.whatwg.org/'],
  ['https://whatwg.org/fs', 301, 'https://fullscreen.spec.whatwg.org/'],
  ['https://whatwg.org/fullscreen', 301, 'https://fullscreen.spec.whatwg.org/'],
  ['https://whatwg.org/google2569a0eb653e4cf1.html', 301, 'https://whatwg.org/'],
  ['https://whatwg.org/html', 301, 'https://html.spec.whatwg.org/multipage/'],
  ['https://whatwg.org/html5', 301, 'https://html.spec.whatwg.org/multipage/'],
  ['https://whatwg.org/images', 301, 'https://images.whatwg.org/'],
  ['https://whatwg.org/images/', 301, 'https://images.whatwg.org/', true],
  ['https://whatwg.org/issues', 410],
  ['https://whatwg.org/j', 301, 'https://javascript.spec.whatwg.org/'],
  ['https://whatwg.org/javascript', 301, 'https://javascript.spec.whatwg.org/'],
  ['https://whatwg.org/js', 301, 'https://javascript.spec.whatwg.org/'],
  ['https://whatwg.org/link-fixup.js', 301, 'https://html.spec.whatwg.org/multipage/link-fixup.js'],
  ['https://whatwg.org/m', 301, 'https://mimesniff.spec.whatwg.org/'],
  ['https://whatwg.org/mailing-list)', 301, 'https://whatwg.org/mailing-list'],
  ['https://whatwg.org/mailing-list.pl', 410],
  ['https://whatwg.org/mimesniff', 301, 'https://mimesniff.spec.whatwg.org/'],
  ['https://whatwg.org/n', 301, 'https://notifications.spec.whatwg.org/'],
  ['https://whatwg.org/newbug', 302, 'https://github.com/whatwg/html/issues/new'],
  ['https://whatwg.org/notifications', 301, 'https://notifications.spec.whatwg.org/'],
  ['https://whatwg.org/pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/position-paper', 301, 'https://www.w3.org/2004/04/webapps-cdf-ws/papers/opera.html'],
  ['https://whatwg.org/principles', 302, 'https://whatwg.org/position-paper'],
  ['https://whatwg.org/q', 301, 'https://quirks.spec.whatwg.org/'],
  ['https://whatwg.org/quirks', 301, 'https://quirks.spec.whatwg.org/'],
  ['https://whatwg.org/specs', 301, 'https://spec.whatwg.org/'],
  ['https://whatwg.org/specs/', 301, 'https://spec.whatwg.org/'],
  ['https://whatwg.org/specs/foo', 404, null],
  ['https://whatwg.org/specs/html5', 301, 'https://html.spec.whatwg.org/multipage/'],
  ['https://whatwg.org/specs/url/current-work', 301, 'https://url.spec.whatwg.org/'],
  ['https://whatwg.org/specs/vocabs', 301, 'https://html.spec.whatwg.org/multipage/microdata.html'],
  ['https://whatwg.org/specs/web-apps/current-work/', 301, 'https://html.spec.whatwg.org/'],
  ['https://whatwg.org/specs/web-apps/current-work/complete.html', 301, 'https://html.spec.whatwg.org/'],
  ['https://whatwg.org/specs/web-apps/current-work/complete/', 301, 'https://html.spec.whatwg.org/multipage/'],
  ['https://whatwg.org/specs/web-apps/current-work/html-a4.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html-letter.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html5-a4.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html5-letter.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/webrtc.html', 301, 'https://w3c.github.io/webrtc-pc/'],
  ['https://whatwg.org/specs/web-apps/current-work/websrt.html', 301, 'https://w3c.github.io/webvtt/'],
  ['https://whatwg.org/specs/web-apps/current-work/webvtt.html', 301, 'https://w3c.github.io/webvtt/'],
  ['https://whatwg.org/specs/web-apps/html5', 301, 'https://html.spec.whatwg.org/multipage/'],
  ['https://whatwg.org/specs/web-forms/tests', 301, 'https://github.com/w3c/web-platform-tests'],
  ['https://whatwg.org/specs/web-workers/current-work/index', 301, 'https://html.spec.whatwg.org/multipage/workers.html'],
  ['https://whatwg.org/u', 301, 'https://url.spec.whatwg.org/'],
  ['https://whatwg.org/url', 301, 'https://url.spec.whatwg.org/'],
  ['https://whatwg.org/wf2', 301, 'https://html.spec.whatwg.org/multipage/#forms'],
  ['https://whatwg.org/ws', 301, 'https://html.spec.whatwg.org/multipage/#network'],
  ['https://whatwg.org/ww', 301, 'https://html.spec.whatwg.org/multipage/#workers'],
  ['https://whatwg.org/x', 301, 'https://xhr.spec.whatwg.org/'],
  ['https://whatwg.org/xhr', 301, 'https://xhr.spec.whatwg.org/'],
  ['https://www.whatwg.org/', 301, 'https://whatwg.org/', true],
  ['https://xn--7ca.whatwg.org/', 301, 'https://html.spec.whatwg.org/', true],
];

function appendFoo(url) {
  if (url.endsWith('/')) {
    return url + 'foo';
  }
  return url + '/foo';
}

async function test() {
  const tests = [];
  for (const [url, status, location, try_foo] of TEST_DATA) {
    tests.push([url, status, location || null])
    if (try_foo) {
      tests.push([appendFoo(url), status, appendFoo(location)]);
    }
  }

  let ok = true;

  for (const [url, expected_status, expected_location] of tests) {
    const response = await fetch(url, { redirect: 'manual' });

    const actual_status = response.status;
    let actual_location = response.headers.get('location');
    // TODO: remove this workaround when Apache redirect is no longer used
    // anywhere. It can add an extra slash...
    if (url.startsWith('https://whatwg.org/') &&
        actual_location && actual_location.endsWith('//foo')) {
      actual_location = actual_location.replace(/\/\/foo$/, '/foo');
    }

    let msg = 'OK'
    if (actual_status !== expected_status) {
      msg = `FAIL (expected HTTP status ${expected_status}, got ${actual_status})`;
    } else if (actual_location !== expected_location) {
      msg = `FAIL (expected location header ${expected_location}, got ${actual_location})`;
    }

    if (msg !== 'OK') {
      ok = false;
    }

    console.log(url, msg);
  }

  if (!ok) {
    process.exit(1);
  }
}

test();
