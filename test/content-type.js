'use strict';

const assert = require('assert');
const fetch = require('node-fetch');

const EXTENSION_TESTS = [
  ['https://resources.whatwg.org/standard.css', 'text/css'],
  ['https://whatwg.org/style/shared.css', 'text/css'],
  ['https://whatwg.org/specs/web-workers/current-work/rationale.html', 'text/html; charset=utf-8'],
  ['https://html.spec.whatwg.org/images/abstract.jpeg', 'image/jpeg'],
  ['https://resources.whatwg.org/browser-logos/bb.jpg', 'image/jpeg'],
  ['https://resources.whatwg.org/file-issue.js', 'text/javascript; charset=utf-8'],
  ['https://resources.whatwg.org/biblio.json', 'application/json'],
  ['https://streams.spec.whatwg.org/demos/resources/web-animations.min.js.map', 'text/javascript'], // TODO: charset=utf-8
  ['https://resources.whatwg.org/README.md', 'text/plain; charset=utf-8'],
  ['https://resources.whatwg.org/logo.png', 'image/png'],
  ['https://resources.whatwg.org/build/deploy.sh', 'text/plain; charset=utf-8'],
  ['https://resources.whatwg.org/logo.svg', 'image/svg+xml'],
  ['https://whatwg.org/robots.txt', 'text/plain; charset=utf-8'],
  ['https://resources.whatwg.org/fonts/SourceSansPro-Regular.woff', 'application/font-woff'],
  ['https://resources.whatwg.org/fonts/SourceSansPro-Regular.woff2', 'font/woff2'],
];

const WITHOUT_EXTENSION_TESTS = [
  ['https://images.whatwg.org/CFC', 'image/png'],
  ['https://images.whatwg.org/CFI', 'image/png'],
  ['https://images.whatwg.org/REC', 'image/png'],
  ['https://images.whatwg.org/WD', 'image/png'],
  ['https://images.whatwg.org/icon', 'image/png'],
  ['https://images.whatwg.org/icon-white', 'image/png'],
  ['https://images.whatwg.org/logo', 'image/png'],
  ['https://images.whatwg.org/logo-white', 'image/png'],
  ['https://images.whatwg.org/spinner', 'image/png'],
  ['https://images.whatwg.org/tabs-left', 'image/png'],
  ['https://images.whatwg.org/tabs-right', 'image/png'],
  ['https://n.whatwg.org/formdata', 'text/plain; charset=utf-8'],
  ['https://n.whatwg.org/work', 'text/plain; charset=utf-8'],
  ['https://whatwg.org/404', 'text/html; charset=utf-8'],
  ['https://whatwg.org/410', 'text/html; charset=utf-8'],
  ['https://whatwg.org/charter', 'text/html; charset=utf-8'],
  ['https://whatwg.org/code-of-conduct', 'text/html; charset=utf-8'],
  ['https://whatwg.org/faq', 'text/html; charset=utf-8'],
  ['https://whatwg.org/mailing-list', 'text/html; charset=utf-8'],
  ['https://whatwg.org/news/future-of-html', 'text/html; charset=utf-8'],
  ['https://whatwg.org/news/start', 'text/html; charset=utf-8'],
  ['https://whatwg.org/news/web-forms-call-for-comments-1', 'text/html; charset=utf-8'],
  ['https://whatwg.org/news/web-forms-call-for-comments-2', 'text/html; charset=utf-8'],
  ['https://whatwg.org/news/web-forms-call-for-comments-3', 'text/html; charset=utf-8'],
  ['https://whatwg.org/news/web-forms-call-for-comments-4', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-apps/2006-01-01/diff-2005-09-01', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2004-06-27-call-for-comments/sample-datetime-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-06-27-call-for-comments/sample-datetime-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-06-27-call-for-comments/sample-datetime-ui-3', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-06-27-call-for-comments/sample-multiple-editable-ui', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-06-27-call-for-comments/xforms-implementation-diagram', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-12-10-call-for-comments/diff-2004-06-27-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2004-12-10-call-for-comments/sample-autocompletion-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-12-10-call-for-comments/sample-autocompletion-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-12-10-call-for-comments/sample-datetime-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-12-10-call-for-comments/sample-datetime-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-12-10-call-for-comments/sample-datetime-ui-3', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-12-10-call-for-comments/sample-multiple-editable-ui', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2004-12-10-call-for-comments/xforms-implementation-diagram', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/diff-2004-06-27-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/diff-2004-12-10-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/sample-autocompletion-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/sample-autocompletion-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/sample-datetime-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/sample-datetime-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/sample-datetime-ui-3', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/sample-multiple-editable-ui', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-01-28-call-for-comments/xforms-implementation-diagram', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/diff-2005-01-28-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/sample-autocompletion-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/sample-autocompletion-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/sample-datetime-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/sample-datetime-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/sample-datetime-ui-3', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/sample-multiple-editable-ui', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/submission', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-02-07-submission/xforms-implementation-diagram', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/diff-2004-06-27-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/diff-2004-12-10-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/diff-2005-01-28-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/sample-autocompletion-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/sample-autocompletion-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/sample-datetime-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/sample-datetime-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/sample-datetime-ui-3', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/sample-multiple-editable-ui', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-04-11-call-for-comments/xforms-implementation-diagram', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/diff-2005-01-28-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/diff-2005-04-11-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/sample-autocompletion-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/sample-autocompletion-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/sample-datetime-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/sample-datetime-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/sample-datetime-ui-3', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/sample-multiple-editable-ui', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-07-03/xforms-implementation-diagram', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/diff-2005-04-11-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/diff-2005-07-03', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/sample-autocompletion-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/sample-autocompletion-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/sample-datetime-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/sample-datetime-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/sample-datetime-ui-3', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/sample-multiple-editable-ui', 'image/png'],
  ['https://whatwg.org/specs/web-forms/2005-09-01/xforms-implementation-diagram', 'image/png'],
  ['https://whatwg.org/specs/web-forms/current-work/diff-2005-01-28-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/current-work/diff-2005-04-11-call-for-comments', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/current-work/diff-2005-07-03', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/current-work/diff-2005-09-01', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/current-work/header-w3c', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/current-work/header-whatwg', 'text/html; charset=utf-8'],
  ['https://whatwg.org/specs/web-forms/current-work/sample-autocompletion-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/current-work/sample-autocompletion-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/current-work/sample-datetime-ui-1', 'image/png'],
  ['https://whatwg.org/specs/web-forms/current-work/sample-datetime-ui-2', 'image/png'],
  ['https://whatwg.org/specs/web-forms/current-work/sample-datetime-ui-3', 'image/png'],
  ['https://whatwg.org/specs/web-forms/current-work/sample-multiple-editable-ui', 'image/png'],
  ['https://whatwg.org/specs/web-forms/current-work/xforms-implementation-diagram', 'image/png'],
  ['https://whatwg.org/status-2008-12', 'text/plain; charset=utf-8'],
  ['https://whatwg.org/style/specification', 'text/css'],
  ['https://whatwg.org/working-mode', 'text/html; charset=utf-8'],
];

function test([url, expected]) {
  specify(url, async function() {
    // redirecting is a failure since we might then test the wrong server
    const response = await fetch(url, { redirect: 'manual' });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.headers.get('content-type'), expected);
  });
}

describe('content-type header', function() {
  describe('URLs with extension', function() {
    EXTENSION_TESTS.map(test);
  });
  describe('URLs without extension', function() {
    WITHOUT_EXTENSION_TESTS.map(test);
  });
});
