import asyncio
from backend.app.services.forecasting.coupling_engine import coupled_engine
from backend.app.services.ingestion.weather_client import weather_client
from backend.app.services.ingestion.cpcb_client import cpcb_client

async def test_coupled():
    w = await weather_client.fetch_meteorology()
    hourly_weather = w.get("hourly", [])
    chemistry_hourly = await cpcb_client.fetch_hourly_chemistry()
    
    # 40 stations realistic average
    avg_pm25 = 83.8
    avg_pm10 = 86.5
    avg_no2 = 45.0
    avg_o3 = 80.0
    
    fc = coupled_engine.run_coupled_forecast(
        current_readings={"pm25": avg_pm25, "pm10": avg_pm10, "no2": avg_no2, "o3": avg_o3},
        weather_forecast=hourly_weather,
        stubble_fire_count=12,
        chemistry_forecast=chemistry_hourly,
        is_winter_simulation=False
    )
    
    print("Forecast summary:")
    print("Horizons count:", len(fc.get("horizons", [])))
    for h in fc.get("horizons", []):
        print(f"  {h['horizon']} -> Coupled AQI: {h['coupled_aqi']}, PM2.5: {h['pm25']}, Cat: {h['category']}, Delta: {h['coupling_delta_pct']}%")

if __name__ == "__main__":
    asyncio.run(test_coupled())
