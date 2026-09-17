import React from 'react';
import { Database, ExternalLink, ShieldCheck, Clock, Radio, Server, CheckCircle2, X } from 'lucide-react';

export default function DataSourcesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const dataStreams = [
    {
      name: "CPCB CAAQMS Network (Delhi NCR)",
      authority: "Central Pollution Control Board (CPCB) / MoEFCC",
      parameter: "PM2.5, PM10, NO₂, SO₂, CO, O₃ (40 Fixed Stations)",
      frequency: "Hourly continuous telemetry (published at XX:00)",
      latency: "< 15 minutes post-observation",
      sensorTech: "Beta Attenuation Monitor (BAM-1020) & UV Photometry",
      verificationUrl: "https://app.cpcbccr.com/AQI_India/",
      verificationText: "Official CPCB National AQI Portal",
      mandateRole: "Statutory baseline for CAQM GRAP enforcement and legal compliance"
    },
    {
      name: "Open-Meteo High-Resolution Atmospheric Service",
      authority: "ECMWF (IFS) & NOAA (GFS) Numerical Weather Prediction",
      parameter: "Boundary Layer (PBL) Height, 10m Wind Vectors (u, v), Temperature, Relative Humidity, Solar Irradiance",
      frequency: "Hourly 72h forward projection (Assimilated 4x daily at 00, 06, 12, 18 UTC)",
      latency: "Real-time API stream",
      sensorTech: "Global Atmospheric Forecast Models (IFS 9km / GFS 13km)",
      verificationUrl: "https://open-meteo.com/en/docs",
      verificationText: "Open-Meteo NWP Documentation",
      mandateRole: "Provides primary boundary layer and wind vector fields driving two-way thermal inversion coupling"
    },
    {
      name: "Copernicus Atmosphere Monitoring Service (CAMS)",
      authority: "European Centre for Medium-Range Weather Forecasts (ECMWF)",
      parameter: "Photochemical precursors (NO₂, Tropospheric Ozone O₃, Volatile Organic Compounds)",
      frequency: "Hourly forward chemical transport trajectory",
      latency: "Sub-hourly forecast synchronization",
      sensorTech: "Sentinel-5P TROPOMI satellite assimilation & CAMS Eulerian chemical transport",
      verificationUrl: "https://atmosphere.copernicus.eu/",
      verificationText: "Copernicus CAMS European Service",
      mandateRole: "Drives dynamic diurnal NO₂ photolysis and afternoon secondary ozone generation"
    },
    {
      name: "NASA FIRMS Thermal Anomalies (Active Fires)",
      authority: "NASA Earth Science Data and Information System (ESDIS)",
      parameter: "Agricultural Stubble Burning, Coordinates, Fire Radiative Power (FRP in MW)",
      frequency: "Every 12 hours (Suomi-NPP & NOAA-20 polar overpasses)",
      latency: "~3 hours from satellite scan to detection ingest",
      sensorTech: "VIIRS (Visible Infrared Imaging Radiometer Suite) 375m high-resolution nadir channels",
      verificationUrl: "https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@76.0,30.0,8z",
      verificationText: "NASA FIRMS Live Fire Map",
      mandateRole: "Direct source emission inputs for 72h Gaussian smoke plume forward trajectory dispersion"
    },
    {
      name: "ICMR & AIIMS Clinical Advisory Knowledge Corpus",
      authority: "Indian Council of Medical Research & AIIMS Pulmonology",
      parameter: "Grounded medical protocols for asthma, COPD, pediatrics, geriatrics, cardiovascular risks",
      frequency: "Version-controlled clinical rulebook",
      latency: "Real-time Retrieval-Augmented Generation (RAG) vector grounding",
      sensorTech: "Clinical epidemiology & verified ICMR respiratory action frameworks",
      verificationUrl: "https://main.icmr.nic.in/",
      verificationText: "ICMR Official Portal",
      mandateRole: "Guarantees zero-hallucination vernacular health guidance delivered in Hindi and English"
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={24} color="var(--accent-health)" />
            <h3 className="heading-serif" style={{ fontSize: '1.6rem' }}>Data Provenance & Official Sources</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
          Vaayu ingests from 5 primary scientific and statutory streams. Every sensor observation, atmospheric boundary layer variable, and satellite thermal anomaly is fully auditable with zero proprietary black-box obscurity.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {dataStreams.map((ds, idx) => (
            <div key={idx} style={{ 
              padding: '14px 16px', 
              background: 'var(--color-surface-elevated)', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--color-border)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)' }}>
                      FEED #{idx + 1}
                    </span>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{ds.name}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
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

        <div style={{ marginTop: '20px', padding: '14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="var(--aqi-good)" /> Step-by-Step Data Audit Instructions
          </h4>
          <ol style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
            <li>To verify live station telemetry: Open <a href="https://app.cpcbccr.com/AQI_India/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-health)' }}>CPCB Portal</a>, select Delhi, pick your monitoring station (e.g. <em>Anand Vihar</em> or <em>Mandir Marg</em>), and compare against the station badge in Vaayu.</li>
            <li>To verify regional fires: Open <a href="https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@76.0,30.0,8z" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-health)' }}>NASA FIRMS</a>, activate VIIRS 375m layer, and cross-reference active thermal anomalies in Punjab/Haryana against our 72h plume map.</li>
            <li>To inspect live atmospheric boundary layer height: Check Open-Meteo numerical weather prediction stream at coordinate (28.61, 77.20).</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
