from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.services.ingestion.cpcb_client import cpcb_client
from backend.app.services.ingestion.weather_client import weather_client
from backend.app.services.ingestion.firms_client import firms_client
from backend.app.services.forecasting.coupling_engine import coupled_engine
from backend.app.services.forecasting.inversion_module import inversion_module

router = APIRouter()

import asyncio
import time
from typing import Optional

_FORECAST_CACHE = {}
_CACHE_TTL_SEC = 300

@router.get("/delhi")
async def get_delhi_forecast(
    winter_simulation: bool = False,
    station_id: Optional[str] = None,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Returns live atmospheric state, Inversion Severity Index (ISI),
    and 72-hour coupled weather-chemistry forecast with Coupling Delta.
    Supports station-specific coupled forecast calibration via station_id.
    Includes 5-minute response caching to eliminate latency and prevent value jitter.
    """
    cache_key = (winter_simulation, station_id)
    now = time.time()
    if not force_refresh and cache_key in _FORECAST_CACHE:
        entry, ts = _FORECAST_CACHE[cache_key]
        if now - ts < _CACHE_TTL_SEC:
            return entry

    # 1. Fetch live weather, stations, fires & chemistry concurrently (~1.4s)
    weather_data, stations, fires, chemistry_hourly = await asyncio.gather(
        weather_client.fetch_meteorology(),
        cpcb_client.fetch_all_stations(force_refresh=force_refresh),
        firms_client.fetch_active_fires(days=1),
        cpcb_client.fetch_hourly_chemistry()
    )
    
    # 2. Average city readings
    avg_pm25 = sum(s["pm25"] for s in stations) / len(stations)
    avg_pm10 = sum(s["pm10"] for s in stations) / len(stations)
    avg_no2 = sum(s["no2"] for s in stations) / len(stations)
    avg_o3 = sum(s["o3"] for s in stations) / len(stations)
    composite_aqi = cpcb_client.compute_cpcb_aqi(avg_pm25, avg_pm10)
    category = cpcb_client.get_aqi_category(composite_aqi)
    
    # Check if a specific station was requested
    target_station = None
    if station_id:
        target_station = next(
            (s for s in stations if s["station_id"] == station_id or s.get("id") == station_id or s["name"].lower() == station_id.lower()),
            None
        )

    if target_station:
        forecast_initial_readings = {
            "pm25": target_station["pm25"],
            "pm10": target_station["pm10"],
            "no2": target_station["no2"],
            "o3": target_station["o3"]
        }
        active_aqi = target_station["aqi"]
        active_category = target_station["category"]
        location_label = f"{target_station['name']}, Delhi NCR"
    else:
        forecast_initial_readings = {
            "pm25": avg_pm25,
            "pm10": avg_pm10,
            "no2": avg_no2,
            "o3": avg_o3
        }
        active_aqi = composite_aqi
        active_category = category
        location_label = "Delhi National Capital Region (NCR)"

    current_weather = weather_data.get("current", {})
    hourly_weather = weather_data.get("hourly", [])
    
    # Authoritative Indian Standard Time (IST = UTC + 5:30) for Delhi NCR airshed
    from datetime import datetime, timezone, timedelta
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(timezone.utc).astimezone(ist_tz)
    is_night = (now_ist.hour >= 19 or now_ist.hour < 6)
    
    # 3. Inversion check using current weather
    inversion_state = inversion_module.compute_isi(
        pbl_height_m=current_weather.get("pbl_height", 1400.0),
        wind_speed_ms=current_weather.get("wind_speed", 3.0),
        temperature_c=current_weather.get("temperature", 32.0),
        relative_humidity=current_weather.get("relative_humidity", 60.0),
        is_nighttime=is_night
    )
    
    # 4. Run coupled weather-chemistry 72h forecast calibrated to target station or composite
    forecast_results = coupled_engine.run_coupled_forecast(
        current_readings=forecast_initial_readings,
        weather_forecast=hourly_weather,
        stubble_fire_count=len(fires),
        chemistry_forecast=chemistry_hourly,
        is_winter_simulation=winter_simulation
    )
    
    # Statutory NAAQS Mandate Normal Benchmarks (CPCB / MoEFCC statutory limits)
    mandate_normals = {
        "pm25_24h_limit_ugm3": 60.0,
        "pm10_24h_limit_ugm3": 100.0,
        "no2_24h_limit_ugm3": 80.0,
        "o3_8h_limit_ugm3": 100.0,
        "aqi_acceptable_ceiling": 100,
        "regulatory_framework": "National Ambient Air Quality Standards (NAAQS 2009 / MoEFCC Notification)"
    }
    
    active_us_aqi = target_station.get("aqi_us") if target_station else cpcb_client.compute_us_aqi(forecast_initial_readings["pm25"])

    res_payload = {
        "city": location_label,
        "target_station": target_station,
        "composite_aqi": active_aqi,
        "composite_aqi_us": active_us_aqi,
        "category": active_category,
        "pollutants": {
            "pm25": round(forecast_initial_readings["pm25"], 1),
            "pm10": round(forecast_initial_readings["pm10"], 1),
            "no2": round(forecast_initial_readings["no2"], 1),
            "o3": round(forecast_initial_readings["o3"], 1)
        },
        "meteorology": current_weather,
        "inversion_layer": inversion_state,
        "active_fire_count_regional": len(fires),
        "synoptic_assimilation_cycle": weather_data.get("synoptic_assimilation_cycle", {
            "last_cycle": "11:30 IST",
            "next_cycle": "17:30 IST",
            "assimilation_frequency": "Every 6 Hours (00, 06, 12, 18 UTC)"
        }),
        "mandate_normals": mandate_normals,
        "forecast": forecast_results
    }
    _FORECAST_CACHE[cache_key] = (res_payload, now)
    return res_payload

import math

@router.get("/stations")
async def get_stations(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """
    Returns live readings across all 40 Delhi NCR continuous ambient air quality monitoring stations (CAAQMS).
    Supports force_refresh=true to bypass internal cache.
    """
    return await cpcb_client.fetch_all_stations(force_refresh=force_refresh)

@router.get("/stations/nearest")
async def get_nearest_station(lat: float, lon: float) -> Dict[str, Any]:
    """
    Calculates Haversine distance from given coordinates to all 40 CAAQMS monitoring stations
    and returns the closest station with exact distance in kilometers.
    """
    stations = await cpcb_client.fetch_all_stations()
    if not stations:
        return {"error": "No stations available"}

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371.0 # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    stations_with_dist = []
    for st in stations:
        dist_km = haversine(lat, lon, st["latitude"], st["longitude"])
        st_copy = dict(st)
        st_copy["distance_km"] = dist_km
        stations_with_dist.append(st_copy)

    stations_with_dist.sort(key=lambda x: x["distance_km"])
    nearest = stations_with_dist[0]
    
    return {
        "user_coordinates": {"latitude": lat, "longitude": lon},
        "nearest_station": nearest,
        "closest_5_stations": stations_with_dist[:5]
    }
