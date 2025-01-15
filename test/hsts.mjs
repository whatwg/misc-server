import assert from 'assert';

const HOSTNAMES = [
  // not an exhaustive list, just enough to catch accidental removal
  'whatwg.org',
  'blog.whatwg.org',
  'dom.spec.whatwg.org',
  'participate.whatwg.org',
  'resources.whatwg.org',
  'spec.whatwg.org',
  'wiki.whatwg.org',
];

describe('strict-transport-security header', function() {
  for (const hostname of HOSTNAMES) {
    specify(hostname, async function() {
      // redirecting is a failure since we might then test the wrong server
      const response = await fetch(`https://${hostname}/`, { redirect: 'manual' });
      assert.strictEqual(response.status, 200);
      let value = response.headers.get('strict-transport-security');
      assert.strictEqual(value, 'max-age=63072000; includeSubDomains; preload');
    });
  }
});
