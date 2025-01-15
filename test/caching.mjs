import assert from 'assert';

const CACHE_TESTS = [
  'https://html.spec.whatwg.org/fonts/Essays1743.ttf',
  'https://html.spec.whatwg.org/images/abstract.jpeg',
  'https://html.spec.whatwg.org/images/wolf.jpg',
  'https://images.whatwg.org/abstract.png',
  'https://images.whatwg.org/content-venn.svg',
  'https://images.whatwg.org/logo',
  'https://images.whatwg.org/robots.jpeg',
  'https://resources.whatwg.org/browser-logos/bb.jpg',
  'https://resources.whatwg.org/browser-logos/edge.svg',
  'https://resources.whatwg.org/fonts/SourceSansPro-Regular.woff',
  'https://resources.whatwg.org/fonts/SourceSansPro-Regular.woff2',
  'https://resources.whatwg.org/logo.png',
];

const NO_CACHE_TESTS = [
  'https://html.spec.whatwg.org/multipage/',
  'https://images.whatwg.org/README.txt',
  'https://resources.whatwg.org/standard.css',
];

function test(url, expected) {
  specify(url, async function() {
    // redirecting is a failure since we might then test the wrong server
    const response = await fetch(url, { redirect: 'manual' });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.headers.get('cache-control'), expected);
  });
}

describe('caching', function() {
  describe('URLs with cache-control header', function() {
    for (const url of CACHE_TESTS) {
      test(url, 'max-age=604800'); // 7 days
    }
  });
  describe('URLs without cache-control', function() {
    for (const url of NO_CACHE_TESTS) {
      test(url, null);
    }
  });
});
