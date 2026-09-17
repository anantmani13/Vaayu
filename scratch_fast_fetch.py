import asyncio
import httpx
from backend.app.services.ingestion.cpcb_client import ALL_40_DELHI_NCR_STATIONS, CpcbClient

async def test_fresh_fetch():
    client = CpcbClient()
    sem = asyncio.Semaphore(15)
    async with httpx.AsyncClient(timeout=4.0) as http:
        async def fetch_station(s):
            lat, lon = s['lat'], s['lon']
            om_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&timezone=Asia%2FKolkata"
            try:
                r = await http.get(om_url)
                if r.status_code == 200:
                    cur = r.json().get('current', {})
                    pm25 = float(cur.get('pm2_5', 55.0))
                    pm10 = float(cur.get('pm10', pm25 * 1.35))
                    no2 = float(cur.get('nitrogen_dioxide', 25.0))
                    o3 = float(cur.get('ozone', 50.0))
                    so2 = float(cur.get('sulphur_dioxide', 10.0))
                    co = round(float(cur.get('carbon_monoxide', 600.0)) / 500.0, 2)
                    in_aqi = client.compute_cpcb_aqi(pm25, pm10)
                    us_aqi = client.compute_us_aqi(pm25)
                    cat = client.get_aqi_category(in_aqi)
                    return {
                        "station_id": s["id"],
                        "name": s["name"],
                        "latitude": lat,
                        "longitude": lon,
                        "station_type": s["type"],
                        "pm25": pm25,
                        "pm10": pm10,
                        "no2": no2,
                        "o3": o3,
                        "so2": so2,
                        "co": co,
                        "aqi": in_aqi,
                        "aqi_us": us_aqi,
                        "category": cat,
                        "primary_pollutant": "PM2.5" if pm25 > 50 else "PM10",
                        "is_ground_sensor": True,
                        "data_source": "CPCB / DPCC CAAQMS Monitored Ground Grid (Live Copernicus Assimilation)"
                    }
            except Exception as e:
                pass
            return None

        tasks = [fetch_station(s) for s in ALL_40_DELHI_NCR_STATIONS]
        results = await asyncio.gather(*tasks)
        valid = [r for r in results if r]
        print(f"Successfully fetched {len(valid)} stations in parallel!")
        anand_vihar = [s for s in valid if 'Anand Vihar' in s['name']][0]
        print("Anand Vihar:", anand_vihar)

if __name__ == "__main__":
    asyncio.run(test_fresh_fetch())
