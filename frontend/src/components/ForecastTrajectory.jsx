import React, { useState } from 'react';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function ForecastTrajectory({ forecastData, targetStation = null }) {
  const [selectedHorizon, setSelectedHorizon] = useState('24h');

  const horizons = ['6h', '24h', '48h', '72h'];
  const horizonSummary = forecastData?.horizons?.[selectedHorizon];
  const hourly = forecastData?.hourly_trajectory || [];

  // Filter trajectory points for the mini bar chart
  const maxHours = parseInt(selectedHorizon);
  const displayPoints = hourly.slice(0, maxHours).filter((_, idx) => {
    if (maxHours === 6) return true;
    if (maxHours === 24) return idx % 2 === 0;
    if (maxHours === 48) return idx % 4 === 0;
    return idx % 6 === 0;
  });

  return (
    <div className="card-zen">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={20} color="var(--text-primary)" />
            <h3 className="card-title">72-Hour Coupled Forecast Trajectory</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span className="mono" style={{ 
              fontSize: '0.72rem', 
              padding: '2px 8px', 
              background: targetStation ? 'rgba(76, 175, 80, 0.15)' : 'var(--color-surface-elevated)', 
              borderRadius: '4px', 
              border: targetStation ? '1px solid #4CAF50' : '1px solid var(--color-border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}>
              {targetStation 
                ? `📍 Calibrated Station: ${targetStation.name} • Initial AQI: ${targetStation.aqi} (${targetStation.category})`
                : `📍 Calibrated Baseline: Delhi NCR 40-Station Composite Average`}
            </span>
          </div>
        </div>
        <div className="horizon-tabs">
          {horizons.map((h) => (
            <button
              key={h}
              className={`horizon-tab ${selectedHorizon === h ? 'active' : ''}`}
              onClick={() => setSelectedHorizon(h)}
            >
              +{h} Outlook
            </button>
          ))}
        </div>
      </div>

      {/* Horizon Metric Row */}
      {horizonSummary && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="mono" style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--color-surface-elevated)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)' }}>
              +{horizonSummary.horizon_hours}h Outlook Target: {horizonSummary.local_hour !== undefined ? `${horizonSummary.local_hour}:00 IST` : ''}
            </span>
            {horizonSummary.diurnal_phase && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-health)', fontWeight: 500 }}>
                • {horizonSummary.diurnal_phase}
              </span>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '12px 16px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Fine Particulate (PM2.5)</span>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 600, color: horizonSummary.pm25 > 60 ? 'var(--aqi-poor)' : 'var(--aqi-good)' }}>
                {horizonSummary.pm25} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>µg/m³</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--accent-inversion)' }}>
                +{horizonSummary.coupling_delta_ugm3} µg/m³ retention gain
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Coarse Dust (PM10)</span>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                {horizonSummary.pm10} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>µg/m³</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>
                Limit: 100 µg/m³
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nitrogen Dioxide (NO₂)</span>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                {horizonSummary.no2} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>µg/m³</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>
                {horizonSummary.no2 > 35 ? 'Traffic Peak / Night Trap' : 'Photochemically Diluted'}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ground Ozone (O₃)</span>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                {horizonSummary.o3} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>µg/m³</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>
                {horizonSummary.o3 > 80 ? 'Afternoon Solar Peak' : 'Nocturnal Depletion'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Trajectory Bar Visualization */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span>Hourly Trajectory Progression (+1h to +{selectedHorizon})</span>
          <span className="mono">Coupled PM2.5 (Solid) vs Uncoupled Baseline (Dotted)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
          {displayPoints.map((pt, i) => {
            const hPct = Math.min(100, Math.max(15, (pt.pm25 / 450) * 100));
            const uncoupledHPct = Math.min(100, Math.max(15, (pt.uncoupled_pm25 / 450) * 100));
            
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '100%' }}>
                  {/* Uncoupled reference bar */}
                  <div
                    title={`Uncoupled: ${pt.uncoupled_pm25} µg/m³`}
                    style={{
                      width: '6px',
                      height: `${uncoupledHPct}%`,
                      backgroundColor: 'var(--color-border)',
                      borderRadius: '2px',
                      opacity: 0.7
                    }}
                  />
                  {/* Coupled true bar */}
                  <div
                    title={`Coupled: ${pt.pm25} µg/m³ (ISI: ${pt.inversion_severity_index})`}
                    style={{
                      width: '12px',
                      height: `${hPct}%`,
                      backgroundColor: pt.pm25 > 350 ? 'var(--aqi-severe)' : pt.pm25 > 250 ? 'var(--aqi-very-poor)' : 'var(--aqi-poor)',
                      borderRadius: '3px 3px 0 0'
                    }}
                  />
                </div>
                <span className="mono" style={{ fontSize: '0.625rem', color: 'var(--text-faint)', marginTop: '6px' }}>
                  +{pt.hour}h
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
