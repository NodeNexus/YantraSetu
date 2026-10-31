/**
 * YantraSetu - Interactive Judge Workbench & Digital Twin Simulator
 * Real-time canvas rendering for Vibration Oscilloscope, Thermal IR Matrix, and Acoustic Spectrum
 */

const SCENARIOS = {
  healthy: {
    name: "Scenario 1: Baseline Healthy Motor",
    badge: "NORMAL",
    badgeClass: "tag-normal",
    healthScore: 98,
    gateStatus: "PASSED (Normal Operation)",
    gateAction: "Continue standard continuous monitoring.",
    tempMean: 42.5,
    tempMax: 49.2,
    vibRms: 0.285,
    vibKurt: 2.92,
    soundDb: 68.4,
    soundScore: 0.032,
    description: "Motor running within normal ISO 10816-3 Class 1 limits. Symmetrical heat distribution, harmonic baseline vibration, and quiet acoustic profile."
  },
  bearing: {
    name: "Scenario 2: Bearing Outer-Race Flaking",
    badge: "WARNING",
    badgeClass: "tag-warning",
    healthScore: 68,
    gateStatus: "TRIGGERED (Vibration Threshold Exceeded)",
    gateAction: "Flagged for inspection during next planned downtime (estimated 150 hrs remaining life).",
    tempMean: 54.2,
    tempMax: 63.8,
    vibRms: 0.884,
    vibKurt: 6.45,
    soundDb: 79.2,
    soundScore: 0.540,
    description: "High-frequency periodic impact blows detected at Ball Pass Frequency Outer Race (BPFO). Kurtosis surge indicates localized surface spalling."
  },
  thermal: {
    name: "Scenario 3: Bearing Lubrication Breakdown",
    badge: "CRITICAL",
    badgeClass: "tag-critical",
    healthScore: 42,
    gateStatus: "TRIGGERED (Severe Thermal Gradient)",
    gateAction: "Immediate relubrication required to prevent catastrophic shaft seizure.",
    tempMean: 76.8,
    tempMax: 84.5,
    vibRms: 0.650,
    vibKurt: 3.80,
    soundDb: 81.5,
    soundScore: 0.680,
    description: "Severe friction heat concentrated at Drive-End bearing housing. Thermal gradient exceeds +25°C above ambient baseline."
  },
  cavitation: {
    name: "Scenario 4: Pump Cavitation & Impeller Wear",
    badge: "WARNING",
    badgeClass: "tag-warning",
    healthScore: 59,
    gateStatus: "TRIGGERED (Acoustic Anomaly Gate)",
    gateAction: "Check suction head pressure and intake valve for vortex formation.",
    tempMean: 44.0,
    tempMax: 48.2,
    vibRms: 0.520,
    vibKurt: 4.10,
    soundDb: 84.8,
    soundScore: 0.890,
    description: "Vapor bubble implosions generate ultrasonic shockwaves and acoustic chattering, detected early by the 16 kHz acoustic model."
  },
  false_alarm: {
    name: "Scenario 5: External Shop Shock (False Alarm Test)",
    badge: "FILTERED",
    badgeClass: "tag-normal",
    healthScore: 94,
    gateStatus: "CONFIDENCE GATE ACTIVATED (Alarm Suppressed)",
    gateAction: "Spurious acoustic spike (<150ms) filtered out. No plant interruption caused.",
    tempMean: 49.5,
    tempMax: 53.0,
    vibRms: 0.310,
    vibKurt: 3.05,
    soundDb: 91.2,
    soundScore: 0.120,
    description: "Simulates an ambient heat wave (+40°C afternoon) combined with an accidental dropped wrench on the shop floor. The gate proves resilience against false alarm fatigue."
  }
};

let currentScenario = 'healthy';
let animationFrameId = null;
let tick = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initScenarioButtons();
  initCanvases();
  renderScenario(currentScenario);
  startLoop();
});

function initScenarioButtons() {
  const buttons = document.querySelectorAll('.scenario-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scenarioKey = btn.getAttribute('data-scenario');
      if (SCENARIOS[scenarioKey]) {
        currentScenario = scenarioKey;
        renderScenario(scenarioKey);
        addLogEntry(scenarioKey);
      }
    });
  });
}

