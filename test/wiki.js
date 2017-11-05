'use strict';

const assert = require('assert');
const fetch = require('node-fetch');

describe('wiki', function() {
  specify('main page', async function() {
    const response = await fetch('https://wiki.whatwg.org/wiki/Main_Page');
    const text = await response.text();
    // the main page should link to the FAQ
    assert(text.includes('https://whatwg.org/faq'))
  });

  specify('history', async function() {
    const response = await fetch('https://wiki.whatwg.org/index.php?title=IRC&action=history');
    const text = await response.text();
    // history pages should have a certain title and buttons
    assert(text.includes('Revision history of "IRC"'))
    assert(text.includes('value="Compare selected revisions"'))
  });
});
