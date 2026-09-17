from fastapi import APIRouter
from typing import Dict, Any
from backend.app.services.ingestion.firms_client import firms_client
from backend.app.services.ingestion.weather_client import weather_client
from backend.app.services.ingestion.cpcb_client import cpcb_client
from backend.app.services.attribution.source_classifier import source_classifier
from backend.app.services.attribution.plume_dispersion import plume_tracker
from backend.app.services.forecasting.inversion_module import inversion_module

import time

router = APIRouter()

_ATTRIBUTION_CACHE = {}
_CACHE_TTL_SEC = 300

@router.get("")
async def get_attribution_and_plumes(winter_simulation: bool = False, force_refresh: bool = False) -> Dict[str, Any]:
    """
    Returns source apportionment breakdown, active NASA FIRMS fire markers,
    and 72-hour forward stubble-burning plume dispersion model.
    Supports winter_simulation mode to evaluate the peak North-Westerly stubble smog corridor.
    Includes 5-minute caching for rock-solid stability and instant loading.
    """
    cache_key = winter_simulation
    now = time.time()
    if not force_refresh and cache_key in _ATTRIBUTION_CACHE:
        cached_entry, cached_time = _ATTRIBUTION_CACHE[cache_key]
        if now - cached_time < _CACHE_TTL_SEC:
            return cached_entry

    # 1. Fetch live inputs
    if winter_simulation:
        fires = firms_client._generate_representative_fires()
    else:
        fires = await firms_client.fetch_active_fires(days=1)
        
    weather_data = await weather_client.fetch_meteorology()
    stations = await cpcb_client.fetch_all_stations()
    
    current_w = weather_data.get("current", {})
    
    if winter_simulation:
        # Classic November post-monsoon stubble episode:
        # North-Westerly wind (315°) transporting smoke from Punjab/Haryana down the GT Road corridor into NCR
        wind_spd = 2.8 # 10.0 km/h moderate transport wind
        wind_dir = 315.0 # North-Westerly (Downwind heading: 135° SE straight to Delhi)
        pbl = 340.0 # Shallow winter boundary layer
        temp = 16.5
        rh = 74.0
        isi = 0.84
    else:
        wind_spd = current_w.get("wind_speed", 2.0)
        wind_dir = current_w.get("wind_direction", 315.0)
        pbl = current_w.get("pbl_height", 1400.0)
        temp = current_w.get("temperature", 32.0)
        rh = current_w.get("relative_humidity", 60.0)
        
        # Authoritative Indian Standard Time (IST = UTC + 5:30) for Delhi NCR airshed
        from datetime import datetime, timezone, timedelta
        ist_tz = timezone(timedelta(hours=5, minutes=30))
        now_ist = datetime.now(timezone.utc).astimezone(ist_tz)
        is_night = (now_ist.hour >= 19 or now_ist.hour < 6)
        
        inv_state = inversion_module.compute_isi(pbl, wind_spd, temp, rh, is_nighttime=is_night)
        isi = inv_state["inversion_severity_index"]
    
    avg_pm25 = sum(s["pm25"] for s in stations) / len(stations)
    avg_pm10 = sum(s["pm10"] for s in stations) / len(stations)
    avg_no2 = sum(s["no2"] for s in stations) / len(stations)
    avg_so2 = sum(s["so2"] for s in stations) / len(stations)
    
    # 2. Compute source apportionment
    apportionment = source_classifier.calculate_apportionment(
        pm25=avg_pm25,
        pm10=avg_pm10,
        no2=avg_no2,
        so2=avg_so2,
        wind_direction_deg=wind_dir,
        fire_count=len(fires),
        isi=isi
    )
    
    # 3. Project 72h Gaussian plume dispersion
    plume_results = plume_tracker.project_plume_dispersion(
        fire_clusters=fires,
        wind_speed_ms=wind_spd,
        wind_direction_deg=wind_dir,
        pbl_height_m=pbl,
        isi=isi
    )
    
    res_payload = {
        "seasonal_mode": f"Winter Smog Episode (315° NW Corridor • {len(fires)} Active Satellite Clusters)" if winter_simulation else "Live Synoptic Meteorology (Open-Meteo Sensor Stream)",
        "is_winter_simulation": winter_simulation,
        "source_apportionment": apportionment,
        "active_fires_detected": {
            "count": len(fires),
            "satellite_provider": "NASA FIRMS (VIIRS/MODIS)",
            "clusters": fires[:30] # return top fire points for map rendering
        },
        "plume_dispersion": plume_results,
        "atmospheric_context": {
            "inversion_severity_index": isi,
            "wind_vector": {
                "speed_ms": wind_spd,
                "direction_deg": wind_dir,
                "direction_label": "North-Westerly (Direct GT Road Corridor to NCR)" if 285 <= wind_dir <= 340 else f"{plume_tracker._bearing_to_cardinal(wind_dir)} (Deflecting Away from NCR)"
            }
        }
    }
    _ATTRIBUTION_CACHE[cache_key] = (res_payload, now)
    return res_payload
