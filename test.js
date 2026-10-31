const http = require('http');
const assert = require('assert');

// Start server on a test port
process.env.PORT = '3456';
require('./server.js');

setTimeout(async () => {
  const routes = [
    '/',
    '/how-it-works',
    '/live-demo',
    '/feasibility',
    '/team',
    '/api/health',
    '/api/telemetry'
  ];

  console.log('Running test suite on local web service...');

  for (const r of routes) {
    await new Promise((resolve, reject) => {
      http.get(`http://localhost:3456${r}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          assert.strictEqual(res.statusCode, 200, `Route ${r} returned status ${res.statusCode}`);
          console.log(`  [PASS] ${r} -> HTTP ${res.statusCode} (${body.length} bytes)`);
          resolve();
        });
      }).on('error', reject);
    });
  }

  console.log('\nAll routes successfully tested and verified!');
  process.exit(0);
}, 500);
