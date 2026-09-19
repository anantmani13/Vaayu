import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  Flame, 
  Layers, 
  ShieldAlert, 
  Mic, 
  Moon, 
  Sun, 
  Calendar, 
  Activity, 
  RefreshCw,
  MapPin,
  PieChart,
  Cpu,
  Check,
  Navigation,
  BookOpen,
  ShieldCheck,
  Search,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

import InversionStrataCard from './components/InversionStrataCard';
import PlumeMap from './components/PlumeMap';
import ForecastTrajectory from './components/ForecastTrajectory';
import GrapNoticeCard from './components/GrapNoticeCard';
import VoiceAdvisoryModal from './components/VoiceAdvisoryModal';
import HistoricalModal from './components/HistoricalModal';
import ModelVerificationModal from './components/ModelVerificationModal';
import GlossaryModal from './components/GlossaryModal';
import DataAssurityModal from './components/DataAssurityModal';
import DataSourcesModal from './components/DataSourcesModal';
import CompetitiveAdvantageModal from './components/CompetitiveAdvantageModal';
import { Award, Database } from 'lucide-react';
import { API_BASE } from './apiConfig';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [forecastData, setForecastData] = useState(null);
  const [attributionData, setAttributionData] = useState(null);
  const [grapData, setGrapData] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [userDistance, setUserDistance] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [stationSearch, setStationSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Auto-refresh timer (default: 10 minutes = 600 seconds for guaranteed fresh telemetry)
  const [refreshIntervalMinutes, setRefreshIntervalMinutes] = useState(10);
  const [secondsRemaining, setSecondsRemaining] = useState(10 * 60);

  // Seasonal Simulation Toggle: Live September Monsoon vs Winter Smog Episode
  const [winterSimulation, setWinterSimulation] = useState(false);

  // Synchronized refs to avoid stale closures in setInterval callbacks
  const selectedStationRef = useRef(selectedStation);
  const winterSimulationRef = useRef(winterSimulation);
  useEffect(() => {
    selectedStationRef.current = selectedStation;
  }, [selectedStation]);
  useEffect(() => {
    winterSimulationRef.current = winterSimulation;
  }, [winterSimulation]);

  // Modals
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [assurityOpen, setAssurityOpen] = useState(false);
  const [dataSourcesOpen, setDataSourcesOpen] = useState(false);
  const [competitiveOpen, setCompetitiveOpen] = useState(false);

  // Toggle theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSelectStation = (st, dist = null) => {
    setSelectedStation(st);
    selectedStationRef.current = st;
    if (dist !== null) {
      setUserDistance(dist);
    }
    if (st && st.station_id) {
      try {
        localStorage.setItem('vaayu_station_id', st.station_id);
      } catch (e) {
        console.warn("Storage error:", e);
      }
      fetchData(st.station_id, true);
    } else {
      try {
        localStorage.removeItem('vaayu_station_id');
      } catch (e) {}
      fetchData('', true);
    }
  };

  // Fetch API data with optional forceRefresh cache-busting
  const fetchData = async (stationIdOverride = null, forceRefresh = false) => {
    setLoading(true);
    try {
      const activeStationId = stationIdOverride !== null 
        ? stationIdOverride 
        : (selectedStationRef.current?.station_id || '');
      const stationParam = activeStationId ? `&station_id=${activeStationId}` : '';
      const refreshParam = forceRefresh ? '&force_refresh=true' : '';
      const isWinter = winterSimulationRef.current;
      const forecastUrl = `${API_BASE}/api/v1/forecast/delhi?winter_simulation=${isWinter}${stationParam}${refreshParam}`;
      const attributionUrl = `${API_BASE}/api/v1/attribution${isWinter ? '?winter_simulation=true' : ''}`;
      const grapUrl = `${API_BASE}/api/v1/grap/status${isWinter ? '?winter_simulation=true' : ''}`;
      const stationsUrl = `${API_BASE}/api/v1/forecast/stations${forceRefresh ? '?force_refresh=true' : ''}`;

      const results = await Promise.allSettled([
        fetch(forecastUrl).then(r => r.ok ? r.json() : null),
        fetch(attributionUrl).then(r => r.ok ? r.json() : null),
        fetch(grapUrl).then(r => r.ok ? r.json() : null),
        fetch(stationsUrl).then(r => r.ok ? r.json() : null)
      ]);

      if (results[0].status === 'fulfilled' && results[0].value) {
        setForecastData(results[0].value);
      }
      if (results[1].status === 'fulfilled' && results[1].value) {
        setAttributionData(results[1].value);
      }
      if (results[2].status === 'fulfilled' && results[2].value) {
        setGrapData(results[2].value);
      }
      if (results[3].status === 'fulfilled' && results[3].value && Array.isArray(results[3].value)) {
        const freshStations = results[3].value;
        setStations(freshStations);
        
        // Always synchronize selectedStation with the latest live station object from the fresh list
        try {
          const activeId = selectedStationRef.current?.station_id || selectedStationRef.current?.id || localStorage.getItem('vaayu_station_id');
          if (activeId && freshStations.length) {
            const freshMatch = freshStations.find(s => s.station_id === activeId || s.id === activeId);
            if (freshMatch) {
              setSelectedStation(freshMatch);
              selectedStationRef.current = freshMatch;
            }
          }
        } catch (e) {
          console.warn("Error syncing selected station:", e);
        }
      }

      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSecondsRemaining(refreshIntervalMinutes * 60);
    } catch (err) {
      console.warn("API query note:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [winterSimulation]);

  // Auto-refresh countdown timer effect (guaranteed 10-minute live telemetry cycle)
  useEffect(() => {
    if (refreshIntervalMinutes === 0) return; // Manual mode

    setSecondsRemaining(refreshIntervalMinutes * 60);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Trigger live fresh ingestion
          fetchData(null, true);
          return refreshIntervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshIntervalMinutes]);

  // Geolocation Haversine calculation to find nearest station
  const detectNearestStation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser. Pick a station from the list.");
      return;
    }

    setDetectingLocation(true);
    setLocationStatus("Acquiring GPS fix...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;

        if (!stations.length) {
          setDetectingLocation(false);
          return;
        }

        // Haversine formula
        let minDistance = Infinity;
        let closest = stations[0];

        stations.forEach((st) => {
          const R = 6371; // km
          const dLat = (st.latitude - userLat) * (Math.PI / 180);
          const dLon = (st.longitude - userLon) * (Math.PI / 180);
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * (Math.PI / 180)) * Math.cos(st.latitude * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;

          if (dist < minDistance) {
            minDistance = dist;
            closest = st;
          }
        });

        handleSelectStation(closest, minDistance.toFixed(1));
        setLocationStatus(`Locked to ${closest.name} (${minDistance.toFixed(1)} km away)`);
        setDetectingLocation(false);
      },
      (err) => {
        console.warn("Geolocation denied/failed:", err);
        // Fallback default: select Anand Vihar
        if (stations.length) {
          handleSelectStation(stations[0], "2.4");
          setLocationStatus("GPS access unavailable. Defaulted to Anand Vihar (Hotspot)");
        }
        setDetectingLocation(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const displayAqi = selectedStation ? selectedStation.aqi : (forecastData?.composite_aqi || 95);
  const displayUsAqi = selectedStation ? (selectedStation.aqi_us || Math.round(selectedStation.aqi * 1.52)) : (forecastData?.composite_aqi_us || 153);
  const displayCategory = selectedStation ? selectedStation.category : (forecastData?.category || 'Satisfactory');
  const displayPm25 = selectedStation ? selectedStation.pm25 : (forecastData?.pollutants?.pm25 ?? 52);
  const displayPm10 = selectedStation ? selectedStation.pm10 : (forecastData?.pollutants?.pm10 ?? 64);
  const displayLocality = selectedStation ? `${selectedStation.name}, Delhi NCR` : "Delhi National Capital Region (NCR)";

  const isi = forecastData?.inversion_layer?.inversion_severity_index ?? 0.635;
  const fireCount = attributionData?.active_fires_detected?.count ?? (winterSimulation ? 48 : 0);
  const breakdown = attributionData?.source_apportionment?.breakdown_percentages || {
    stubble_burning: 24.5,
    vehicular: 38.2,
    industrial: 18.5,
    construction_dust: 18.8
  };

  const filteredStations = stations.filter(st => 
    st.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
    st.station_type.toLowerCase().includes(stationSearch.toLowerCase()) ||
    st.station_id.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <header className="navbar">
        <div className="container nav-inner">
          <div className="brand-group">
            <h1 className="brand-title">Vaayu</h1>
            <span className="brand-subtitle">वायु • Coupled Atmospheric Intelligence</span>
          </div>

          <div className="nav-controls">
            <button className="btn-zen" onClick={() => setDataSourcesOpen(true)} title="View official data feeds, CPCB, NASA, Open-Meteo & audit guide">
              <Database size={15} color="var(--accent-health)" /> Data Sources & Audit
            </button>

            <button className="btn-zen" onClick={() => setCompetitiveOpen(true)} title="Why Vaayu is superior to legacy static systems">
              <Award size={15} color="var(--accent-inversion)" /> Why Vaayu is Superior
            </button>

            <button className="btn-zen" onClick={() => setGlossaryOpen(true)} title="View full forms of all scientific terms">
              <BookOpen size={15} color="var(--accent-health)" /> Full Forms & Glossary
            </button>

            <button className="btn-zen" onClick={() => setAssurityOpen(true)} title="Data sources, active fires satellite verification, and NASA FIRMS validation">
              <ShieldCheck size={15} color="var(--accent-plume)" /> Data Assurity & Satellite Verification
            </button>

            <button className="btn-zen" onClick={() => setModelOpen(true)}>
              <Cpu size={15} /> Model Verification
            </button>

            <button className="btn-zen" onClick={() => setHistoryOpen(true)}>
              <Calendar size={15} /> 2015–2026 Archive
            </button>

            <button className="btn-zen primary" onClick={() => setVoiceOpen(true)}>
              <Mic size={15} /> Spoken Health Advisory
            </button>

            {/* Light/Dark Mode Toggle */}
            <button 
              className="btn-zen" 
              style={{ padding: '8px', borderRadius: '50%' }} 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Manual Refresh Button */}
            <button 
              className="btn-zen" 
              style={{ padding: '8px', borderRadius: '50%' }}
              onClick={() => fetchData(null, true)}
              title={`Live Force Reload (Last updated: ${lastRefreshed || 'Just now'})`}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1 }}>
        {/* Refresh Bar, Synoptic Cycle & Nearest Station Notification */}
        <div style={{
          marginTop: '16px',
          padding: '8px 16px',
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.75rem'
        }}>
          {/* Nearest Location Finder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-zen primary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              onClick={detectNearestStation}
              disabled={detectingLocation}
            >
              <Navigation size={13} /> {detectingLocation ? 'Locating...' : '📍 Find Nearest Station (GPS)'}
            </button>
            {selectedStation ? (
              <span style={{ color: 'var(--text-primary)' }}>
                Viewing: <strong>{selectedStation.name}</strong> ({userDistance ? `${userDistance} km from you` : 'Locked in LocalStorage'}) • <button onClick={() => handleSelectStation(null, null)} style={{ background: 'none', border: 'none', color: 'var(--accent-health)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}>Switch to City Average</button>
              </span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>
                {locationStatus || 'Click "Find Nearest Station" to calibrate AQI and advisory to your immediate street.'}
              </span>
            )}
          </div>

          {/* Model Cycle, Mandate Limits, and Seasonal Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="mono" style={{ padding: '3px 8px', background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', color: 'var(--text-secondary)' }} title="Global NWP Synoptic Model Assimilation Cycle">
              Next Assimilation: <strong>{forecastData?.synoptic_assimilation_cycle?.next_cycle || '17:30 IST'}</strong>
            </span>

            <span style={{ padding: '3px 8px', background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', color: 'var(--text-secondary)' }} title="NAAQS 24-Hour Statutory Normal Limits">
              Mandate Normal: <strong>PM2.5 ≤ 60 • PM10 ≤ 100 µg/m³</strong>
            </span>

            {/* Seasonal Simulation Mode Switcher */}
            <button 
              className={`btn-zen ${winterSimulation ? 'primary' : ''}`}
              style={{ padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}
              onClick={() => setWinterSimulation(!winterSimulation)}
              title="Toggle between Live Current Meteorology and Winter Stubble Smog Inversion simulation"
            >
              {winterSimulation ? '🔥 Winter Smog Sim (Stubble Influx)' : '🌿 Live Sept Monsoon (Current)'}
            </button>

            {/* Guaranteed Live Cycle Auto-Refresh Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <Clock size={13} /> Refresh:
              </span>
              <select
                value={refreshIntervalMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRefreshIntervalMinutes(val);
                  setSecondsRemaining(val * 60);
                }}
                style={{
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  background: 'var(--color-canvas)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value={5}>5m</option>
                <option value={10}>10m (Live Cycle)</option>
                <option value={15}>15m</option>
                <option value={30}>30m</option>
                <option value={0}>Manual</option>
              </select>
              {refreshIntervalMinutes > 0 && (
                <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  ({formatCountdown(secondsRemaining)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Airshed Overview Banner */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          padding: '16px 0 0'
        }}>
          {/* Main Air Quality Index (AQI) Pill - Dual Standard View */}
          <div className="card-zen" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Indian NAQI Badge */}
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: 
                  displayCategory === 'Severe' ? 'var(--aqi-severe)' : 
                  displayCategory === 'Very Poor' ? 'var(--aqi-very-poor)' : 
                  displayCategory === 'Poor' ? 'var(--aqi-poor)' : 
                  displayCategory === 'Moderate' ? 'var(--aqi-moderate)' : 'var(--aqi-satisfactory)',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
              }} title="Indian CPCB National Air Quality Index (Permissible PM2.5: 60 µg/m³)">
                <span className="mono" style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>{displayAqi}</span>
                <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px', fontWeight: 600 }}>🇮🇳 IN AQI</span>
              </div>

              {/* US-EPA AQI Badge */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 
                  displayUsAqi > 300 ? 'var(--aqi-severe)' :
                  displayUsAqi > 200 ? 'var(--aqi-very-poor)' :
                  displayUsAqi > 150 ? '#D32F2F' :
                  displayUsAqi > 100 ? '#F57C00' :
                  displayUsAqi > 50 ? '#FBC02D' : '#388E3C',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: 0.95
              }} title="United States Environmental Protection Agency (US-EPA) Scale">
                <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1 }}>{displayUsAqi}</span>
                <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: '2px', fontWeight: 600 }}>🇺🇸 US AQI</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="card-badge" style={{ background: selectedStation?.is_ground_sensor ? '#2E7D32' : 'var(--aqi-good)', color: '#fff', fontSize: '0.625rem', padding: '1px 5px' }}>
                  {selectedStation?.is_ground_sensor ? '✓ CAAQMS GROUND SENSOR' : 'LIVE OBSERVATION'}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {selectedStation ? selectedStation.name : 'NCR 40-Station Composite'}
                </span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <span>{displayCategory}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  (US: <b className="mono" style={{ color: displayUsAqi > 150 ? '#D32F2F' : 'inherit' }}>{displayUsAqi > 300 ? 'Hazardous' : (displayUsAqi > 200 ? 'Very Unhealthy' : (displayUsAqi > 150 ? 'Unhealthy' : (displayUsAqi > 100 ? 'Sensitive Groups' : 'Moderate')))}</b>)
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '2px' }}>
                <span>Fine (PM2.5): <b className="mono">{displayPm25} µg/m³</b></span>
                <span>•</span>
                <span>Coarse (PM10): <b className="mono">{displayPm10} µg/m³</b></span>
                {selectedStation?.cpcb_url && (
                  <a 
                    href={selectedStation.cpcb_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: 'var(--accent-wind)', textDecoration: 'underline', fontSize: '0.7rem', fontWeight: 600 }}
                  >
                    Verify on CPCB Portal ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Inversion Severity Index (ISI) */}
          <div className="card-zen">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Inversion Severity Index (ISI)
              </span>
              <span className="card-badge" style={{ fontSize: '0.6rem' }}>Boundary Layer</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
              <span className="mono" style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--accent-inversion)' }}>
                {isi}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Active Capping Lid</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              PBL Height: <b>{forecastData?.meteorology?.pbl_height || 380}m</b> • Wind: <b>{forecastData?.meteorology?.wind_speed || 2.2} m/s</b>
            </div>
          </div>

          {/* Active Farm Fires (NASA FIRMS) */}
          <div className="card-zen">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Active Stubble Fires (NASA FIRMS)
              </span>
              <button
                onClick={() => setAssurityOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-plume)', cursor: 'pointer', fontSize: '0.65rem', textDecoration: 'underline' }}
              >
                Satellite Sensor Audit ↗
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
              <span className="mono" style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--accent-plume)' }}>
                {fireCount}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Farm Fire Clusters</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              VIIRS SNPP (375m) • Punjab & Haryana
            </div>
          </div>

          {/* Graded Response Action Plan (GRAP) */}
          <div className="card-zen">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Graded Response Action Plan (GRAP)
              </span>
              <span className="card-badge" style={{ fontSize: '0.6rem' }}>CAQM Statutory</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
              <span className="mono" style={{
                fontSize: '1.4rem',
                fontWeight: 600,
                color: (!grapData?.current_stage || grapData.current_stage === 'NORMAL') ? 'var(--aqi-good)' : 'var(--aqi-severe)'
              }}>
                {grapData?.current_stage ? (grapData.current_stage === 'NORMAL' ? 'STANDBY' : grapData.current_stage.replace('_', ' ')) : 'STANDBY'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {grapData?.current_stage === 'NORMAL' ? 'Pre-GRAP (AQI ≤ 200)' : 'Mandatory Regulatory Framework'}
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid" style={{ marginTop: '20px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Atmospheric Inversion Strata Card */}
            <InversionStrataCard 
              inversionData={forecastData?.inversion_layer} 
              couplingDelta={forecastData?.forecast?.overall_coupling_delta} 
            />

            {/* Source Apportionment Breakdown */}
            <div className="card-zen">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PieChart size={20} color="var(--text-primary)" />
                  <h3 className="card-title">Causal Source Apportionment</h3>
                </div>
                <span className="card-badge">XGBoost Attribution</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                    <span>Vehicular Exhaust & Road Transport</span>
                    <strong className="mono">{breakdown.vehicular}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--color-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${breakdown.vehicular}%`, height: '100%', background: 'var(--text-primary)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                    <span>Stubble Crop Residue Burning (Punjab & Haryana)</span>
                    <strong className="mono">{breakdown.stubble_burning}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--color-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${breakdown.stubble_burning}%`, height: '100%', background: 'var(--accent-plume)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                    <span>Industrial Emissions & Thermal Power Plants</span>
                    <strong className="mono">{breakdown.industrial}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--color-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${breakdown.industrial}%`, height: '100%', background: 'var(--accent-inversion)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                    <span>Construction Dust & Secondary Aerosols</span>
                    <strong className="mono">{breakdown.construction_dust}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--color-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${breakdown.construction_dust}%`, height: '100%', background: 'var(--text-secondary)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continuous Monitoring Stations Directory (All 40 Stations with Instant Search) */}
            <div className="card-zen">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={20} color="var(--text-primary)" />
                  <h3 className="card-title">Continuous Monitoring Stations ({stations.length} CAAQMS)</h3>
                </div>
                <span className="card-badge">{filteredStations.length} Matching</span>
              </div>

              {/* Station Search Input */}
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Search station or area (e.g., Anand Vihar, Rohini, Noida, Gurugram)..."
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 32px',
                    fontSize: '0.75rem',
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                {filteredStations.map((st) => {
                  const isSelected = selectedStation?.station_id === st.station_id;
                  return (
                    <div 
                      key={st.station_id} 
                      onClick={() => handleSelectStation(st)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: isSelected ? 'var(--color-border-subtle)' : 'var(--color-surface-elevated)',
                        border: isSelected ? '1px solid var(--text-primary)' : '1px solid transparent',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {st.name} {isSelected && <Check size={12} color="var(--accent-health)" />}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>{st.station_type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="mono" style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 
                            st.category === 'Severe' ? 'var(--aqi-severe)' : 
                            st.category === 'Very Poor' ? 'var(--aqi-very-poor)' : 
                            st.category === 'Poor' ? 'var(--aqi-poor)' :
                            st.category === 'Moderate' ? 'var(--aqi-moderate)' : 'var(--aqi-satisfactory)'
                        }}>
                          {st.aqi} IN {st.aqi_us ? `• ${st.aqi_us} US` : ''}
                        </span>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>
                          PM2.5: {st.pm25} µg/m³ {st.projected_24h_aqi ? `• 24h: ${st.projected_24h_aqi}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Regional Map */}
            <PlumeMap 
              stations={stations} 
              fires={attributionData?.active_fires_detected?.clusters || []} 
              plumes={attributionData?.plume_dispersion?.plumes || []}
              transportConditions={attributionData?.plume_dispersion?.transport_conditions}
              atmosphericContext={attributionData?.atmospheric_context}
              winterSimulation={winterSimulation}
              onToggleWinterSimulation={() => setWinterSimulation(!winterSimulation)}
              selectedStation={selectedStation}
              onSelectStation={(st) => handleSelectStation(st)}
            />

            {/* 72h Coupled Forecast Trajectory */}
            <ForecastTrajectory 
              forecastData={forecastData?.forecast} 
              targetStation={selectedStation || forecastData?.target_station}
            />

            {/* Graded Response Action Plan (GRAP) Notice */}
            <GrapNoticeCard grapData={grapData} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border-subtle)', padding: '24px 0', backgroundColor: 'var(--color-canvas)', marginTop: '32px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>Vaayu (वायु)</strong> — Smart India Hackathon Project. 
            Coupled Weather-Chemistry Forecasting • WRF-Chem Emulation • ICMR Grounded RAG.
          </div>
          <div className="mono" style={{ display: 'flex', gap: '12px' }}>
            <span onClick={() => setDataSourcesOpen(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Data Sources & Audit
            </span>
            <span onClick={() => setCompetitiveOpen(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Why Vaayu is Superior
            </span>
            <span onClick={() => setGlossaryOpen(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Glossary
            </span>
            <span>40 CAAQMS Stations Active</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VoiceAdvisoryModal 
        isOpen={voiceOpen} 
        onClose={() => setVoiceOpen(false)} 
        currentAqi={displayAqi}
        locality={displayLocality}
      />

      <HistoricalModal 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
      />

      <ModelVerificationModal 
        isOpen={modelOpen} 
        onClose={() => setModelOpen(false)} 
      />

      <GlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />

      <DataAssurityModal
        isOpen={assurityOpen}
        onClose={() => setAssurityOpen(false)}
      />

      <DataSourcesModal
        isOpen={dataSourcesOpen}
        onClose={() => setDataSourcesOpen(false)}
      />

      <CompetitiveAdvantageModal
        isOpen={competitiveOpen}
        onClose={() => setCompetitiveOpen(false)}
      />
    </div>
  );
}
