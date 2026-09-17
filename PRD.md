# Vaayu — Final Product Requirements Document

### AI-Powered Coupled Weather-Chemistry AQI Forecasting & Vernacular Health Advisory System

**Project Name:** Vaayu (वायु — "air / wind")
**Prepared for:** Smart India Hackathon (Software Edition)
**Domain Track:** Clean & Green Technology / HealthTech / Smart Automation
**Version:** 2.0 (Final)
**Date:** September 2026

---

## 1. Executive Summary

Vaayu is an end-to-end AI system that builds a **high-resolution, coupled weather-chemistry forecasting engine** for Delhi NCR, predicting hyperlocal AQI 6–72 hours in advance. Unlike standard AQI models that treat meteorology and pollution as separate systems, Vaayu explicitly models the **two-way feedback loop** between atmospheric physics and chemical transport — the same physics captured by WRF-Chem — using a deep-learning surrogate that runs in seconds rather than hours.

The system then converts that coupled forecast into:
- **Personalized, vernacular, voice-accessible health guidance** for citizens (answering: *"Is it safe for me to go outside today?"*)
- **Actionable GRAP compliance intelligence** for pollution-control officers (answering: *"Which stage should be triggered, where, and why?"*)
- **Atmospheric inversion tracking and stubble-burning plume dispersion maps** for administrators and researchers

The full stack is built on sovereign, open-weight models (AI4Bharat Indic NLP/speech stack, quantized Llama-3), async FastAPI microservices, and PyTorch-based graph neural networks — avoiding dependency on proprietary APIs, aligned with DPDP Act 2023 and IndiaAI mission priorities.

---

## 2. Problem Statement

> *"Traditional AQI forecasting models treat meteorology and pollution dispersion as separate entities. In highly polluted urban landscapes like Delhi NCR, there is a critical, dynamic feedback loop between weather and pollutants."*

### 2.1 The Core Scientific Gap

During peak pollution seasons (October–February), **atmospheric inversion layers** trap particulate matter close to the ground. Simultaneously, dense aerosol concentrations (PM2.5) **block sunlight, alter local temperatures, suppress wind speeds, and depress Planetary Boundary Layer (PBL) heights** — which in turn traps even more pollutants. This creates a self-reinforcing cycle that standard single-direction models fundamentally miss.

### 2.2 Why Existing Solutions Fail

| Limitation | Impact |
|---|---|
| **Decoupled models** — meteorology and chemistry run independently | Miss the feedback loop where aerosols alter weather, which alters aerosol dispersion |
| **Coarse spatial resolution** — city-level or district-level forecasts | Useless for ward-level health advisories; AQI can vary 2–3x across 10 km within Delhi |
| **No inversion-aware forecasting** — PBL height treated as static input | Catastrophic under-prediction during winter inversion episodes (the most dangerous periods) |
| **No source attribution** — single AQI number without causal breakdown | Officers cannot prioritize interventions (e.g., construction ban vs. traffic restriction) |
| **Language/literacy barrier** — English-only, text-only dashboards | Excludes outdoor laborers, gig workers, and elderly — the most pollution-exposed demographics |

### 2.3 What Vaayu Solves

1. **Coupled forecasting** — a DL surrogate for WRF-Chem's two-way coupling, where predicted pollutant concentrations feed back into meteorological state (PBL height, temperature, radiation), and the refined meteorology drives updated pollutant dispersion.
2. **Hyperlocal resolution** — graph-neural-network interpolation from ~40 CAAQMS stations to a ward-level grid across Delhi NCR.
3. **Inversion-aware modeling** — an explicit atmospheric inversion module that tracks inversion strength and its impact on pollutant trapping.
4. **Stubble-burning plume tracking** — fire detection + wind back-trajectory + Gaussian plume dispersion to predict where burning plumes will arrive and at what concentration.
5. **Vernacular voice-first accessibility** — removing literacy and app barriers for the most exposed citizens.

---

## 3. Target Personas & User Journeys

### Persona A — The Exposed Citizen

A gig-economy delivery worker, outdoor laborer, or elderly resident with limited literacy and a basic smartphone or feature phone (WhatsApp).

