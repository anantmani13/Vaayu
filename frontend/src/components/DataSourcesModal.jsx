import React, { useState } from 'react';
import { Database, ExternalLink, ShieldCheck, Clock, Radio, Server, CheckCircle2, X, Filter, Activity, Satellite, BookOpen } from 'lucide-react';

export default function DataSourcesModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('all');

  if (!isOpen) return null;

  const dataStreams = [
    {
      id: "cpcb",
      name: "CPCB CAAQMS Network (Delhi NCR)",
      authority: "Central Pollution Control Board (CPCB) / MoEFCC",
      category: "ground",
      badge: "Statutory Ground Baseline",
      parameter: "PM2.5, PM10, NO₂, SO₂, CO, O₃ (40 Fixed Stations)",
      frequency: "Hourly continuous telemetry (published at XX:00)",
      latency: "< 15 minutes post-observation",
      sensorTech: "Beta Attenuation Monitor (BAM-1020) & UV Photometry",
      verificationUrl: "https://app.cpcbccr.com/AQI_India/",
      verificationText: "Official CPCB National AQI Portal",
      mandateRole: "Statutory baseline for CAQM GRAP enforcement and legal compliance across Delhi NCR."
    },
    {
      id: "waqi",
      name: "WAQI / AQICN Global & Ground Telemetry Stream",
      authority: "World Air Quality Index Project (waqi.info) & Global Environmental Observatories",
      category: "ground",
      badge: "Physical Box Telemetry + Dual AQI",
      parameter: "Continuous PM2.5, PM10, NO₂, SO₂, CO, O₃, Station Ambient Temperature, Relative Humidity, Wind Vector & US-EPA AQI",
      frequency: "Live REST API bounds & hub ingestion with 15-minute smart caching (900s TTL)",
      latency: "< 5 minutes post-sensor cycle",
      sensorTech: "Direct physical CAAQMS station boxes: Beta Attenuation Monitors, Optical Particle Counters (OPC), Electrochemical gas cells",
      verificationUrl: "https://aqicn.org/city/delhi/",
      verificationText: "Official WAQI Delhi Telemetry Portal",
      mandateRole: "Primary physical ground monitor ingest engine across all 40 CAAQMS hubs in Delhi NCR. Powers live dual-standard AQI (Indian CPCB NAQI & US-EPA AQI) and 3-tier resilient fallback cascade."
    },
    {
      id: "openmeteo",
      name: "Open-Meteo High-Resolution Atmospheric Service",
      authority: "ECMWF (IFS) & NOAA (GFS) Numerical Weather Prediction",
      category: "atmosphere",
      badge: "Boundary Layer & Wind Vectors",
      parameter: "Boundary Layer (PBL) Height, 10m Wind Vectors (u, v), Temperature, Relative Humidity, Solar Irradiance",
      frequency: "Hourly 72h forward projection (Assimilated 4x daily at 00, 06, 12, 18 UTC)",
      latency: "Real-time API stream",
      sensorTech: "Global Atmospheric Forecast Models (IFS 9km / GFS 13km)",
      verificationUrl: "https://open-meteo.com/en/docs",
      verificationText: "Open-Meteo NWP Documentation",
      mandateRole: "Provides primary boundary layer height and wind vector fields driving two-way thermal inversion coupling."
    },
    {
      id: "cams",
      name: "Copernicus Atmosphere Monitoring Service (CAMS)",
      authority: "European Centre for Medium-Range Weather Forecasts (ECMWF)",
      category: "atmosphere",
      badge: "Chemical Transport Trajectory",
      parameter: "Photochemical precursors (NO₂, Tropospheric Ozone O₃, Volatile Organic Compounds)",
      frequency: "Hourly forward chemical transport trajectory",
      latency: "Sub-hourly forecast synchronization",
      sensorTech: "Sentinel-5P TROPOMI satellite assimilation & CAMS Eulerian chemical transport",
      verificationUrl: "https://atmosphere.copernicus.eu/",
      verificationText: "Copernicus CAMS European Service",
      mandateRole: "Drives dynamic diurnal NO₂ photolysis and afternoon secondary ozone generation."
    },
    {
      id: "firms",
      name: "NASA FIRMS Thermal Anomalies (Active Stubble Fires)",
      authority: "NASA Earth Science Data and Information System (ESDIS)",
      category: "satellite",
      badge: "375m Satellite Fire Radiances",
      parameter: "Agricultural Stubble Burning, Coordinates, Fire Radiative Power (FRP in MW)",
      frequency: "Every 12 hours (Suomi-NPP & NOAA-20 polar overpasses)",
      latency: "~3 hours from satellite scan to detection ingest",
      sensorTech: "VIIRS (Visible Infrared Imaging Radiometer Suite) 375m high-resolution nadir channels",
      verificationUrl: "https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@76.0,30.0,8z",
      verificationText: "NASA FIRMS Live Fire Map",
      mandateRole: "Direct source emission inputs for 72h Gaussian smoke plume forward trajectory dispersion and angular divergence tracking."
    },
    {
      id: "icmr",
      name: "ICMR & AIIMS Clinical Advisory Knowledge Corpus",
      authority: "Indian Council of Medical Research & AIIMS Pulmonology",
      category: "clinical",
      badge: "Verified Medical Knowledge Grounding",
      parameter: "Grounded medical protocols for asthma, COPD, pediatrics, geriatrics, cardiovascular risks",
      frequency: "Version-controlled clinical rulebook",
      latency: "Real-time Retrieval-Augmented Generation (RAG) vector grounding",
      sensorTech: "Clinical epidemiology & verified ICMR respiratory action frameworks",
      verificationUrl: "https://main.icmr.nic.in/",
      verificationText: "ICMR Official Portal",
      mandateRole: "Guarantees zero-hallucination vernacular health guidance delivered in Hindi and English."
    }
  ];

  const categoryFilters = [
    { id: 'all', label: 'All Feeds (6)' },
    { id: 'ground', label: 'Ground Sensors (CPCB / WAQI)' },
    { id: 'atmosphere', label: 'Atmosphere (Open-Meteo & CAMS)' },
    { id: 'satellite', label: 'Satellite (NASA FIRMS)' },
    { id: 'clinical', label: 'Clinical (ICMR / AIIMS)' }
  ];

  const filteredStreams = activeCategory === 'all'
    ? dataStreams
    : dataStreams.filter(d => d.category === activeCategory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={24} color="var(--accent-health)" />
            <div>
              <h3 className="heading-serif" style={{ fontSize: '1.6rem', margin: 0 }}>Data Provenance & Official Sources</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                6 Primary Scientific, Statutory & Real-Time Global Telemetry Streams
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          Vaayu continuously ingests from <strong>6 verified scientific, statutory, and global observational streams</strong> — including direct physical ground sensor telemetry via <strong>CPCB</strong> and <strong>WAQI / AQICN</strong>, atmospheric boundary layer fields from <strong>Open-Meteo</strong>, chemical trajectories from <strong>Copernicus CAMS</strong>, satellite fire radiative power from <strong>NASA FIRMS</strong>, and medical guidance grounded in <strong>ICMR / AIIMS</strong> protocols.
        </p>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="btn-zen"
              style={{
                fontSize: '0.72rem',
                padding: '4px 10px',
                background: activeCategory === cat.id ? 'var(--color-surface-elevated)' : 'transparent',
                borderColor: activeCategory === cat.id ? 'var(--accent-health)' : 'var(--color-border)',
                color: activeCategory === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeCategory === cat.id ? 600 : 400
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Feeds List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredStreams.map((ds, idx) => (
            <div key={ds.id} style={{ 
              padding: '14px 16px', 
              background: 'var(--color-surface-elevated)', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--color-border)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="mono" style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)' }}>
                      FEED #{dataStreams.findIndex(s => s.id === ds.id) + 1}
                    </span>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{ds.name}</strong>
                    <span style={{ fontSize: '0.625rem', padding: '1px 6px', borderRadius: '3px', background: 'rgba(76, 175, 80, 0.15)', color: 'var(--aqi-good)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                      {ds.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {ds.authority}
                  </div>
                </div>

                <a 
                  href={ds.verificationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-zen"
                  style={{ fontSize: '0.6875rem', padding: '4px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={12} /> {ds.verificationText}
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px', fontSize: '0.75rem', margin: '10px 0', padding: '10px', background: 'var(--color-surface)', borderRadius: '4px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Parameters: </span>
                  <strong>{ds.parameter}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Sensor Technology: </span>
                  <span>{ds.sensorTech}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Frequency: </span>
                  <span>{ds.frequency}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Ingestion Latency: </span>
                  <span className="mono" style={{ color: 'var(--aqi-good)' }}>{ds.latency}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Role in Vaayu: </span>
                {ds.mandateRole}
              </div>
            </div>
          ))}
        </div>

        {/* Step-by-step Audit Instructions */}
        <div style={{ marginTop: '20px', padding: '14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="var(--aqi-good)" /> Step-by-Step Data Audit Instructions
          </h4>
          <ol style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.7 }}>
            <li>
              <strong>Verify live ground station telemetry via WAQI / AQICN:</strong> Open <a href="https://aqicn.org/city/delhi/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-health)', textDecoration: 'underline' }}>WAQI Delhi Portal</a>, find your station (e.g. <em>Punjabi Bagh</em>, <em>Anand Vihar</em>, or <em>Mandir Marg</em>), and compare the physical PM2.5 (µg/m³) and US AQI readings with Vaayu's dual-standard badges.
            </li>
            <li>
              <strong>Verify statutory Indian AQI via CPCB:</strong> Open <a href="https://app.cpcbccr.com/AQI_India/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-health)', textDecoration: 'underline' }}>CPCB National Portal</a>, select Delhi and your monitoring station, and compare against the Indian NAQI badge in Vaayu.
            </li>
            <li>
              <strong>Verify regional crop residue fires via NASA:</strong> Open <a href="https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@76.0,30.0,8z" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-health)', textDecoration: 'underline' }}>NASA FIRMS Live Fire Map</a>, activate the VIIRS 375m layer, and cross-reference active thermal anomalies in Punjab/Haryana against our 72h plume map.
            </li>
            <li>
              <strong>Inspect live atmospheric boundary layer height:</strong> Check Open-Meteo numerical weather prediction stream at coordinate (28.61, 77.20) to confirm PBL contraction and thermal inversion values.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
