'use strict';

const https = require('https');

// Let's Encrypt should renew when 30 days remain, so if it's less than 25
// something is wrong with certificate automation.
const MAX_DAYS = 25;

const DOMAINS = [
  'blog.whatwg.org',
  'books.idea.whatwg.org',
  'books.spec.whatwg.org',
  'build.whatwg.org',
  'c.whatwg.org',
  'compat.spec.whatwg.org',
  'console.spec.whatwg.org',
  'developer.whatwg.org',
  'developers.whatwg.org',
  'dom.spec.whatwg.org',
  'domparsing.spec.whatwg.org',
  'encoding.spec.whatwg.org',
  'fetch.spec.whatwg.org',
  'figures.idea.whatwg.org',
  'figures.spec.whatwg.org',
  'forums.whatwg.org',
  'fullscreen.spec.whatwg.org',
  'help.whatwg.org',
  'html-differences.whatwg.org',
  'html.spec.whatwg.org',
  // 'lists.whatwg.org',
  'idea.whatwg.org',
  'images.whatwg.org',
  'infra.spec.whatwg.org',
  'javascript.spec.whatwg.org',
  'mediasession.spec.whatwg.org',
  'mimesniff.spec.whatwg.org',
  'n.whatwg.org',
  'notifications.spec.whatwg.org',
  'quirks.spec.whatwg.org',
  'resources.whatwg.org',
  'spec.whatwg.org',
  'specs.whatwg.org',
  'storage.spec.whatwg.org',
  'streams.spec.whatwg.org',
  'svn.whatwg.org',
  'url.spec.whatwg.org',
  'validator.whatwg.org',
  'webvtt.spec.whatwg.org',
  'whatwg.org',
  'wiki.whatwg.org',
  'www.whatwg.org',
  'xhr.spec.whatwg.org',
  'xn--7ca.whatwg.org',
];

function getCertificate(domain) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://${domain}`, res => {
      resolve(res.connection.getPeerCertificate());
    });
    req.on('error', err => reject(err));
    req.end();
  });
}

async function test() {
  const now = Date.now();

  // start all the requests in parallel
  const requests = DOMAINS.map(domain => [domain, getCertificate(domain)]);

  let ok = true;

  for (const [domain, request] of requests) {
    let status = 'OK';
    try {
      const cert = await request;
      const valid_to = Date.parse(cert.valid_to);
      const days_left = (valid_to - now) / (24 * 3600 * 1000);
      if (days_left < MAX_DAYS) {
        status = `cert expires in less than ${MAX_DAYS} days: ${cert.valid_to}`;
      }
    } catch (err) {
      status = err;
    }
    if (status !== 'OK') {
      ok = false;
    }
    console.log(domain, status);
  }

  if (!ok) {
    process.exit(1);
  }
}

test();
