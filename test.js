const http = require('http');
const assert = require('assert');

process.env.PORT = '3457';
require('./server.js');

setTimeout(async () => {
  const routes = [
    '/',
    '/how-it-works',
    '/live-demo',
    '/feasibility',
    '/team',
    '/api/health',
    '/api/telemetry',
    '/assets/css/style.css',
    '/assets/js/workbench.js',
    '/assets/images/dashboard_prototype.png',
    '/assets/docs/pitch_deck.pdf',
    '/assets/docs/idea_lab_report.pdf'
  ];

  console.log('Verifying full-fledged showcase assets on local web service...');

  for (const r of routes) {
    await new Promise((resolve, reject) => {
      http.get(`http://localhost:3457${r}`, (res) => {
        let length = 0;
        res.on('data', chunk => length += chunk.length);
        res.on('end', () => {
          assert.strictEqual(res.statusCode, 200, `Route ${r} returned status ${res.statusCode}`);
          console.log(`  [PASS] ${r} -> HTTP ${res.statusCode} (${length} bytes) [Content-Type: ${res.headers['content-type']}]`);
          resolve();
        });
      }).on('error', reject);
    });
  }

  console.log('\nAll pages, static assets, and APIs are 100% verified and operational!');
  process.exit(0);
}, 600);
