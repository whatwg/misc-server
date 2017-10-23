const fs = require('fs')
const https = require('https')

// Let's Encrypt should renew when 30 days remain, so if it's less than 25
// something is wrong with certificate automation.
const MAX_DAYS = 25

const NOW = Date.now()
const DAY_MS = 24 * 3600 * 1000

const DOMAINS = new Set(fs.readFileSync('debian/marquee/DOMAINS')
                        .toString().split(/[\s,]/).filter(d => d != ''))

// TODO(foolip): when https://github.com/whatwg/misc-server/issues/7 is resolved
// this can be removed.
const EXTRA_DOMAINS = [
  'blog.whatwg.org',
  'build.whatwg.org',
  'console.spec.whatwg.org',
  'encoding.spec.whatwg.org',
  'forums.whatwg.org',
  'html.spec.whatwg.org',
  //'lists.whatwg.org',
  'mimesniff.spec.whatwg.org',
  'storage.spec.whatwg.org',
  'streams.spec.whatwg.org',
  'url.spec.whatwg.org',
  'whatwg.org', 'www.whatwg.org',
  'wiki.whatwg.org',
  'xhr.spec.whatwg.org',
]
for (const domain of EXTRA_DOMAINS) {
  DOMAINS.add(domain)
}

function testCertificate(domain) {
  return new Promise((resolve, reject) => {
    https.request(`https://${domain}`, res => {
      const cert = res.connection.getPeerCertificate()
      const valid_to = Date.parse(cert.valid_to)
      const days_left = (valid_to - NOW) / DAY_MS
      if (days_left < MAX_DAYS)
        resolve(`cert expires in less than ${MAX_DAYS} days: ${cert.valid_to}`)
      resolve('OK')
    }).end()
  })
}

async function test() {
  let ok = true
  for (const domain of DOMAINS) {
      const result = await testCertificate(domain)
      console.log(domain, result)
      if (result != 'OK')
        ok = false
  }
  if (!ok)
    process.exit(1)
}

test()
