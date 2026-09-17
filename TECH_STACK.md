# Vaayu — Technology Stack Reference

> **Last Updated:** September 2026
> **Focus:** ML / DL / NLP Pipeline with Coupled Weather-Chemistry Forecasting

---

## 1. Stack Philosophy

| Principle | Rationale |
|---|---|
| **Pretrained-first** | Leverage existing open-weight models (IndicWhisper, IndicTrans2, Llama-3) and fine-tune only where domain-specific accuracy demands it |
| **Sovereign & Self-Hostable** | No dependency on proprietary cloud APIs — all models run locally via quantized inference |
| **Async-native** | Every I/O-bound path (API polling, model inference, streaming) is non-blocking |
| **ML/DL/NLP Core** | The competitive edge is in the forecasting, attribution, and advisory intelligence — not in frontend chrome |

---

## 2. Layer-by-Layer Breakdown

### 2.1 Data Ingestion & Feature Engineering

| Component | Technology | Version / Variant | Purpose |
|---|---|---|---|
| **HTTP Client** | `httpx` (async) | `>=0.27.0` | Non-blocking polling of CPCB CCR, SAFAR, IMD, NASA FIRMS APIs |
| **Scheduler** | `APScheduler` | `>=3.10` | Cron-based periodic ingestion (every 15 min for CPCB, hourly for satellite) |
| **Message Queue** | `Redis Streams` | `>=7.2` | Decouple ingestion workers from downstream processing; back-pressure handling |
| **Geospatial Processing** | `GeoPandas` + `Shapely` + `rasterio` | latest stable | Ward-level polygon operations, satellite raster (MODIS AOD) cropping/reprojection |
| **Numerical Processing** | `NumPy` + `Pandas` + `xarray` | latest stable | Time-series alignment, NetCDF/GRIB meteorological data handling |
| **Feature Store** | `PostgreSQL` + `TimescaleDB` extension | PG 16 + TimescaleDB 2.x | Hypertable-backed geo-timestamped feature store with automatic partitioning |

#### Data Sources

| Feed | Provider | Format | Polling Frequency | Key Variables |
|---|---|---|---|---|
| CPCB CCR Real-Time | Central Pollution Control Board | JSON API | Every 15 min | PM2.5, PM10, NO2, SO2, O3, CO per station |
| SAFAR-India | IITM Pune | JSON/XML | Every 30 min | Gridded AQI, weather forecast cross-validation |
| IMD Surface Obs + ERA5 Reanalysis | IMD / ECMWF | GRIB / NetCDF | Hourly | Temperature, wind (u/v), humidity, PBL height, pressure |
| MODIS/VIIRS AOD (MCD19A2) | NASA Earthdata | HDF5 / GeoTIFF | Daily (satellite pass) | Aerosol Optical Depth for spatial interpolation |
| NASA FIRMS Active Fire | NASA | CSV / GeoJSON | Every 3 hours | Fire radiative power, geo-coordinates (stubble burn detection) |
| Historical AQI (2015-2026) | data.gov.in / Kaggle | CSV | One-time bulk load | Model pretraining dataset |

---

### 2.2 Coupled Weather-Chemistry Forecasting Engine (Core ML/DL)

This is the **algorithmic heart** of Vaayu — a deep-learning surrogate that emulates coupled meteorology-chemistry interactions (inspired by WRF-Chem physics) without the computational cost of running a full numerical weather prediction model.

#### 2.2.1 Architecture: Spatio-Temporal Graph Neural Network

| Sub-Component | Model / Technique | Details |
|---|---|---|
| **Spatial Encoder** | Graph Attention Network (GAT) | Nodes = CAAQMS monitoring stations + virtual grid points; edges weighted by geographic distance + wind-vector alignment. Captures spatial pollution dispersion patterns. |
| **Temporal Encoder** | Temporal Fusion Transformer (TFT) | Per-node multi-horizon forecasting (6h / 24h / 48h / 72h). Handles known future inputs (forecast meteorology) vs. observed past inputs (pollutant readings). |
| **Satellite Fusion** | CNN Feature Extractor (ResNet-18 backbone, pretrained on ImageNet) | Encodes MODIS AOD raster patches into feature vectors fused into the graph via virtual satellite nodes |
| **Atmospheric Inversion Module** | Custom MLP head on PBL height + temperature gradient features | Explicitly models inversion layer strength; outputs inversion severity index (0-1) that gates pollutant trapping vs. dispersion in the graph message-passing step |
| **Two-Way Feedback Loop** | Iterative inference (2-3 coupling steps per forecast cycle) | Step 1: Meteorology drives pollutant dispersion. Step 2: Predicted aerosol loading adjusts PBL height / temperature / solar radiation. Step 3: Refined meteorology yields final pollutant forecast. Emulates WRF-Chem online coupling. |

