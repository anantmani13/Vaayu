import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Wind, Flame, MapPin, Layers, ExternalLink, Filter, Crosshair, ZoomIn, Compass, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PlumeMap({ 
  stations = [], 
  fires = [], 
  plumes = [], 
  transportConditions = null,
  atmosphericContext = null,
  winterSimulation = false,
  onToggleWinterSimulation = null,
  selectedStation = null, 
  onSelectStation = null 
}) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const [stationFilter, setStationFilter] = useState('all'); // all, urban, industrial, ncr

  // View presets
  const focusDelhiNCR = () => {
    if (leafletInstance.current) {
      leafletInstance.current.setView([28.62, 77.20], 10);
    }
  };

  const focusFarmFires = () => {
    if (leafletInstance.current) {
      leafletInstance.current.setView([30.2, 75.8], 7.5);
    }
  };

  const resetAirshedView = () => {
    if (leafletInstance.current) {
      leafletInstance.current.setView([29.4, 76.5], 7);
    }
  };

  // Filter stations based on selection
  const filteredStations = stations.filter(st => {
    if (stationFilter === 'all') return true;
    if (stationFilter === 'industrial') {
      return (st.station_type || '').toLowerCase().includes('industrial') || (st.name || '').toLowerCase().includes('vihar') || (st.name || '').toLowerCase().includes('narela') || (st.name || '').toLowerCase().includes('bawana') || (st.name || '').toLowerCase().includes('wazirpur');
    }
    if (stationFilter === 'ncr') {
      return (st.station_id || '').startsWith('NCR') || (st.name || '').includes('Noida') || (st.name || '').includes('Ghaziabad') || (st.name || '').includes('Gurugram') || (st.name || '').includes('Faridabad');
    }
    if (stationFilter === 'urban') {
      return !(st.station_id || '').startsWith('NCR') && !(st.station_type || '').toLowerCase().includes('heavy industrial');
    }
    return true;
  });

  const prevStationRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      let initialCenter = [29.4, 76.5];
      let initialZoom = 7.5;
      try {
        const savedCenter = localStorage.getItem('vaayu_map_center');
        const savedZoom = localStorage.getItem('vaayu_map_zoom');
        if (savedCenter) initialCenter = JSON.parse(savedCenter);
        if (savedZoom) initialZoom = parseInt(savedZoom, 10);
      } catch (e) {}

      if (selectedStation && selectedStation.latitude && selectedStation.longitude) {
        initialCenter = [selectedStation.latitude, selectedStation.longitude];
        initialZoom = 11;
      }

      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.88
      }).addTo(map);

      map.on('moveend', () => {
        try {
          localStorage.setItem('vaayu_map_center', JSON.stringify(map.getCenter()));
          localStorage.setItem('vaayu_map_zoom', map.getZoom().toString());
        } catch (e) {}
      });

      leafletInstance.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    const map = leafletInstance.current;

    // Clear previous custom layers (except base tile layer)
    map.eachLayer((layer) => {
      if (!layer._url) {
        map.removeLayer(layer);
      }
    });

    // 1. Plot Forward Gaussian Plume Dispersion Envelopes & Trajectories
    plumes.forEach((plume, pIdx) => {
      const isDirectInflux = plume.reaches_delhi;
      const coords = plume.trajectory?.map(t => [t.latitude, t.longitude]) || [];

      // A. Render 2D Gaussian Plume Dispersion Envelope Polygon
      if (plume.plume_polygon && plume.plume_polygon.length > 4) {
        const envelopeColor = isDirectInflux ? '#C24D36' : '#607D8B';
        const envelopeFill = isDirectInflux ? '#E65100' : '#78909C';

        L.polygon(plume.plume_polygon, {
          color: envelopeColor,
          weight: 1.5,
          opacity: 0.65,
          fillColor: envelopeFill,
          fillOpacity: isDirectInflux ? 0.22 : 0.14,
          dashArray: '4, 4'
        })
        .bindPopup(`
          <div style="font-family: system-ui; font-size: 12px; line-height: 1.45; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <strong style="color: ${envelopeColor}; font-size: 13px;">Gaussian Smoke Plume</strong>
              <span style="font-size: 10px; background: ${envelopeColor}; color: #fff; padding: 2px 6px; border-radius: 4px;">
                ${isDirectInflux ? '🚨 NCR Threat' : '🛡️ Deflected'}
              </span>
            </div>
            <strong>Source Cluster:</strong> ${plume.source_cluster}<br/>
            <strong>Fire Radiative Power:</strong> <b>${plume.fire_radiative_power_mw} MW</b><br/>
            <strong>Distance to Delhi:</strong> ${plume.distance_to_delhi_km} km<br/>
            <strong>Angular Offset from NCR:</strong> ${plume.angular_offset_from_delhi_deg}°<br/>
            <div style="margin: 6px 0; padding: 6px; background: ${isDirectInflux ? 'rgba(194,77,54,0.1)' : 'rgba(96,125,139,0.1)'}; border-radius: 4px; border-left: 3px solid ${envelopeColor};">
              <b>${isDirectInflux ? 'Direct Influx Expected' : 'Deflected Away'}</b>: ${plume.delhi_alert}
            </div>
            ${isDirectInflux ? `<div>Estimated Arrival: <b>${plume.estimated_arrival_in_delhi_hours} hours</b></div>` : ''}
          </div>
        `)
        .addTo(map);
      }

      // B. Render Plume Centerline Vector
      if (coords.length > 1) {
        L.polyline(coords, {
          color: isDirectInflux ? '#C24D36' : '#546E7A',
          weight: 2.5,
          opacity: 0.85,
          dashArray: '6, 6'
        }).addTo(map);

        // C. Render Key Time-Step Footprints (+12h, +24h, +48h)
        plume.trajectory.forEach((t) => {
          if (t.hour === 12 || t.hour === 24 || t.hour === 48) {
            const stepColor = isDirectInflux ? '#C24D36' : '#546E7A';
            L.circle([t.latitude, t.longitude], {
              radius: Math.max(8000, (t.plume_width_km || 16) * 1000),
              color: stepColor,
              fillColor: stepColor,
              fillOpacity: 0.12,
              weight: 1
            }).bindPopup(`
              <div style="font-family: system-ui; font-size: 11px; line-height: 1.4;">
                <strong style="color: ${stepColor};">Plume Footprint (+${t.hour}h Ahead)</strong><br/>
                <strong>Status:</strong> ${isDirectInflux ? 'Direct Influx Pathway' : 'Deflected / Non-NCR Pathway'}<br/>
                <strong>Plume Width (σy):</strong> ${t.plume_width_km} km<br/>
                <strong>Smoke PM2.5:</strong> ~${t.smoke_intensity_ugm3} µg/m³<br/>
                <div style="margin-top: 4px; font-size: 10px; color: #666;">
                  ${isDirectInflux ? 'Engulfing downwind airshed towards Delhi NCR.' : 'Dispersing away from Delhi into surrounding regional airshed.'}
                </div>
              </div>
            `).addTo(map);
          }
        });
      }
    });

    // 2. Plot Active NASA FIRMS Stubble Burning Fires
    fires.forEach((fire) => {
      const fireIcon = L.divIcon({
        className: 'fire-marker-icon',
        html: `<div style="
          width: 14px; height: 14px; 
          background: #C24D36; 
          border-radius: 50%; 
          border: 2px solid #FFFFFF; 
          box-shadow: 0 0 8px rgba(194, 77, 54, 0.85);
          cursor: pointer;
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const nasaMapUrl = `https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@${fire.longitude},${fire.latitude},11z`;

      L.marker([fire.latitude, fire.longitude], { icon: fireIcon })
        .bindPopup(`
          <div style="font-family: system-ui; font-size: 12px; line-height: 1.45; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="color: #C24D36;">Active Farm Stubble Fire</strong>
              <span style="font-size: 10px; background: #C24D36; color: #fff; padding: 2px 6px; border-radius: 4px;">NASA VIIRS</span>
            </div>
            <strong>Location:</strong> ${fire.region || 'Punjab / Haryana Farmbelt'}<br/>
            <strong>Coordinates:</strong> ${fire.latitude.toFixed(3)}°N, ${fire.longitude.toFixed(3)}°E<br/>
            <strong>Fire Radiative Power (FRP):</strong> <b>${fire.frp || 45} MW</b><br/>
            <strong>Thermal Brightness:</strong> ${fire.brightness || 335} K<br/>
            <strong>Sensor:</strong> VIIRS SNPP (375m NRT)<br/>
            <div style="margin-top: 8px; pt: 6px; border-top: 1px solid #eee;">
              <a href="${nasaMapUrl}" target="_blank" rel="noopener noreferrer" style="color: #C24D36; text-decoration: underline; font-weight: 600; font-size: 11px;">
                Verify on NASA FIRMS Map →
              </a>
            </div>
          </div>
        `)
        .addTo(map);
    });

    // 3. Plot CAAQMS Stations across Delhi NCR with clean, non-colliding circular badges
    filteredStations.forEach((st) => {
      const isSelected = selectedStation?.station_id === st.station_id;
      const color = 
        st.category === 'Severe' ? '#5A2C37' :
        st.category === 'Very Poor' ? '#9E3B2F' :
        st.category === 'Poor' ? '#BA5D3F' :
        st.category === 'Moderate' ? '#B88B4A' : '#3F5E4D';

      const stationIcon = L.divIcon({
        className: 'station-badge-marker',
        html: `
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background: ${color};
            color: #FFFFFF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: monospace;
            font-size: ${isSelected ? '11px' : '10px'};
            font-weight: 700;
            border: ${isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.9)'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            cursor: pointer;
            transition: transform 0.15s ease;
          " title="${st.name} (AQI: ${st.aqi})">
            ${st.aqi}
          </div>
        `,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13]
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: stationIcon })
        .bindPopup(`
          <div style="font-family: system-ui; font-size: 12px; min-width: 210px; line-height: 1.4;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
              <strong style="font-size: 13px;">${st.name}</strong>
              <div style="display: flex; gap: 4px; align-items: center;">
                ${st.is_ground_sensor ? '<span style="font-size: 9px; background: #2E7D32; color: #fff; padding: 1px 5px; border-radius: 3px;">CAAQMS GROUND</span>' : ''}
                <span style="font-size: 10px; color: #666;">${st.station_id}</span>
              </div>
            </div>
            <div style="margin: 4px 0; padding: 4px 8px; background: ${color}20; border-radius: 4px; border-left: 3px solid ${color};">
              <b>${st.category}</b> — Indian AQI: <b>${st.aqi}</b> ${st.aqi_us ? `(US AQI: <b>${st.aqi_us}</b>)` : ''}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-top: 6px;">
              <div>PM2.5: <b>${st.pm25} µg/m³</b></div>
              <div>PM10: <b>${st.pm10} µg/m³</b></div>
              <div>NO₂: <b>${st.no2 || 14} µg/m³</b></div>
              <div>O₃: <b>${st.o3 || 45} µg/m³</b></div>
            </div>
            <div style="font-size: 10px; color: #777; margin-top: 6px;">
              Type: ${st.station_type}
            </div>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; gap: 6px;">
              <div style="display: flex; gap: 8px;">
                <a href="${st.cpcb_url || 'https://app.cpcbccr.com/AQI_India/'}" target="_blank" rel="noopener noreferrer" style="color: #2E7D32; text-decoration: underline; font-weight: 600; font-size: 10px;">
                  CPCB Portal →
                </a>
                <a href="https://aqicn.org/city/delhi/" target="_blank" rel="noopener noreferrer" style="color: #1976D2; text-decoration: underline; font-weight: 600; font-size: 10px;">
                  WAQI Live →
                </a>
              </div>
              <span style="font-size: 9px; color: #888;">
                ${st.is_ground_sensor ? 'WAQI Telemetry' : 'CAMS Grid'}
              </span>
            </div>
          </div>
        `)
        .addTo(map);

      marker.on('click', () => {
        if (onSelectStation) {
          onSelectStation(st);
        }
      });
    });

  }, [stations, fires, plumes, stationFilter, selectedStation]);

  // Smooth pan to newly selected station
  useEffect(() => {
    if (leafletInstance.current && selectedStation?.latitude && selectedStation?.longitude) {
      if (prevStationRef.current !== selectedStation.station_id) {
        prevStationRef.current = selectedStation.station_id;
        leafletInstance.current.panTo([selectedStation.latitude, selectedStation.longitude], {
          animate: true,
          duration: 0.8
        });
      }
    }
  }, [selectedStation]);

  useEffect(() => {
    const handleResize = () => {
      if (leafletInstance.current) {
        leafletInstance.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const windSpd = transportConditions?.wind_speed_kmh || 10.0;
  const windDir = transportConditions?.wind_direction_deg || 315.0;
  const windFromCard = transportConditions?.wind_from_cardinal || 'NW';
  const downwindCard = transportConditions?.downwind_cardinal || 'SE';
  const isDirectInflux = (transportConditions?.delhi_threat_level || '').includes('Influx') || winterSimulation;

  return (
    <div className="card-zen" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Map Control Bar */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wind size={18} color="var(--accent-wind)" />
            <h3 className="card-title" style={{ fontSize: '1.15rem', margin: 0 }}>
              Continuous Monitoring Stations & Stubble Smoke Dispersion
            </h3>
          </div>

          {/* Quick Viewport Buttons & Simulation Switch */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {onToggleWinterSimulation && (
              <button
                className={`btn-zen ${winterSimulation ? 'primary' : ''}`}
                style={{ padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                onClick={onToggleWinterSimulation}
                title="Toggle between live synoptic weather and winter NW stubble smog corridor"
              >
                {winterSimulation ? '🔥 Winter NW Smog Sim (Active)' : '🧪 Test Winter NW Smog Episode'}
              </button>
            )}

            <button
              className="btn-zen"
              style={{ padding: '3px 9px', fontSize: '0.75rem' }}
              onClick={focusDelhiNCR}
              title="Focus all 40 Delhi NCR CAAQMS stations"
            >
              <Crosshair size={12} color="var(--text-primary)" /> Delhi NCR (40 Stations)
            </button>
            <button
              className="btn-zen"
              style={{ padding: '3px 9px', fontSize: '0.75rem' }}
              onClick={focusFarmFires}
              title="View NASA FIRMS farm fires in Punjab & Haryana"
            >
              <Flame size={12} color="var(--accent-plume)" /> Farm Fires (Punjab/HR)
            </button>
            <button
              className="btn-zen"
              style={{ padding: '3px 9px', fontSize: '0.75rem' }}
              onClick={resetAirshedView}
              title="View full regional airshed"
            >
              <ZoomIn size={12} /> Airshed View
            </button>
          </div>
        </div>

        {/* Dynamic Atmospheric Dispersion Status Banner */}
        <div style={{
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: isDirectInflux ? 'rgba(194, 77, 54, 0.08)' : 'rgba(63, 94, 77, 0.08)',
          border: `1px solid ${isDirectInflux ? 'rgba(194, 77, 54, 0.25)' : 'rgba(63, 94, 77, 0.25)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={15} color={isDirectInflux ? '#C24D36' : '#3F5E4D'} />
            <span>
              <strong>Prevailing Wind:</strong> {windDir}° ({windFromCard}) at {windSpd} km/h &rarr; 
              <strong> Plume Heading:</strong> {transportConditions?.downwind_heading_deg || 135}° ({downwindCard})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isDirectInflux ? (
              <>
                <AlertTriangle size={14} color="#C24D36" />
                <span style={{ color: '#C24D36', fontWeight: 600 }}>
                  Direct GT Road Transport Corridor &rarr; Influx to Delhi NCR Active
                </span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} color="#3F5E4D" />
                <span style={{ color: '#3F5E4D', fontWeight: 600 }}>
                  Plumes Deflected Away from Delhi &rarr; NCR Airshed Safe from Stubble Smoke
                </span>
              </>
            )}
          </div>
        </div>

        {/* Filters & Counters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem' }}>
          {/* Station Category Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`horizon-tab ${stationFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.6875rem' }}
              onClick={() => setStationFilter('all')}
            >
              All ({stations.length})
            </button>
            <button
              className={`horizon-tab ${stationFilter === 'urban' ? 'active' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.6875rem' }}
              onClick={() => setStationFilter('urban')}
            >
              Delhi Urban (24)
            </button>
            <button
              className={`horizon-tab ${stationFilter === 'industrial' ? 'active' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.6875rem' }}
              onClick={() => setStationFilter('industrial')}
            >
              Industrial (8)
            </button>
            <button
              className={`horizon-tab ${stationFilter === 'ncr' ? 'active' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.6875rem' }}
              onClick={() => setStationFilter('ncr')}
            >
              NCR Suburbs (8)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <Flame size={12} color="var(--accent-plume)" /> {fires.length} Active Fires (NASA FIRMS)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <MapPin size={12} color="var(--text-primary)" /> Showing {filteredStations.length} of {stations.length} Stations
            </span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapRef} style={{ height: '460px', width: '100%' }} />

      {/* Atmospheric Plume Map Legend */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: 'var(--color-surface-subtle)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.6875rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#C24D36', display: 'inline-block' }}></span>
            Active Fire Hotspot (NASA VIIRS)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '16px', height: '8px', borderRadius: '2px', backgroundColor: '#E65100', opacity: 0.7, display: 'inline-block' }}></span>
            Direct Influx Smoke Envelope (NCR Threat)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '16px', height: '8px', borderRadius: '2px', backgroundColor: '#78909C', opacity: 0.7, display: 'inline-block' }}></span>
            Deflected Smoke Envelope (Safe / Non-NCR)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '14px', borderTop: '2px dashed #C24D36', display: 'inline-block' }}></span>
            Centerline Transport Vector
          </span>
        </div>
        <div>
          <span>Gaussian Dispersion Model: Pasquill-Gifford $\sigma_y$ Transport</span>
        </div>
      </div>
    </div>
  );
}

