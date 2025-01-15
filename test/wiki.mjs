import assert from 'assert';

describe('wiki', function() {
  specify('main page', async function() {
    const response = await fetch('https://wiki.whatwg.org/wiki/Main_Page');
    assert.strictEqual(response.status, 200);
    const text = await response.text();
    // the main page should link to the FAQ
    assert(text.includes('https://whatwg.org/faq'));
    assert(!text.includes('This site is experiencing technical difficulties'));
  });

  specify('history', async function() {
    const response = await fetch('https://wiki.whatwg.org/index.php?title=IRC&action=history');
    assert.strictEqual(response.status, 200);
    const text = await response.text();
    // history pages should have a certain title and buttons
    assert(text.includes('IRC: Revision history'));
    assert(text.includes('value="Compare selected revisions"'));
    assert(!text.includes('This site is experiencing technical difficulties'));
  });
});
