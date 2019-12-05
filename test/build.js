'use strict';

const assert = require('assert');
const fetch = require('node-fetch');

describe('build', function() {
  specify('/ping', async function() {
    const response = await fetch('https://build.whatwg.org/ping');
    assert.strictEqual(response.status, 200);
    const text = await response.text();
    assert.strictEqual(text, 'All good here');
  });
});
