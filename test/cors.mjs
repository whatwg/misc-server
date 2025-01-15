import assert from 'assert';

const CORS_TESTS = [
  // not an exhaustive list of domains, just enough to catch accidental removal
  'https://dom.spec.whatwg.org/',
  'https://html.spec.whatwg.org/',
  'https://resources.whatwg.org/',
  'https://whatwg.org/',
];

const NO_CORS_TESTS = [
  // domains for which it's probably a mistake to have CORS headers
  'https://blog.whatwg.org/',
  'https://participate.whatwg.org/',
  'https://wiki.whatwg.org/',
];

function test(url, expected) {
  specify(url, async function() {
    // redirecting is a failure since we might then test the wrong server
    const response = await fetch(url, { redirect: 'manual' });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.headers.get('access-control-allow-origin'), expected);
  });
}

describe('access-control-allow-origin header', function() {
  describe('URLs with header', function() {
    for (const url of CORS_TESTS) {
      test(url, '*');
    }
  });
  describe('URLs without header', function() {
    for (const url of NO_CORS_TESTS) {
      test(url, null);
    }
  });
});
