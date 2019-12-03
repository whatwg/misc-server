'use strict';

const assert = require('assert');
const fetch = require('node-fetch');

const TEST_DATA = [
  // not an exhaustive list, just enough to catch accidental removal
  ['whatwg.org', 'nosniff', null, '1; mode=block'],
  ['blog.whatwg.org', 'nosniff', 'sameorigin', '1; mode=block'],
  ['dom.spec.whatwg.org', 'nosniff', null, '1; mode=block'],
  ['participate.whatwg.org', 'nosniff', 'deny', '1; mode=block'],
  ['resources.whatwg.org', 'nosniff', null, '1; mode=block'],
  ['spec.whatwg.org', 'nosniff', null, '1; mode=block'],
  // FIXME: don't send double x-content-type-options headers
  ['wiki.whatwg.org', 'nosniff, nosniff', 'sameorigin', '1; mode=block'],
];

describe('x-* headers', function() {
  for (const [hostname, cto, xfo, xss] of TEST_DATA) {
    specify(hostname, async function() {
      // redirecting is a failure since we might then test the wrong server
      const response = await fetch(`https://${hostname}/`, { redirect: 'manual' });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('x-content-type-options'), cto);
      assert.strictEqual(response.headers.get('x-frame-options'), xfo);
      assert.strictEqual(response.headers.get('x-xss-protection'), xss);
    });
  }
});
