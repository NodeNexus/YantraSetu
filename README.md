# YantraSetu (यंत्रसेतु)

> **Multimodal Machine Health Monitoring & Early Anomaly Detection for Industrial MSMEs**  
> *Developed at AICTE Idea Lab, Ramdeobaba University, Nagpur &bull; Project Code: 24CS03PR0504*

---

## 1. Overview

**YantraSetu** is an edge-computing industrial health monitoring system that continuously tracks heat (**thermal infrared**), **vibration dynamics**, and **acoustic noise** emitted by rotating machinery (electric motors, pumps, gearboxes, and blowers).

By fusing signals and running them through a **Layered Confidence Gate**, YantraSetu detects early-stage bearing fatigue, shaft misalignment, unbalance, and overheating—eliminating unexpected factory downtime and preventing worker safety hazards without requiring high-cost commercial IoT subscriptions.

---

## 2. Key Pages

The website is intentionally structured with pure semantic HTML (clean, fast, responsive without external CSS dependencies):

* **[Overview (`/`)](public/index.html):** Problem statement in Indian MSMEs, the YantraSetu edge approach, and benchmark validation metrics.
* **[How It Works & Architecture (`/how-it-works`)](public/how-it-works.html):** System architecture diagram, tri-modal sensor specifications, and the false-alarm-suppressing Confidence Gate.
* **[Live Telemetry Demo (`/live-demo`)](public/live-demo.html):** Real-time telemetry feed simulator querying the live `/api/telemetry` endpoint.
* **[BOM Cost & Feasibility (`/feasibility`)](public/feasibility.html):** Itemized Bill of Materials (₹19,500 – ₹22,400 per machine kit) and the 12-month lab-to-shop-floor implementation roadmap.
* **[Team & Pilot Request (`/team`)](public/team.html):** Engineering team designations, faculty mentor, direct contact emails, and pilot expression-of-interest form.

---

## 3. Web Service & API Endpoints

The service runs a high-performance, zero-dependency Node.js HTTP server configured for Render:

| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | Home / Overview Page |
| `/how-it-works` | `GET` | Architecture & Modality Breakdown |
| `/live-demo` | `GET` | Interactive Live Telemetry Simulator |
| `/feasibility` | `GET` | Hardware BOM & Roadmap |
| `/team` | `GET` | Team Profiles & Pilot Request Form |
| `/api/health` | `GET` | Health check endpoint (Render uptime monitoring) |
| `/api/telemetry` | `GET` | Dynamic JSON stream of simulated multi-sensor telemetry |

---

## 4. Deploying on Render (Instant Web Service)

This repository includes a `render.yaml` Blueprint and `Procfile` configured for 1-click deployment on [Render](https://render.com):

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository: `https://github.com/NodeNexus/YantraSetu`.
4. Render will auto-detect settings:
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Health Check Path:** `/api/health`
5. Click **Create Web Service**. Render will provision your URL (e.g. `https://yantrasetu.onrender.com`) within 60 seconds!

---

## 5. Running Locally

Clone the repository and run:

```bash
git clone https://github.com/NodeNexus/YantraSetu.git
cd YantraSetu
node server.js
```

Open your browser at `http://localhost:3000`.

---

## 6. Project Credits & Contact

* **Lead:** Vaishnav Balpande (`amazondevvaish@gmail.com`)
* **Mentor:** Prof. Ashwini Lokhande (`idealab@rknec.edu`)
* **Institution:** AICTE Idea Lab, Ramdeobaba University, Katol Road, Nagpur, Maharashtra &ndash; 440013
