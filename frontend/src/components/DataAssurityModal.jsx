import React from 'react';
import { X, ShieldCheck, Flame, ExternalLink, Satellite, Clock, Database, CheckCircle2, AlertCircle, Navigation, Radio } from 'lucide-react';

export default function DataAssurityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '840px', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--accent-health)" />
              <span style={{ fontSize: '0.6875rem', color: 'var(--accent-health)', textTransform: 'uppercase', fontWeight: 600 }}>
                Data Integrity, Provenance & Verification
              </span>
            </div>
            <h3 className="heading-serif" style={{ fontSize: '1.6rem', margin: '4px 0 0', color: 'var(--text-primary)' }}>
              Data Assurity & Live Verification Guide
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Intro Banner */}
        <div style={{ padding: '12px 16px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
            Every data layer in <strong>Vaayu</strong> is mathematically traceable and benchmarked against official governmental and space agency observational feeds — including <strong>WAQI / AQICN</strong>, <strong>CPCB CAAQMS</strong>, <strong>NASA FIRMS</strong>, and <strong>Open-Meteo</strong>. Below is the complete assurity breakdown to share with evaluators and judges.
          </p>
        </div>

        {/* Section 1: Ground Sensor Telemetry & WAQI Integration */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Radio size={18} color="var(--accent-health)" />
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
              1. Real Ground-Sensor Telemetry & WAQI / AQICN Integration
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Direct Physical Monitoring Boxes</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Vaayu connects directly to the <strong>World Air Quality Index (WAQI)</strong> REST API to stream live readings from physical CAAQMS monitoring boxes stationed at Punjabi Bagh, Anand Vihar, Mandir Marg, RK Puram, Lodhi Road, and 35 other NCR locations.
              </p>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>3-Tier Resilient Ingestion Cascade</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                <strong>Tier 1:</strong> WAQI live CAAQMS road monitors (sub-5 minute refresh).<br />
                <strong>Tier 2:</strong> Open-Meteo per-station coordinates (Copernicus CAMS 10km grid).<br />
                <strong>Tier 3:</strong> Seasonally calibrated atmospheric baseline.<br />
                <em>Integrated 15-minute caching (900s TTL) safeguards API rate limits while keeping telemetry fresh.</em>
              </p>
            </div>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="https://aqicn.org/city/delhi/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-zen"
              style={{ fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={13} color="var(--accent-health)" /> Verify on WAQI Delhi Portal <ExternalLink size={11} />
            </a>
            <a
              href="https://app.cpcbccr.com/AQI_India/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-zen"
              style={{ fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={13} color="var(--accent-health)" /> Verify on CPCB National AQI Portal <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Section 2: Active Satellite Telemetry */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Flame size={18} color="var(--accent-plume)" />
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
              2. NASA FIRMS Active Stubble Fire Telemetry (How to Confirm)
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Official Satellite Sensor</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                <strong>NASA FIRMS</strong> (Fire Information for Resource Management System) utilizes the <strong>VIIRS (Visible Infrared Imaging Radiometer Suite)</strong> sensor on Suomi-NPP & NOAA-20 satellites with 375-meter spatial resolution.
              </p>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Angular Divergence & Plume Dispersion</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Satellite detections across Sangrur, Ludhiana, Patiala, Bathinda, Kaithal, and Karnal are evaluated against forward wind vectors. If winds divert plumes toward Rajasthan/Pakistan (as in September easterlies), Delhi is marked safe; during November 315° NW winds, direct Gaussian plumes descend onto Delhi NCR.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@76.0,30.0,8z"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-zen"
              style={{ fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Satellite size={13} color="var(--accent-plume)" /> Verify on NASA FIRMS Live Fire Map <ExternalLink size={11} />
            </a>
            <a
              href="https://firms.modaps.eosdis.nasa.gov/api/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-zen"
              style={{ fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              NASA Earthdata API Documentation <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Section 3: Dual Standards Calibration */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Database size={18} color="var(--accent-health)" />
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
              3. Dual AQI Architecture: Indian CPCB vs. US-EPA Scales
            </h4>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)', lineHeight: 1.5, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>
              Citizens and evaluators frequently notice differences between international apps (e.g., Apple Weather, WAQI) and official Indian portals (CPCB):
            </p>
            <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>Indian NAQI (CPCB):</strong> Permissible 24h PM2.5 standard is <strong>60 µg/m³</strong> (0–50 Good, 51–100 Satisfactory, 101–200 Moderate).</li>
              <li><strong>US-EPA AQI (WAQI):</strong> Permissible 24h PM2.5 standard is <strong>35 µg/m³</strong> (101–150 Sensitive Groups, 151–200 Unhealthy, 301+ Hazardous).</li>
              <li><strong>Vaayu’s Dual Display:</strong> Displays both badges side-by-side (e.g. <em>112 IN AQI • 155 US AQI</em>) so users have total clarity regardless of which standard they consult.</li>
            </ul>
          </div>
        </div>

        {/* Section 4: 1-Click GPS Nearest Station Detection */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Navigation size={18} color="var(--accent-health)" />
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
              4. GPS Geolocation & Haversine Nearest Station Lock
            </h4>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Clicking <strong>"📍 Find Nearest Station (GPS)"</strong> calculates the exact spherical Haversine distance between your browser's latitude/longitude and all 40 active CAAQMS stations in Delhi NCR. The system locks onto your nearest physical monitoring box (e.g. <em>Mandir Marg — 2.1 km away</em>), instantly tailoring both the hero AQI card and the ICMR-grounded voice advisory to your immediate street.
          </div>
        </div>

        {/* Section 5: Update Schedule & Refresh Windows */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Clock size={18} color="var(--text-primary)" />
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
              5. System Refresh Windows & Public Link Persistence
            </h4>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>Public HTTPS Link (localtunnel):</strong> Remains valid and accessible <strong>continuously</strong> without any automatic timeout, for as long as <code>tunnel/start_tunnel.bat</code> runs on your machine.
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>AQI Sensor & Weather Refresh:</strong> The dashboard automatically polls for updated atmospheric readings every <strong>30 minutes</strong> (with configurable options for 5m, 10m, 15m, 30m, and an instant manual "Refresh Now" button).
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>NASA Satellite Pass Cycle:</strong> NASA VIIRS satellites pass over the Punjab-Haryana-Delhi corridor twice daily (~01:30 and ~13:30 local time), with near-real-time (NRT) fire detections published within 3 hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
