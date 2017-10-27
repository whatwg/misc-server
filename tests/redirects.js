'use strict';

const fetch = require('node-fetch');

// The following TODOs should all be resolved by
// https://github.com/whatwg/misc-server/issues/7.

// arrays of [url to fetch, HTTP status, location header, keep /foo?]
const TEST_DATA = [
  // http -> https redirects
  ['http://blog.whatwg.org/', 301, 'https://blog.whatwg.org/', 'keep'],
  ['http://books.idea.whatwg.org/', 301, 'https://books.idea.whatwg.org/', 'keep'],
  ['http://books.spec.whatwg.org/', 301, 'https://books.spec.whatwg.org/', 'keep'],
  // build.whatwg.org isn't avilable over HTTP
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
  ['http://html.spec.whatwg.org/foo', 404], // TODO
  ['http://idea.whatwg.org/', 301, 'https://idea.whatwg.org/', 'keep'],
  ['http://images.whatwg.org/', 301, 'https://images.whatwg.org/', 'keep'],
  ['http://infra.spec.whatwg.org/', 301, 'https://infra.spec.whatwg.org/', 'keep'],
  ['http://javascript.spec.whatwg.org/', 301, 'https://javascript.spec.whatwg.org/', 'keep'],
  ['http://lists.whatwg.org/', 302, 'http://lists.whatwg.org/listinfo.cgi'], // TODO
  ['http://mediasession.spec.whatwg.org/', 301, 'https://mediasession.spec.whatwg.org/', 'keep'],
  ['http://mimesniff.spec.whatwg.org/', 301, 'https://mimesniff.spec.whatwg.org/', 'keep'],
  ['http://n.whatwg.org/', 301, 'https://n.whatwg.org/', 'keep'],
  ['http://notifications.spec.whatwg.org/', 301, 'https://notifications.spec.whatwg.org/', 'keep'],
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
  ['http://whatwg.org/', 301, 'http://www.whatwg.org/', 'keep'], // TODO
  ['http://wiki.whatwg.org/', 302, 'https://wiki.whatwg.org/', 'keep'],
  ['http://www.whatwg.org/foo', 404], // TODO
  ['http://xhr.spec.whatwg.org/', 301, 'https://xhr.spec.whatwg.org/', 'keep'],
  ['http://xn--7ca.whatwg.org/', 301, 'https://xn--7ca.whatwg.org/', 'keep'],
  // https -> https redirects (the interesting ones)
  ['https://books.spec.whatwg.org/', 302, 'https://books.idea.whatwg.org/', 'keep'],
  ['https://c.whatwg.org/', 301, 'https://html.spec.whatwg.org/', 'keep'],
  ['https://developer.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', 'keep'],
  ['https://developers.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', 'keep'],
  ['https://domparsing.spec.whatwg.org/', 302, 'https://w3c.github.io/DOM-Parsing/', 'drop'],
  ['https://figures.spec.whatwg.org/', 302, 'https://figures.idea.whatwg.org/', 'keep'],
  ['https://forums.whatwg.org/', 301, 'https://forums.whatwg.org/bb3/index.php'],
  ['https://help.whatwg.org/', 301, 'https://html.spec.whatwg.org/dev/', 'drop'],
  ['https://javascript.spec.whatwg.org/', 302, 'https://github.com/tc39/ecma262/labels/web%20reality', 'drop'],
  ['https://mediasession.spec.whatwg.org/', 302, 'https://wicg.github.io/mediasession/', 'drop'],
  ['https://specs.whatwg.org/', 301, 'https://spec.whatwg.org/', 'drop'],
  ['https://svn.whatwg.org/', 301, 'https://github.com/whatwg', 'drop'],
  ['https://validator.whatwg.org/', 301, 'https://whatwg.org/validator/', 'keep'],
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
  ['https://whatwg.org/demos/offline/clock/', 301, 'https://html.spec.whatwg.org/demos/offline/clock/', 'keep'],
  ['https://whatwg.org/demos/offline/clock/live-demo/', 301, 'https://html.spec.whatwg.org/demos/offline/clock/', 'keep'],
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
  ['https://whatwg.org/google2569a0eb653e4cf1.html', 301, 'https://whatwg.org/'],
  ['https://whatwg.org/html', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/html5', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/images', 301, 'https://images.whatwg.org/'],
  ['https://whatwg.org/images/', 301, 'https://images.whatwg.org/', 'keep'],
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
  ['https://whatwg.org/specs/html5', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/specs/url/current-work', 301, 'https://url.spec.whatwg.org/', 'keep'],
  ['https://whatwg.org/specs/vocabs', 301, 'https://html.spec.whatwg.org/multipage/microdata.html'], // TODO: 'drop'
  ['https://whatwg.org/specs/web-apps/current-work/', 301, 'https://html.spec.whatwg.org/', 'keep'],
  ['https://whatwg.org/specs/web-apps/current-work/complete.html', 301, 'https://html.spec.whatwg.org/'],
  ['https://whatwg.org/specs/web-apps/current-work/complete/', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/specs/web-apps/current-work/html-a4.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html-letter.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html5-a4.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/html5-letter.pdf', 301, 'https://html.spec.whatwg.org/print.pdf'],
  ['https://whatwg.org/specs/web-apps/current-work/webrtc.html', 301, 'https://w3c.github.io/webrtc-pc/'],
  ['https://whatwg.org/specs/web-apps/current-work/websrt.html', 301, 'https://w3c.github.io/webvtt/'],
  ['https://whatwg.org/specs/web-apps/current-work/webvtt.html', 301, 'https://w3c.github.io/webvtt/'],
  ['https://whatwg.org/specs/web-apps/html5', 301, 'https://html.spec.whatwg.org/multipage/', 'keep'],
  ['https://whatwg.org/specs/web-forms/tests', 301, 'https://github.com/w3c/web-platform-tests'], // TODO: 'drop'
  ['https://whatwg.org/specs/web-workers/current-work/index', 301, 'https://html.spec.whatwg.org/multipage/workers.html'],
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

function appendFoo(url) {
  if (url.endsWith('/')) {
    return url + 'foo';
  }
  return url + '/foo';
}

async function test() {
  const tests = [];
  for (const [url, status, location, trailing] of TEST_DATA) {
    tests.push([url, status, location || null])
    if (trailing !== undefined) {
      console.assert(trailing === 'keep' || trailing === 'drop')
      tests.push([appendFoo(url), status,
                  trailing === 'keep' ? appendFoo(location) : location]);
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