**Journey:** Sends a voice note in their dialect — *"Aaj bahar jaana theek hai kya, mujhe asthma hai"* ("Is it okay to go outside today, I have asthma"). Vaayu identifies their locality (via shared location or stated area), pulls the 24h hyperlocal forecast, cross-references their stated health condition against ICMR/WHO guidelines via RAG, and replies with a spoken, vernacular answer within ~3 seconds — e.g., recommending a mask, an indoor-hours window, or an immediate consultation if AQI is severe.

### Persona B — The Pollution Control / District Administration Officer

Stationed at a State Pollution Control Board (SPCB) or Commission for Air Quality Management (CAQM) desk, responsible for triggering GRAP measures and issuing public bulletins.

**Journey:** Opens a real-time dashboard showing:
- Live AQI hotspot map (ward-level)
- 72h forecast trajectory with confidence bands
- Atmospheric inversion strength index (current + predicted)
- Stubble-burning plume dispersion overlay
- Source-apportionment breakdown (stubble burning vs. vehicular vs. industrial vs. dust)
- Auto-classified predicted GRAP stage (I–IV) with drafted compliance action bulletin

The officer reviews the auto-drafted bulletin, edits if needed, and dispatches with one click.

### Persona C — The Researcher / Environmental Scientist

Interested in atmospheric dynamics — inversion layer behavior, aerosol–radiation feedback, plume transport modeling.

**Journey:** Accesses the dashboard's diagnostic view showing the two-way coupling loop: how the forecasting engine's predicted aerosol loading adjusted PBL height, how that adjustment changed dispersion, and the resulting forecast delta vs. an uncoupled baseline.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION LAYER                         │
│  [CPCB CCR] [SAFAR] [IMD/ERA5] [NASA FIRMS] [MODIS AOD]           │
│       │          │        │          │            │                  │
│       └──────────┴────────┴──────────┴────────────┘                 │
│                           │                                          │
│              Async Ingestion Workers (httpx + APScheduler)           │
│                           │                                          │
│              Feature Store (TimescaleDB, geo-indexed)                │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                   COUPLED FORECASTING ENGINE                         │
│                                                                      │
│   ┌───────────────────────────────────────────────────────┐         │
│   │  Step 1: Meteorology → Pollutant Dispersion           │         │
│   │  (GAT spatial encoder + TFT temporal encoder)          │         │
│   │  + Satellite AOD fusion (CNN) + Inversion Module       │         │
│   └──────────────────────┬────────────────────────────────┘         │
│                          │                                           │
│                          ▼                                           │
│   ┌───────────────────────────────────────────────────────┐         │
│   │  Step 2: Predicted Aerosol Load → Meteorology Feedback │         │
│   │  (Aerosol→PBL height, temperature, solar radiation     │         │
│   │   adjustment via learned feedback network)              │         │
│   └──────────────────────┬────────────────────────────────┘         │
│                          │                                           │
│                          ▼                                           │
│   ┌───────────────────────────────────────────────────────┐         │
│   │  Step 3: Refined Meteorology → Final Pollutant Forecast│         │
│   │  (Second-pass GAT+TFT with updated met. state)         │         │
│   └──────────────────────┬────────────────────────────────┘         │
│                          │                                           │
│     Outputs: PM2.5, PM10, O3, NOx forecasts (6h/24h/48h/72h)       │
│              Inversion Severity Index (0–1)                          │
│              Coupling Delta (vs. uncoupled baseline)                 │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────────────┐
          │                │                        │
          ▼                ▼                        ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────────────┐
│ Source           │ │ GRAP Stage   │ │ Plume Dispersion         │
│ Apportionment   │ │ Classifier   │ │ Tracker                  │
│ (Fire + Wind    │ │ (Hybrid      │ │ (FIRMS + Back-Trajectory │
│  Back-Traj +    │ │  Rule + ML)  │ │  + Gaussian Plume)       │
│  XGBoost)       │ │              │ │                          │
└────────┬────────┘ └──────┬───────┘ └──────────┬───────────────┘
         │                 │                     │
         └─────────────────┼─────────────────────┘
                           │
                           ▼
              FastAPI Core (async orchestration, SSE)
                           │
          ┌────────────────┼────────────────────────┐
          ▼                                          ▼