function renderScenario(key) {
  const s = SCENARIOS[key];
  if (!s) return;

  // Update text & values
  const badgeEl = document.getElementById('wb-badge');
  if (badgeEl) {
    badgeEl.innerText = s.badge;
    badgeEl.className = 'tag ' + s.badgeClass;
  }

  const nameEl = document.getElementById('wb-scenario-name');
  if (nameEl) nameEl.innerText = s.name;

  const descEl = document.getElementById('wb-desc');
  if (descEl) descEl.innerText = s.description;

  const healthEl = document.getElementById('wb-health-score');
  if (healthEl) healthEl.innerText = s.healthScore + '%';

  const gateStatusEl = document.getElementById('wb-gate-status');
  if (gateStatusEl) gateStatusEl.innerText = s.gateStatus;

  const gateActionEl = document.getElementById('wb-gate-action');
  if (gateActionEl) gateActionEl.innerText = s.gateAction;

  // Metric displays
  document.getElementById('wb-temp-mean').innerText = s.tempMean.toFixed(1) + ' °C';
  document.getElementById('wb-temp-max').innerText = s.tempMax.toFixed(1) + ' °C';
  document.getElementById('wb-vib-rms').innerText = s.vibRms.toFixed(3) + ' g';
  document.getElementById('wb-vib-kurt').innerText = s.vibKurt.toFixed(2);
  document.getElementById('wb-snd-db').innerText = s.soundDb.toFixed(1) + ' dB';
  document.getElementById('wb-snd-score').innerText = (s.soundScore * 100).toFixed(1) + '%';
}

