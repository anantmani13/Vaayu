import React, { useEffect, useState } from 'react';
import { Calendar, X, BarChart3 } from 'lucide-react';
import { API_BASE } from '../apiConfig';

export default function HistoricalModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`${API_BASE}/api/v1/historical/summary`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--text-primary)" />
            <h3 className="heading-serif" style={{ fontSize: '1.6rem' }}>2015 – 2026 Historical Airshed Analysis</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Calibrated multi-year trends across 40 continuous monitoring stations and atmospheric reanalysis profiles in Delhi NCR.
        </p>

        {/* Seasonal Breakdown Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '24px' }}>
          {data?.seasonal_breakdown && Object.entries(data.seasonal_breakdown).map(([season, info]) => (
            <div key={season} style={{ padding: '12px 14px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{season}</span>
              <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 600, color: info.avg_pm25 > 200 ? 'var(--aqi-severe)' : 'var(--aqi-moderate)' }}>
                {info.avg_pm25} µg/m³
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>Inversion Freq: {Math.round(info.inversion_frequency * 100)}%</div>
            </div>
          ))}
        </div>

        {/* Yearly Trends Table */}
        <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '8px 12px' }}>Year</th>
                <th style={{ padding: '8px 12px' }}>Annual PM2.5</th>
                <th style={{ padding: '8px 12px' }}>Peak Winter PM2.5</th>
                <th style={{ padding: '8px 12px' }}>Inversion Days</th>
                <th style={{ padding: '8px 12px' }}>GRAP Severe Days</th>
              </tr>
            </thead>
            <tbody>
              {data?.yearly_trends?.map((yt) => (
                <tr key={yt.year} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{yt.year}</td>
                  <td className="mono" style={{ padding: '8px 12px' }}>{yt.annual_mean_pm25} µg/m³</td>
                  <td className="mono" style={{ padding: '8px 12px', color: 'var(--aqi-severe)', fontWeight: 600 }}>{yt.peak_winter_pm25} µg/m³</td>
                  <td className="mono" style={{ padding: '8px 12px' }}>{yt.inversion_days_count} days</td>
                  <td className="mono" style={{ padding: '8px 12px' }}>{yt.severe_grap_days} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
