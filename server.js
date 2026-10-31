const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Mock telemetry generator for dynamic showcase
function getMockTelemetry() {
  const now = new Date();
  const baseTemp = 42.5;
  const tempJitter = (Math.random() * 4 - 2).toFixed(1);
  const currentTemp = (parseFloat(baseTemp) + parseFloat(tempJitter)).toFixed(1);

  const vibRms = (0.28 + Math.random() * 0.12).toFixed(3);
  const soundDb = (68 + Math.random() * 6).toFixed(1);
  const acousticAnomalyScore = (0.02 + Math.random() * 0.05).toFixed(3);

  return {
    timestamp: now.toISOString(),
    machine_id: 'MTR-IND-04',
    machine_type: 'Three-Phase Induction Motor (5 HP, 1440 RPM)',
    operational_status: 'Healthy / Normal Operation',
    modalities: {
      thermal: {
        sensor: 'Melexis MLX90640 (32x24 IR Array)',
        mean_temperature_c: parseFloat(currentTemp),
        max_hotspot_c: (parseFloat(currentTemp) + 7.8).toFixed(1),
        threshold_c: 75.0,
        status: parseFloat(currentTemp) > 65.0 ? 'WARNING' : 'NORMAL'
      },
      vibration: {
        sensor: '20 kHz Contact Accelerometer (Drive End Bearing)',
        rms_g: parseFloat(vibRms),
        kurtosis: (2.90 + Math.random() * 0.25).toFixed(2),
        baseline_rms_g: 0.35,
        status: parseFloat(vibRms) > 0.6 ? 'WARNING' : 'NORMAL'
      },
      acoustic: {
        sensor: 'Directional MEMS Microphone (16 kHz)',
        sound_level_db: parseFloat(soundDb),
        anomaly_probability: parseFloat(acousticAnomalyScore),
        status: parseFloat(acousticAnomalyScore) > 0.4 ? 'WARNING' : 'NORMAL'
      }
    },
    confidence_gate: {
      gate_passed: true,
      confidence_level: 'HIGH (96.4%)',
      suppressed_false_alarms: 14
    }
  };
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // API Endpoints
  if (urlPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'YantraSetu Web Service',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (urlPath === '/api/telemetry') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(getMockTelemetry()));
    return;
  }

  // Page Routing & Static File Serving
  let filePath = path.join(__dirname, 'public', urlPath === '/' ? 'index.html' : urlPath);
  
  // If clean route without extension, try finding matching .html
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>404 Not Found - YantraSetu</title>
            <link rel="stylesheet" href="/assets/css/style.css">
          </head>
          <body style="display:flex; align-items:center; justify-content:center; height:100vh; text-align:center;">
            <div>
              <h1 style="font-size:3rem; margin-bottom:12px;">404</h1>
              <p style="color:var(--text-muted); margin-bottom:24px;">The requested showcase page or asset was not found.</p>
              <a href="/" class="btn btn-primary">&larr; Return to YantraSetu Showcase</a>
            </div>
          </body>
          </html>
        `);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`  YantraSetu Web Service is active`);
  console.log(`  Listening on http://${HOST}:${PORT}`);
  console.log(`  Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`  Live Telemetry API: http://${HOST}:${PORT}/api/telemetry`);
  console.log(`====================================================`);
});
