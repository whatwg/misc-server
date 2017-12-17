'use strict';

const assert = require('assert');
const fetch = require('node-fetch');

describe('blog', function() {
  // regression test for https://github.com/whatwg/meta/issues/59
  specify('Sunsetting the JavaScript Standard', async function() {
    const response = await fetch('https://blog.whatwg.org/javascript');
    assert.strictEqual(response.status, 200);
    const text = await response.text();
    // if it's broken it won't include the author
    assert(text.includes('Mathias Bynens'));
  });
});
