import assert from 'assert';

const TEST_DATA = [
  // not an exhaustive list, just enough to catch accidental removal
  ['whatwg.org', 'nosniff', null],
  ['blog.whatwg.org', 'nosniff', 'sameorigin'],
  ['dom.spec.whatwg.org', 'nosniff', null],
  ['participate.whatwg.org', 'nosniff', 'deny'],
  ['resources.whatwg.org', 'nosniff', null],
  ['spec.whatwg.org', 'nosniff', null],
  ['wiki.whatwg.org', 'nosniff', 'sameorigin'],
];

describe('x-* headers', function() {
  for (const [hostname, cto, xfo] of TEST_DATA) {
    specify(hostname, async function() {
      // redirecting is a failure since we might then test the wrong server
      const response = await fetch(`https://${hostname}/`, { redirect: 'manual' });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('x-content-type-options'), cto);
      assert.strictEqual(response.headers.get('x-frame-options'), xfo);
      // Expect no x-xss-protection header
      assert.strictEqual(response.headers.get('x-xss-protection'), null);
    });
  }
});