#### 2.2.2 ML Framework & Libraries

| Library | Version | Role |
|---|---|---|
| `PyTorch` | `>=2.3.0` | Core deep learning framework |
| `PyTorch Geometric (PyG)` | `>=2.5.0` | Graph neural network layers (GATConv, TransformerConv) |
| `PyTorch Geometric Temporal` | `>=0.54` | Temporal graph network utilities, snapshot handling |
| `pytorch-forecasting` | `>=1.0.0` | TFT implementation, multi-horizon training utilities |
| `torchvision` | `>=0.18.0` | ResNet backbone for satellite CNN encoder |
| `scikit-learn` | `>=1.4.0` | Preprocessing (StandardScaler, KNN imputation), evaluation metrics |
| `ONNX Runtime` | `>=1.18.0` | Optimized inference export for production serving |

#### 2.2.3 Training Strategy

```
Phase 1 — Pretraining (Historical)
  Dataset: CPCB 2015-2026 hourly data + ERA5 reanalysis
  Duration: ~50 epochs on full Delhi NCR station graph
  Loss: Huber loss (robust to AQI spike outliers)
  Output: Base forecasting weights

Phase 2 — Fine-Tuning (Seasonal)
  Dataset: October-February winter episodes (stubble-burning peak)
  Augmentation: Inject synthetic inversion scenarios from ERA5 PBL profiles
  Focus: Improve accuracy during high-pollution, low-PBL episodes
  Output: Season-specific adapter weights

Phase 3 — Online Adaptation (Live)
  Strategy: Sliding-window retraining (last 7 days) every 6 hours
  Guard: Forecast drift detection via CUSUM on rolling MAE
  Output: Continuously calibrated model
```

---

### 2.3 Source Apportionment & Stubble-Burning Plume Tracking

| Component | Technique | Details |
|---|---|---|
| **Fire Detection** | NASA FIRMS hotspot clustering (DBSCAN) | Identifies active stubble-burning clusters in Punjab/Haryana/Western UP |
| **Wind Back-Trajectory** | Simplified Lagrangian particle dispersion (NumPy-based) | Traces air parcel paths backward from Delhi NCR using ERA5/IMD wind fields at multiple pressure levels; avoids full HYSPLIT dependency |
| **Attribution Classifier** | Gradient Boosted Trees (XGBoost / LightGBM) | Input: fire cluster proximity, wind alignment score, inversion strength, time-of-year features. Output: % contribution breakdown — stubble burning / vehicular / industrial / construction dust / secondary aerosols |
| **Plume Dispersion Visualization** | Gaussian plume model overlay on map | Forward-projected plume footprint under current wind + inversion conditions, rendered on the dashboard |

**Libraries:** `xgboost>=2.0`, `lightgbm>=4.3`, `scikit-learn`, `scipy` (for trajectory integration)

---

### 2.4 GRAP Stage Classification

| Aspect | Detail |
|---|---|
| **Model** | Hybrid rule-based + ML classifier |
| **Rules Layer** | Hard-coded CAQM threshold triggers (PM2.5 rolling averages for Stage I-IV) as baseline |
| **ML Layer** | Random Forest / XGBoost trained on historical CAQM stage-trigger records vs. concurrent AQI trajectories |
| **Input Features** | 72h forecast trajectory, rate-of-change, inversion severity index, fire attribution score, day-of-week |
| **Output** | Predicted GRAP stage (I-IV) + confidence score + auto-drafted action checklist |
| **Accuracy Target** | >= 90% agreement with historical CAQM decisions |

---

### 2.5 NLP & Voice Pipeline (Vernacular Health Advisory)

#### 2.5.1 Speech-to-Text (ASR)

| Component | Model | Details |
|---|---|---|
| **Voice Activity Detection** | `Silero VAD` (pretrained) | Strips silence, detects speech segments; runs on CPU |
| **Audio Preprocessing** | `torchaudio` / `librosa` | Resample to 16kHz mono PCM, noise normalization |
| **ASR Model** | `ai4bharat/whisper-medium-indic` (IndicWhisper) | Fine-tuned Whisper-medium on Indic languages; supports Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese + English code-mix |
| **Inference** | `faster-whisper` (CTranslate2 backend) | INT8 quantized inference; ~3x faster than vanilla Whisper |

#### 2.5.2 Translation

| Component | Model | Details |
|---|---|---|
| **Indic to English** | `ai4bharat/indictrans2-indic-en-dist-200M` | Distilled 200M parameter model; covers 22 scheduled languages |
| **English to Indic** | `ai4bharat/indictrans2-en-indic-dist-200M` | For translating generated advisory back to user's language |
| **Inference** | CTranslate2 / ONNX Runtime | INT8 quantized for low-latency serving |

