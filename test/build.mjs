import assert from 'assert';

describe('build', function() {
  specify('/version', async function() {
    const response = await fetch('https://build.whatwg.org/version');
    assert.strictEqual(response.status, 200);
    const text = await response.text();
    assert(text.length > 0);
  });
});