┌──────────────────────────┐       ┌──────────────────────────────┐
│ Citizen Voice Pipeline   │       │ Officer Dashboard            │
│ (IndicWhisper → Indic-   │       │ (Hotspot map, 72h forecast,  │
│  Trans2 → RAG over       │       │  inversion tracker, plume    │
│  ICMR/WHO corpus →       │       │  overlay, GRAP stage,        │
│  Llama-3 → Indic-TTS,    │       │  bulletin drafting,          │
│  streamed via SSE)        │       │  alert dispatch)             │
└──────────────────────────┘       └──────────────────────────────┘
```

> The citizen-facing and officer-facing paths share the **same forecasting and retrieval core**, ensuring the health advisory a citizen receives and the GRAP stage an officer sees are always derived from one consistent coupled forecast — not two divergent systems.

---

## 5. Functional Requirements Matrix

| ID | Module | Trigger | Core Engine | Deliverable |
|---|---|---|---|---|
| **REQ-F01** | Multi-Source Environmental Ingestion | Scheduled polling (15min–1hr) | Async httpx workers + Redis queue | Normalized, geo-timestamped pollutant + meteorological feature store |
| **REQ-F02** | Coupled Weather-Chemistry Forecasting | Feature store snapshot (every 1 hour) | GAT + TFT with iterative two-way coupling loop (2–3 steps) | 6h/24h/48h/72h pollutant-wise forecast per station, interpolated to ward-level grid |
| **REQ-F03** | Atmospheric Inversion Tracking | PBL height + temperature profile from ERA5/IMD | MLP-based inversion severity module | Real-time Inversion Severity Index (0–1) + predicted evolution over 72h |
| **REQ-F04** | Source Apportionment | AQI spike + fire/wind vectors | Fire clustering (DBSCAN) + back-trajectory + XGBoost classifier | % contribution: stubble burning / vehicular / industrial / dust / secondary aerosols |
| **REQ-F05** | Stubble-Burning Plume Dispersion | NASA FIRMS fire detections + wind fields | Forward Gaussian plume model under current meteorology + inversion state | Plume footprint overlay on map with predicted arrival time and concentration at Delhi NCR wards |
| **REQ-F06** | GRAP Stage Classification | Forecast AQI trajectory | Hybrid rule-based + ML classifier (XGBoost/RF) | Predicted GRAP stage (I–IV) + confidence score + auto-drafted compliance actions |
| **REQ-F07** | Multi-Dialect Voice Capture | Audio via mobile/WhatsApp (WAV/Opus) | Silero VAD + 16kHz PCM normalization | Clean, silence-stripped audio buffer |
| **REQ-F08** | Vernacular Transcription & Translation | Normalized PCM buffer | IndicWhisper + IndicTrans2 (distilled 200M) | Canonical English query preserving locality/symptom entities |
| **REQ-F09** | Personalized Health Advisory RAG | Canonical query + health profile + hyperlocal forecast | Hybrid BM25 + dense retrieval (RRF) over ICMR/WHO/NCAP corpus + Llama-3-8B synthesis | Grounded, individualized advisory with source citations |
| **REQ-F10** | Vernacular Speech Synthesis & Streaming | Generated advisory text | SSE token stream + Indic-TTS neural vocoder | Real-time streamed vernacular audio + text |
| **REQ-F11** | Officer Dashboard & Bulletin Dispatch | Aggregated forecast + GRAP classification + plume data | Dashboard aggregation service | Hotspot map, inversion tracker, plume overlay, forecast trajectories, draft public bulletins, one-click dispatch |

---

## 6. Algorithmic Novelty

> *This section addresses the SIH rubric criterion: Novelty & Originality (25 points)*

### 6.1 DL Surrogate for Coupled Weather-Chemistry Modeling

**The central innovation.** Full WRF-Chem simulations require HPC clusters and hours of compute per forecast cycle. Vaayu replaces the numerical solver with a **deep-learning surrogate** that captures the same two-way feedback physics:

```
Coupling Step 1:  Met. State (T, wind, PBL_h) ──────► GAT+TFT ──► Pollutant Forecast (PM2.5, O3, NOx)
                                                                          │
