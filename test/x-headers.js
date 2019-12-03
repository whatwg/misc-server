'use strict';

const assert = require('assert');
const fetch = require('node-fetch');

const TEST_DATA = [
  // not an exhaustive list, just enough to catch accidental removal
  ['whatwg.org', 'nosniff', null, '1; mode=block'],
  // FIXME: blog.whatwg.org should use x-frame-options deny
  // https://github.com/whatwg/misc-server/issues/108
  ['blog.whatwg.org', 'nosniff', null, '1; mode=block'],
  ['dom.spec.whatwg.org', 'nosniff', null, '1; mode=block'],
  ['participate.whatwg.org', 'nosniff', 'deny', '1; mode=block'],
  ['resources.whatwg.org', 'nosniff', null, '1; mode=block'],
  ['spec.whatwg.org', 'nosniff', null, '1; mode=block'],
  // FIXME: wiki.whatwg.org should use x-frame-options, and shouldn't send
  // double x-content-type-options headers
  // https://github.com/whatwg/misc-server/issues/108
  ['wiki.whatwg.org', 'nosniff, nosniff', null, '1; mode=block'],
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
