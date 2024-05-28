import https from 'https';

// Let's Encrypt should renew when 30 days remain, so if it's less than 25
// something is wrong with certificate automation.
const MIN_DAYS = 25;

const DOMAINS = [
  'blog.whatwg.org',
  'books.idea.whatwg.org',
  'books.spec.whatwg.org',
  'build.whatwg.org',
  'c.whatwg.org',
  'compat.spec.whatwg.org',
  'compression.spec.whatwg.org',
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
  'fs.spec.whatwg.org',
  'fullscreen.spec.whatwg.org',
  'help.whatwg.org',
  'html-differences.whatwg.org',
  'html.spec.whatwg.org',
  'lists.whatwg.org',
  'idea.whatwg.org',
  'images.whatwg.org',
  'infra.spec.whatwg.org',
  'javascript.spec.whatwg.org',
  'mediasession.spec.whatwg.org',
  'mimesniff.spec.whatwg.org',
  'n.whatwg.org',
  'notifications.spec.whatwg.org',
  'quirks.spec.whatwg.org',
  'participate.whatwg.org',
  'resources.whatwg.org',
  'spec.whatwg.org',
  'specs.whatwg.org',
  'storage.spec.whatwg.org',
  'streams.spec.whatwg.org',
  'svn.whatwg.org',
  'testutils.spec.whatwg.org',
  'url.spec.whatwg.org',
  'urlpattern.spec.whatwg.org',
  'validator.whatwg.org',
  'webidl.spec.whatwg.org',
  'websocket.spec.whatwg.org',
  'websockets.spec.whatwg.org',
  'webvtt.spec.whatwg.org',
  'whatwg.org',
  'wiki.whatwg.org',
  'www.whatwg.org',
  'xhr.spec.whatwg.org',
  'xn--7ca.whatwg.org',
];

function getCertificate(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      // Use a new agent every time, as getPeerCertificate() can return an
      // empty object if the connection is reused. (Maybe a bug, unclear.)
      agent: new https.Agent,
    };
    const req = https.request(options, res => {
      resolve(res.connection.getPeerCertificate());
    });
    req.on('error', err => reject(err));
    req.end();
  });
}

describe('certificate expiry date', function() {
  const now = Date.now();

  for (const domain of DOMAINS) {
    specify(domain, async function() {
      const cert = await getCertificate(domain);
      const valid_to = Date.parse(cert.valid_to);
      if (!isFinite(valid_to)) {
        throw new Error(`invalid cert expiry date: ${cert.valid_to}`);
      }
      const days_left = (valid_to - now) / (24 * 3600 * 1000);
      if (days_left < MIN_DAYS) {
        throw new Error(`cert expires in less than ${MIN_DAYS} days: ${cert.valid_to}`);
      }
    });
  }
});