Coupling Step 2:  Predicted Aerosol Load ◄────────────────────────────────┘
                         │
                         ▼
                  Feedback Network ──► Adjusted PBL_h, T, Solar Radiation
                         │
Coupling Step 3:  Adjusted Met. State ──────► GAT+TFT ──► Refined Pollutant Forecast (Final)
```

The iterative coupling loop runs in **< 5 seconds** on a single GPU, vs. hours for WRF-Chem on a cluster. The system learns the feedback dynamics from historical ERA5 + CPCB co-occurring data rather than solving the underlying PDEs.

### 6.2 Explicit Atmospheric Inversion Module

A dedicated MLP head within the forecasting engine that:
- Takes PBL height, surface temperature, upper-air temperature gradient, wind speed, and humidity as inputs
- Outputs an **Inversion Severity Index (ISI, 0–1)** that quantifies how strongly the atmosphere is trapping pollutants
- The ISI **gates the graph message-passing** — high ISI suppresses spatial dispersion (pollutants stay trapped locally) while low ISI allows normal wind-driven transport
- This is what makes the model accurate during winter episodes when standard models fail most

### 6.3 Fire–Wind Plume Attribution Without HYSPLIT

Cross-referencing NASA FIRMS active-fire clusters with ERA5/IMD wind fields using a simplified Lagrangian back-trajectory computation (NumPy-based), avoiding the deployment complexity of NOAA's HYSPLIT system while providing actionable source attribution and forward plume dispersion estimates.

### 6.4 GRAP Auto-Classification with Action Drafting

Replacing manual, delayed inter-agency coordination with a forecast-grounded, ML-assisted GRAP stage trigger and a pre-drafted, regulation-compliant bulletin for human sign-off.

### 6.5 Personalized, Grounded Health Advisory via RAG

Retrieval-augmented generation constrained to ICMR/WHO/NCAP guideline text and the citizen's stated health profile — avoiding both generic "AQI is unhealthy" banners and unconstrained medical hallucination. Delivered in the user's native language via voice.

### 6.6 Vernacular Voice-First Accessibility

Removing literacy and app-navigation barriers for outdoor laborers, gig workers, and elderly citizens — the demographics most exposed to air pollution and least served by existing AQI apps.

---

## 7. Data Sources & Datasets

| Dataset / Feed | Source | Modality | Application |
|---|---|---|---|
| CPCB CCR Real-Time AQI | Central Pollution Control Board / data.gov.in | Station-level pollutant concentrations (PM2.5, PM10, NO2, SO2, O3, CO) | Live forecasting + training |
| SAFAR-India | IITM Pune | Gridded AQI + weather forecasts | Cross-validation baseline |
| MODIS/VIIRS Aerosol Optical Depth | NASA Earthdata | Satellite raster (GeoTIFF/HDF5) | Ward-level spatial interpolation, AOD fusion into forecasting graph |
| NASA FIRMS Active Fire Data | NASA | Geo-tagged fire detections + fire radiative power | Stubble-burning detection + source attribution |
| IMD Surface Observations | India Meteorological Department | Temperature, wind, humidity, pressure | Real-time meteorological input |
| ERA5 Reanalysis | ECMWF | 3D meteorological fields (including PBL height, wind at multiple levels) | Inversion modeling, back-trajectory computation, historical training |
| Air Quality Data in India (2015–2026) | Historical open dataset (data.gov.in / Kaggle) | Station time-series | Model pretraining / cold-start |
| ICMR & WHO Global Air Quality Guidelines (2021) | ICMR / WHO | Text corpus | RAG grounding for health advisory |
| NCAP City Action Plans + GRAP Rules | MoEFCC / CAQM | Text/PDF | GRAP action drafting reference + classifier training |

---

## 8. Technology Stack (Summary)

> *Full details in the companion document: [TECH_STACK.md](file:///c:/Users/Anant/Desktop/All%20Projects%20Btech/sih%20p2%202/TECH_STACK.md)*

| Layer | Key Technologies |
|---|---|
| **Data Ingestion** | httpx (async), APScheduler, Redis Streams, GeoPandas, xarray, TimescaleDB |
| **Forecasting Engine** | PyTorch, PyTorch Geometric (GAT), Temporal Fusion Transformer, ResNet-18 (satellite CNN), Custom Inversion Module |
| **Source Attribution** | XGBoost/LightGBM, DBSCAN, NumPy-based Lagrangian back-trajectory, Gaussian plume model |
| **GRAP Classifier** | XGBoost/RandomForest + hard-coded CAQM thresholds |
| **ASR** | IndicWhisper (ai4bharat/whisper-medium-indic) via faster-whisper (INT8) |
| **Translation** | IndicTrans2 distilled 200M (CTranslate2, INT8) |
| **RAG** | Qdrant + BM25 + BGE-Small embeddings + Llama-3-8B-Instruct (AWQ 4-bit, vLLM) |
| **TTS** | ai4bharat/indic-tts |
| **API** | FastAPI + Uvicorn + SSE |
| **Frontend** | React + Vite + Leaflet.js + Recharts |
| **Infra** | Docker Compose, NVIDIA CUDA 12.x, Prometheus + Grafana |

**All pretrained models are open-weight.** Total GPU VRAM: ~10–12 GB (single RTX 3060 / T4).

---

## 9. Non-Functional Requirements

| Requirement | Target | Measurement |
|---|---|---|
| **Forecast Inference Latency** | Full Delhi NCR grid, all pollutants, 4 horizons, including coupling loop | < 5 seconds per cycle (GPU) |
| **Time-to-First-Token (Advisory)** | From voice input received to first audio token streamed back | < 3 seconds (GPU), < 5 seconds (CPU fallback) |
| **PM2.5 Forecast Accuracy (24h)** | MAE at 24-hour horizon | < 20 ug/m3 |
| **PM2.5 Forecast Accuracy (72h)** | MAE at 72-hour horizon | < 30 ug/m3 |
| **Coupling Improvement** | Forecast MAE reduction vs. uncoupled baseline during inversion episodes | >= 15% improvement |
| **GRAP Classification Accuracy** | Agreement with historical CAQM stage-trigger decisions | >= 90% |
| **ASR Accuracy** | Word Error Rate across major Indic languages (Vistaar benchmark) | WER < 14% |
| **RAG Groundedness** | % of generated claims supported by retrieved ICMR/WHO context | >= 95% |
| **Throughput** | Concurrent citizen advisory requests per container | >= 50 |
| **Client Disconnect Handling** | Upstream generation cancellation after client disconnect | < 500 ms |

---

## 10. Evaluation Metrics

### 10.1 Forecast Error (Regression)

```
RMSE = sqrt( (1/n) * sum( (y_pred - y_actual)^2 ) )
MAE  = (1/n) * sum( |y_pred - y_actual| )
MAPE = (100/n) * sum( |y_pred - y_actual| / y_actual )
```

Reported per-pollutant (PM2.5, PM10, O3, NOx) and per-horizon (6h, 24h, 48h, 72h).

### 10.2 Coupling Impact Metric

```
Coupling Delta = MAE_uncoupled - MAE_coupled
```

Evaluated specifically on **winter inversion episodes** (October–February, ISI > 0.6) to demonstrate that the two-way feedback loop measurably improves accuracy during the periods that matter most.

### 10.3 GRAP Stage Classification

Standard Accuracy and macro-F1 against historical CAQM stage-trigger records.

### 10.4 Transcription (WER)

```
WER = (S + D + I) / N
```

where S = substitutions, D = deletions, I = insertions, N = total reference words.

### 10.5 RAG Quality

```
Context Relevance = |Sentences_relevant ∩ Sentences_retrieved| / |Sentences_retrieved|
Groundedness      = |Claims_supported_by_context| / |Total_claims_generated|
```

---

## 11. SIH Rubric Alignment

| Criterion | Weight | Vaayu's Coverage |
|---|---|---|
| **Novelty & Originality** | 25 pts | DL surrogate for WRF-Chem two-way coupling; explicit inversion module; fire-wind plume attribution without HYSPLIT; GRAP auto-classification |
| **Technical Feasibility** | 25 pts | All models are pretrained + open-weight; quantized inference fits 12 GB VRAM; async FastAPI; Docker Compose deployment |
| **Impact & Utility** | 20 pts | Serves under-monitored citizens via voice in native language + automates GRAP compliance for officers + tracks inversion/plume dynamics |
| **Working Prototype Depth** | 15 pts | Live ingestion from real APIs; actual model inference (not mocks); functional voice + dashboard front-ends |
| **Engineering Hygiene** | 15 pts | Pydantic validation, OpenAPI docs, Docker packaging, live benchmark dashboard (RMSE, WER, TTFT, Coupling Delta) |

---

## 12. 36-Hour Implementation Roadmap

### Hour 0–10: Data Foundation & Forecasting Engine

- [ ] Set up TimescaleDB feature store + async ingestion workers for CPCB, IMD, NASA FIRMS, MODIS
- [ ] Clean and align historical CPCB (2015–2026) + ERA5 reanalysis data
- [ ] Build station graph for Delhi NCR (nodes = CAAQMS stations, edges = distance + wind alignment)
- [ ] Implement GAT + TFT forecasting architecture in PyTorch
- [ ] Implement atmospheric inversion module (MLP on PBL height + temperature gradient)
- [ ] Implement two-way coupling loop (3-step iterative inference)
- [ ] Pretrain on historical data; evaluate vs. uncoupled baseline
- [ ] Index ICMR/WHO/NCAP corpus into Qdrant

### Hour 10–24: Intelligence Layer & API

- [ ] Implement source apportionment (FIRMS clustering + back-trajectory + XGBoost classifier)
- [ ] Implement Gaussian plume dispersion model for stubble-burning plumes
- [ ] Build GRAP stage classifier (rule layer + ML layer)
- [ ] Build FastAPI endpoints with Pydantic validation for all routes
- [ ] Implement RAG pipeline: hybrid retrieval (BM25 + dense, RRF) + Llama-3 synthesis with SSE streaming
- [ ] Implement voice pipeline: IndicWhisper → IndicTrans2 → RAG → Indic-TTS
- [ ] Set up Redis semantic caching for high-redundancy queries

### Hour 24–36: Interface Integration & Polish

- [ ] Build officer dashboard: hotspot map, 72h forecast charts, inversion tracker, plume overlay, GRAP status, bulletin drafting
- [ ] Build citizen web interface: voice input + audio/text advisory output
- [ ] Connect WhatsApp voice note pathway
- [ ] Deploy full stack via Docker Compose
- [ ] Build live benchmark dashboard (RMSE per horizon, Coupling Delta, WER, TTFT)
- [ ] Run end-to-end integration tests
- [ ] Record demo walkthrough

---

## 13. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| CPCB/IMD API downtime or rate limits | High | Local caching layer + last-known-good fallback forecasts; historical data for demo resilience |
| Forecasting model cold-start with sparse live data | Medium | Pretrain on 2015–2026 historical dataset before live fine-tuning |
| Two-way coupling loop instability | Medium | Gradient clipping + coupling-step-count cap (max 3 iterations); monotonic improvement validation |
| Health-advisory hallucination | High | Strict RAG grounding + groundedness scoring + mandatory "consult a doctor" disclaimer on high-risk outputs |
| ASR errors in noisy outdoor environments | Medium | Silero VAD pre-filtering + confidence-based re-prompt for low-confidence transcripts |
| GRAP misclassification triggering unwarranted action | High | Human-in-the-loop sign-off required before public bulletin dispatch; confidence thresholds |
| 12 GB VRAM insufficient for all models simultaneously | Low | Staggered loading; ASR/TTS loaded on-demand; forecasting model exported to ONNX for CPU fallback |

---

## 14. Verification Plan

### 14.1 Automated Tests

```bash
# Forecasting accuracy (historical holdout)
python -m pytest tests/test_forecasting.py --horizon 6,24,48,72 --metrics rmse,mae,mape