#### 2.5.3 Retrieval-Augmented Generation (RAG)

| Component | Technology | Details |
|---|---|---|
| **Document Corpus** | ICMR Guidelines, WHO Global AQI Guidelines (2021), NCAP City Action Plans, CPCB health advisories | Chunked, embedded, and indexed |
| **Embedding Model** | `BAAI/bge-small-en-v1.5` (pretrained) | 384-dim dense embeddings; fast, accurate retrieval |
| **Vector Store** | `Qdrant` (self-hosted) | HNSW-indexed dense retrieval with payload filtering |
| **Sparse Retrieval** | BM25 via `rank_bm25` or Qdrant sparse vectors | Keyword-level precision for medical terms |
| **Fusion** | Reciprocal Rank Fusion (RRF) | Merges dense + sparse results for hybrid retrieval |
| **Generative LLM** | `meta-llama/Meta-Llama-3-8B-Instruct` | AWQ 4-bit quantized; grounded synthesis with citations |
| **LLM Serving** | `vLLM` | PagedAttention, continuous batching, OpenAI-compatible API |
| **Guardrails** | Prompt-level constraints + groundedness scoring | Mandatory medical disclaimer; no claims unsupported by retrieved context |

#### 2.5.4 Text-to-Speech (TTS)

| Component | Model | Details |
|---|---|---|
| **TTS Engine** | `ai4bharat/indic-tts` | Neural vocoder-based; supports major Indic languages |
| **Streaming** | Chunked audio generation via SSE | Streams audio as advisory text is generated token-by-token |

---

### 2.6 Backend API & Orchestration

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | FastAPI | `>=0.111.0` | Async REST + SSE endpoints; Pydantic v2 request/response validation |
| **ASGI Server** | Uvicorn | `uvicorn[standard]>=0.29.0` | Production server with uvloop + httptools |
| **SSE Streaming** | `sse-starlette` | `>=2.1.0` | Real-time token + audio streaming to frontend |
| **Task Queue** | `Celery` + `Redis` | latest stable | Heavy inference tasks (model retraining, batch forecasting) |
| **Caching** | `Redis` | `>=7.2` | Semantic query caching (embeddings similarity), forecast result caching |
| **API Documentation** | Auto-generated OpenAPI (Swagger UI) | built-in | Self-documenting API for judges |

#### Key API Endpoints

```
POST   /api/v1/forecast          -> 72h AQI forecast for a location
GET    /api/v1/forecast/grid     -> Full Delhi NCR grid forecast (SSE stream)
POST   /api/v1/advisory/voice    -> Voice input, personalized health advisory (SSE audio stream)
POST   /api/v1/advisory/text     -> Text input, personalized health advisory
GET    /api/v1/attribution       -> Source apportionment breakdown
GET    /api/v1/grap/status       -> Current + predicted GRAP stage
GET    /api/v1/inversion         -> Atmospheric inversion strength index
GET    /api/v1/plume/trajectory  -> Stubble-burning plume dispersion forecast
POST   /api/v1/bulletin/draft    -> Auto-drafted GRAP compliance bulletin
WebSocket /ws/dashboard          -> Real-time dashboard data stream
```

---

### 2.7 Frontend & Visualization

| Component | Technology | Purpose |
|---|---|---|
| **Dashboard Framework** | React.js + Vite | Officer-facing real-time dashboard |
| **Mapping** | Leaflet.js + OpenStreetMap tiles | Hotspot maps, plume visualization, ward-level AQI heatmaps |
| **Charts** | Recharts / Chart.js | 72h forecast trajectory plots, inversion strength timelines |
| **Real-time Updates** | SSE / WebSocket client | Live forecast + alert streaming |
| **Citizen Interface** | WhatsApp Business API / Simple responsive web page | Voice note input + audio/text advisory output |
| **Styling** | Vanilla CSS + CSS Variables (design tokens) | Clean, professional dashboard aesthetic |

> **Note:** Frontend is intentionally lightweight — the competitive edge is the ML/NLP backend, not the UI framework.

---

### 2.8 Infrastructure & DevOps

| Component | Technology | Purpose |
|---|---|---|
| **Containerization** | Docker + Docker Compose | Reproducible multi-service deployment |
| **GPU Inference** | NVIDIA CUDA 12.x + cuDNN | LLM + forecasting model acceleration |
| **Model Serving** | vLLM (LLM) + ONNX Runtime (ASR/Translation/Forecasting) | Optimized inference across all model types |
| **Monitoring** | Prometheus + Grafana | Inference latency, throughput, forecast accuracy drift |
| **Logging** | Python `structlog` (JSON, stdout) | Structured, container-native logging |
| **Version Control** | Git + GitHub | Source code + model config versioning |
| **Model Registry** | Local filesystem / MLflow (optional) | Model weights + metadata tracking |

