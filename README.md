# 🌬️ Vaayu (वायु) — Atmospheric Intelligence & Health Advisory System

> **Coupled Weather-Chemistry AQI Forecasting, Agricultural Fire Attribution & Hyperlocal Vernacular Health Advisory Platform**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview

**Vaayu (वायु)** is an end-to-end atmospheric intelligence platform designed to address urban air quality challenges across the Indo-Gangetic Plain and Delhi NCR.

Traditional forecasting models rely either on expensive numerical weather prediction (NWP) simulations that run with hours of latency, or purely statistical time-series models that fail during episodic events like post-monsoon crop residue burning and winter temperature inversions.

Vaayu bridges this gap using a **Coupled Weather-Chemistry Emulation Engine** combining:
- **Real-Time Sensor Telemetry**: Live ingestion from all 40 Continuous Ambient Air Quality Monitoring Stations (CAAQMS) operated by CPCB.
- **Satellite Fire Radiative Power (FRP)**: Active stubble burning detection via NASA FIRMS (VIIRS 375m sensor).
- **WRF-Chem Emulation**: Iterative feedback loop modeling boundary layer dynamics, temperature inversion, and chemical dispersion.
- **Hyperlocal Health Advisories**: Clinical advice tailored by demographic vulnerability (children, elderly, outdoor workers, asthmatics) delivered in vernacular languages (Hindi, Punjabi, English) with voice synthesis.

---

## ✨ Key Features

- **📍 Hyperlocal GPS Calibration**: Auto-detects user coordinates via HTML5 Geolocation, computes Haversine distance, and locks onto the closest CAAQMS station (out of 40 active Delhi NCR stations).
- **🗺️ Interactive Atmospheric Map**:
  - 40 CAAQMS monitoring station markers with color-coded live AQI values.
  - Active farm fire clusters (NASA FIRMS VIIRS telemetry) with Fire Radiative Power (MW).
  - Dynamic Gaussian plume dispersion trajectories projecting particulate matter flow downwind towards urban centers.
  - One-click viewports: *Delhi NCR (40 Stations)*, *Farm Fires (Punjab/Haryana)*, and *Regional Airshed*.
- **🔮 72-Hour Multi-Horizon Forecasting**: 6h, 24h, 48h, and 72h forecasts accounting for wind direction, boundary layer height, and thermal inversion.
- **📊 Source Attribution Matrix**: Real-time breakdown of pollution contributors:
  - Stubble burning (biomass plume transport)
  - Vehicular exhaust & transport corridor emissions
  - Industrial emissions & power generation
  - Road dust & construction particulate matter
- **🚨 Graded Response Action Plan (GRAP) Enforcement**: Automated stage classification (Stage I to Stage IV) under CAQM statutory guidelines with immediate citizen and administrative directives.
- **🗣️ Vernacular Voice Advisory (Hindi / Punjabi / English)**: AI-generated clinical advisories with text-to-speech audio synthesis for accessible public health guidance.
- **⏱️ Configurable Telemetry Refresh**: Auto-refresh interval options (15m, 30m, 60m, or manual) with real-time sync countdown timer.

---

## 🏗️ Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                   Data Ingestion Feeds                 │
   │  CPCB CAAQMS Stations │ NASA FIRMS VIIRS │ Open-Meteo  │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │              FastAPI Backend Services                  │
   │  • Ingestion & Validation Pipeline                     │
   │  • Coupled Weather-Chemistry Engine                    │
   │  • Atmospheric Inversion & Plume Dispersion Module     │
   │  • Source Attribution Classifier                       │
   │  • GRAP Compliance Engine                              │
   │  • Clinical Advisory & Translation Engine              │
   └───────────────────────────┬────────────────────────────┘
                               │ (REST APIs + JSON)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │           React 18 + Vite Frontend Dashboard           │
   │  • Leaflet Geospatial Interactive Map                  │
   │  • Lucide Modern Icons & Responsive Glassmorphic UI    │
   │  • Web Speech API Vernacular Voice Playback            │
   │  • GPS Haversine Station Lock                          │
   └────────────────────────────────────────────────────────┘
```

### Backend
- **Framework**: FastAPI, Uvicorn (ASGI)
- **Data & Math**: NumPy, Pandas, SciPy, Scikit-learn
- **Configuration & Validation**: Pydantic v2, Pydantic-Settings, python-dotenv
- **Network & Async**: HTTPX, WebSockets

### Frontend
- **Framework**: React 18, Vite 6
- **Mapping**: Leaflet, React-Leaflet
- **Styling**: Modern CSS3 with CSS Variables, responsive grid/flexbox layouts
- **Icons**: Lucide React
- **Speech**: HTML5 Web Speech Synthesis API

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/anantmani13/Vaayu.git
cd Vaayu
```

### 2. Configure Environment Variables
Copy the example environment file and update API keys as needed:
```bash
cp backend/.env.example backend/.env
```
*(Optional: Keys for NASA FIRMS, WAQI, OpenAI, and Data.gov.in can be added for live upstream polling; the application includes built-in offline fallbacks and regional calibration data if keys are not provided).*

### 3. Install Dependencies

**Backend:**
```bash
python -m pip install -r backend/requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

---

## 💻 Running the Application

### Option A: One-Click Startup (Windows)
Double-click `start_servers.bat` or run:
```cmd
start_servers.bat
```
This will launch:
- **Backend API**: `http://localhost:8000` (Docs at `http://localhost:8000/docs`)
- **Frontend Dashboard**: `http://localhost:5173`

### Option B: Manual Startup

**Terminal 1 (Backend):**
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 📡 API Endpoints Reference

| Route | Method | Description |
|---|---|---|
| `/api/v1/forecast/coupled` | `POST` | Generates 6h to 72h coupled weather-chemistry AQI forecast |
| `/api/v1/forecast/stations` | `GET` | Telemetry from 40 CAAQMS monitoring stations across Delhi NCR |
| `/api/v1/attribution/sources` | `GET` | Quantitative breakdown of pollution sources |
| `/api/v1/attribution/fires` | `GET` | Active satellite fire detections and FRP metrics |
| `/api/v1/grap/status` | `GET` | Current GRAP stage, trigger pollutants, and enforcement rules |
| `/api/v1/advisory/generate` | `POST` | Vernacular demographic health advice with translation |

Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