# Coupling improvement (inversion episodes only)
python -m pytest tests/test_coupling_delta.py --isi-threshold 0.6

# GRAP classifier accuracy
python -m pytest tests/test_grap_classifier.py --metrics accuracy,f1

# RAG groundedness
python -m pytest tests/test_rag_groundedness.py --threshold 0.95

# ASR WER
python -m pytest tests/test_asr_wer.py --languages hi,ta,te,bn,mr

# API latency
python -m pytest tests/test_latency.py --ttft-max 3.0 --forecast-max 5.0
```

### 14.2 Manual Verification

- Live demo: submit voice query in Hindi → receive spoken advisory → verify forecast consistency with dashboard
- Dashboard: verify hotspot map updates, 72h trajectory renders, plume overlay animates correctly
- GRAP: compare classifier output against 10 historical CAQM decisions
- Inversion: verify ISI tracks known winter inversion episodes from ERA5 historical data

---

## 15. Future Scope

- **Full WRF-Chem integration** — use DL surrogate as fast-mode forecasting with periodic WRF-Chem runs for calibration
- **Indoor air quality estimation** via IoT sensor integration
- **Occupational exposure tracking** for outdoor gig/construction workers via wearable integration
- **Cross-border airshed modeling** (Indo-Gangetic Plain) incorporating Pakistani and Nepali monitoring feeds
- **Multi-city expansion** — retraining the graph neural network for Mumbai, Kolkata, Lucknow
- **ABHA integration** — longitudinal exposure-health correlation via Ayushman Bharat Health Account, subject to DPDP-compliant consent flows
- **Ensemble forecasting** — multiple coupling-loop initializations for probabilistic AQI forecasts with uncertainty quantification

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **AQI** | Air Quality Index — composite metric of air pollution severity |
| **CAAQMS** | Continuous Ambient Air Quality Monitoring Station |
| **CAQM** | Commission for Air Quality Management in NCR and Adjoining Areas |
| **CPCB** | Central Pollution Control Board |
| **ERA5** | ECMWF's 5th generation atmospheric reanalysis dataset |
| **FIRMS** | Fire Information for Resource Management System (NASA) |
| **GAT** | Graph Attention Network |
| **GRAP** | Graded Response Action Plan |
| **ISI** | Inversion Severity Index (Vaayu-defined, 0–1 scale) |
| **MODIS AOD** | Moderate Resolution Imaging Spectroradiometer Aerosol Optical Depth |
| **PBL** | Planetary Boundary Layer — the lowest part of the atmosphere directly influenced by the Earth's surface |
| **RAG** | Retrieval-Augmented Generation |
| **TFT** | Temporal Fusion Transformer |
| **WRF-Chem** | Weather Research and Forecasting model coupled with Chemistry |

---

## Appendix B: Key Differentiators vs. Existing Solutions

| Feature | SAFAR | AirVisual / IQAir | Vaayu |
|---|---|---|---|
| Coupled weather-chemistry feedback | No | No | **Yes (DL surrogate, 3-step coupling loop)** |
| Atmospheric inversion tracking | Partial (manual) | No | **Yes (real-time ISI with 72h forecast)** |
| Stubble-burning plume dispersion | No | No | **Yes (FIRMS + back-traj + Gaussian plume)** |
| Hyperlocal (ward-level) | City-level | Station-level | **Ward-level (GNN interpolation)** |
| Source apportionment | No | No | **Yes (fire/wind/XGBoost)** |
| GRAP auto-classification | No | No | **Yes (hybrid rule + ML)** |
| Vernacular voice advisory | No | No | **Yes (12+ Indic languages)** |
| Personalized health guidance | No | Generic | **Yes (RAG over ICMR/WHO + health profile)** |
| Self-hostable / Sovereign | No (proprietary) | No (cloud SaaS) | **Yes (all open-weight models)** |

---

*End of PRD v2.0*