function addLogEntry(key) {
  const s = SCENARIOS[key];
  const tbody = document.getElementById('wb-log-tbody');
  if (!tbody) return;

  const now = new Date().toLocaleTimeString();
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${now}</td>
    <td><span class="tag ${s.badgeClass}">${s.badge}</span></td>
    <td><strong>${s.name}</strong> &mdash; ${s.gateStatus}</td>
    <td>${s.gateAction}</td>
  `;
  tbody.insertBefore(tr, tbody.firstChild);

  // Keep max 6 rows
  while (tbody.children.length > 6) {
    tbody.removeChild(tbody.lastChild);
  }
}

// Canvas Visualizers
let vibCanvas, vibCtx;
let thermCanvas, thermCtx;
let sndCanvas, sndCtx;

function initCanvases() {
  vibCanvas = document.getElementById('canvas-vibration');
  if (vibCanvas) vibCtx = vibCanvas.getContext('2d');

  thermCanvas = document.getElementById('canvas-thermal');
  if (thermCanvas) thermCtx = thermCanvas.getContext('2d');

  sndCanvas = document.getElementById('canvas-acoustic');
  if (sndCanvas) sndCtx = sndCanvas.getContext('2d');
}

function startLoop() {
  function loop() {
    tick++;
    drawVibration();
    drawThermal();
    drawAcoustic();
    animationFrameId = requestAnimationFrame(loop);
  }
  loop();
}

// 1. Draw Vibration Oscilloscope
function drawVibration() {
  if (!vibCtx || !vibCanvas) return;
  const w = vibCanvas.width;
  const h = vibCanvas.height;

  vibCtx.fillStyle = '#050912';
  vibCtx.fillRect(0, 0, w, h);

  // Grid lines
  vibCtx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
  vibCtx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    vibCtx.beginPath();
    vibCtx.moveTo(x, 0);
    vibCtx.lineTo(x, h);
    vibCtx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    vibCtx.beginPath();
    vibCtx.moveTo(0, y);
    vibCtx.lineTo(w, y);
    vibCtx.stroke();
  }

  // Waveform
  vibCtx.strokeStyle = currentScenario === 'bearing' ? '#f59e0b' : currentScenario === 'thermal' ? '#ef4444' : '#10b981';
  vibCtx.lineWidth = 2;
  vibCtx.beginPath();

  const midY = h / 2;
  const amp = currentScenario === 'bearing' ? 38 : currentScenario === 'thermal' ? 24 : 14;
  const freq = currentScenario === 'bearing' ? 0.08 : 0.04;

  for (let x = 0; x < w; x++) {
    let y = midY + Math.sin(x * freq + tick * 0.1) * amp;
    
    // Bearing defect spall spikes
    if (currentScenario === 'bearing' && (x + tick * 3) % 90 < 8) {
      y += (Math.random() * 50 - 25);
    }
    // High ambient jitter
    if (currentScenario === 'false_alarm' && (x + tick) % 180 < 6) {
      y += (Math.random() * 40 - 20);
    }

    if (x === 0) vibCtx.moveTo(x, y);
    else vibCtx.lineTo(x, y);
  }
  vibCtx.stroke();

  // Overlay label
  vibCtx.fillStyle = '#94a3b8';
  vibCtx.font = '10px monospace';
  vibCtx.fillText(`CH1: 20 kHz Accelerometer | RMS: ${SCENARIOS[currentScenario].vibRms}g`, 10, 18);
}

// 2. Draw 32x24 Thermal Array Matrix
function drawThermal() {
  if (!thermCtx || !thermCanvas) return;
  const cols = 32;
  const rows = 24;
  const cellW = thermCanvas.width / cols;
  const cellH = thermCanvas.height / rows;

  const isHot = currentScenario === 'thermal';
  const isBearing = currentScenario === 'bearing';

  // Hotspot location
  const hotX = isHot ? 22 : 16;
  const hotY = isHot ? 14 : 12;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dist = Math.hypot(c - hotX, r - hotY);
      let intensity = Math.max(0, 1 - dist / (isHot ? 10 : 8));
      
      // Jitter
      intensity += (Math.random() * 0.08 - 0.04);
      intensity = Math.min(1, Math.max(0, intensity));

      // Color mapping: Black/Navy -> Violet -> Red -> Orange -> Yellow
      let fill;
      if (isHot) {
        if (intensity > 0.75) fill = `rgb(255, 255, ${Math.floor(intensity * 120)})`; // Bright Yellow
        else if (intensity > 0.45) fill = `rgb(239, ${Math.floor(intensity * 140)}, 30)`; // Orange-Red
        else if (intensity > 0.2) fill = `rgb(168, 40, 120)`; // Purple
        else fill = `rgb(15, 23, 42)`; // Cold Blue
      } else if (isBearing) {
        if (intensity > 0.6) fill = `rgb(245, 158, 11)`;
        else if (intensity > 0.3) fill = `rgb(130, 40, 100)`;
        else fill = `rgb(15, 23, 42)`;
      } else {
        // Healthy baseline
        if (intensity > 0.5) fill = `rgb(16, 185, 129)`;
        else if (intensity > 0.25) fill = `rgb(6, 182, 212)`;
        else fill = `rgb(11, 19, 36)`;
      }

      thermCtx.fillStyle = fill;
      thermCtx.fillRect(c * cellW, r * cellH, cellW, cellH);
    }
  }

  // Draw Hotspot Crosshair
  const px = hotX * cellW + cellW / 2;
  const py = hotY * cellH + cellH / 2;
  thermCtx.strokeStyle = '#ffffff';
  thermCtx.lineWidth = 1.5;
  thermCtx.beginPath();
  thermCtx.arc(px, py, 12, 0, Math.PI * 2);
  thermCtx.moveTo(px - 18, py);
  thermCtx.lineTo(px + 18, py);
  thermCtx.moveTo(px, py - 18);
  thermCtx.lineTo(px, py + 18);
  thermCtx.stroke();

  // Overlay text
  thermCtx.fillStyle = '#ffffff';
  thermCtx.font = '11px monospace';
  thermCtx.fillText(`MAX: ${SCENARIOS[currentScenario].tempMax}°C`, px + 15, py - 10);
  thermCtx.fillText(`MLX90640 (32x24 IR)`, 10, thermCanvas.height - 10);
}

// 3. Draw Acoustic Frequency Spectrum
function drawAcoustic() {
  if (!sndCtx || !sndCanvas) return;
  const w = sndCanvas.width;
  const h = sndCanvas.height;

  sndCtx.fillStyle = '#050912';
  sndCtx.fillRect(0, 0, w, h);

  const numBars = 32;
  const barWidth = (w - (numBars * 3)) / numBars;
  const isCavitation = currentScenario === 'cavitation';
  const isShock = currentScenario === 'false_alarm';

  for (let i = 0; i < numBars; i++) {
    let barHeight = 15 + Math.sin(i * 0.3 + tick * 0.15) * 12 + Math.random() * 8;
    
    // Cavitation acoustic signature in higher frequencies
    if (isCavitation && i > 16) {
      barHeight += Math.random() * 45 + 20;
    }
    // False alarm tool drop shock
    if (isShock && (tick % 60 < 10) && i > 8 && i < 24) {
      barHeight += Math.random() * 60 + 30;
    }

    barHeight = Math.min(h - 20, Math.max(6, barHeight));

    const x = i * (barWidth + 3) + 6;
    const y = h - barHeight - 10;

    let barColor = '#06b6d4';
    if (barHeight > h * 0.65) barColor = '#ef4444';
    else if (barHeight > h * 0.45) barColor = '#f59e0b';

    sndCtx.fillStyle = barColor;
    sndCtx.fillRect(x, y, barWidth, barHeight);
  }

  sndCtx.fillStyle = '#94a3b8';
  sndCtx.font = '10px monospace';
  sndCtx.fillText(`16 kHz MEMS Acoustic | Sound Level: ${SCENARIOS[currentScenario].soundDb} dB`, 10, 18);
}