---

## 3. Pretrained Models Summary

All models below are **open-weight** and can be downloaded from HuggingFace / AI4Bharat repositories.

| Model | HuggingFace ID / Source | Parameters | Quantization | GPU VRAM |
|---|---|---|---|---|
| IndicWhisper (ASR) | `ai4bharat/whisper-medium-indic` | ~769M | INT8 (CTranslate2) | ~2 GB |
| IndicTrans2 Indic-En | `ai4bharat/indictrans2-indic-en-dist-200M` | 200M | INT8 (CTranslate2) | ~1 GB |
| IndicTrans2 En-Indic | `ai4bharat/indictrans2-en-indic-dist-200M` | 200M | INT8 (CTranslate2) | ~1 GB |
| Llama-3-8B-Instruct | `meta-llama/Meta-Llama-3-8B-Instruct` | 8B | AWQ 4-bit | ~5 GB |
| BGE-Small Embeddings | `BAAI/bge-small-en-v1.5` | 33M | FP32 | ~0.2 GB |
| Silero VAD | `snakers4/silero-vad` | ~2M | FP32 (CPU) | CPU only |
| ResNet-18 (Satellite CNN) | `torchvision.models.resnet18` | 11M | FP32 | ~0.1 GB |
| Indic-TTS | `ai4bharat/indic-tts` | varies by language | FP32 | ~1 GB |

**Total estimated VRAM:** ~10-12 GB (fits on a single RTX 3060 / T4 / A10 GPU)

---

## 4. Python Environment (Core Dependencies)

```txt
# --- API & Server ---
fastapi>=0.111.0
uvicorn[standard]>=0.29.0
sse-starlette>=2.1.0
pydantic>=2.7.0
python-multipart>=0.0.9

# --- ML / DL ---
torch>=2.3.0
torchvision>=0.18.0
torchaudio>=2.3.0
torch-geometric>=2.5.0
pytorch-forecasting>=1.0.0
scikit-learn>=1.4.0
xgboost>=2.0.0
lightgbm>=4.3.0
onnxruntime-gpu>=1.18.0

# --- NLP / Speech ---
faster-whisper>=1.0.0
ctranslate2>=4.0.0
rank-bm25>=0.2.2
qdrant-client>=1.9.0
vllm>=0.4.0
transformers>=4.40.0
sentence-transformers>=2.7.0

# --- Data & Geo ---
numpy>=1.26.0
pandas>=2.2.0
xarray>=2024.3.0
geopandas>=0.14.0
shapely>=2.0.0
rasterio>=1.3.0
netCDF4>=1.6.0
h5py>=3.10.0

# --- Infra ---
httpx>=0.27.0
redis>=5.0.0
celery>=5.4.0
apscheduler>=3.10.0
structlog>=24.1.0
prometheus-client>=0.20.0

# --- Audio ---
librosa>=0.10.0
soundfile>=0.12.0

# --- Visualization ---
matplotlib>=3.8.0
seaborn>=0.13.0
folium>=0.16.0
```

---

## 5. Docker Compose Service Map

```yaml
services:
  api:          # FastAPI + Uvicorn (main orchestrator)
  forecaster:   # PyTorch model server (GAT+TFT inference)
  llm:          # vLLM server (Llama-3-8B-Instruct)
  asr:          # faster-whisper + IndicWhisper
  translator:   # IndicTrans2 (CTranslate2)
  tts:          # Indic-TTS server
  rag:          # Embedding + retrieval service
  qdrant:       # Vector database
  redis:        # Cache + message queue
  postgres:     # TimescaleDB feature store
  worker:       # Celery workers (ingestion, retraining)
  dashboard:    # React frontend (nginx-served)
  prometheus:   # Metrics collection
  grafana:      # Monitoring dashboard
```

---

## 6. Hardware Requirements

| Tier | CPU | RAM | GPU | Storage | Use Case |
|---|---|---|---|---|---|
| **Development** | 8-core | 32 GB | 1x RTX 3060 (12 GB) | 100 GB SSD | Local development + testing |
| **SIH Demo** | 8-core | 32 GB | 1x T4/A10 (16 GB) | 200 GB SSD | Live demo with all services |
| **Production** | 16-core | 64 GB | 1x A100 (40 GB) or 2x T4 | 500 GB SSD | Full city-scale deployment |

---

*This stack is designed for a team comfortable with ML/DL/NLP — every component above can be implemented, fine-tuned, and debugged with standard PyTorch + HuggingFace workflows.*
