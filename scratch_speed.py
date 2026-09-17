import asyncio
import time
import httpx
from backend.app.services.ingestion.cpcb_client import ALL_40_DELHI_NCR_STATIONS, CpcbClient

async def test_speed():
    client = CpcbClient()
    start = time.time()
    sem = asyncio.Semaphore(15)
    async with httpx.AsyncClient(timeout=5.0) as http:
        async def fetch(s):
            lat, lon = s['lat'], s['lon']
            url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&timezone=Asia%2FKolkata"
            async with sem:
                r = await http.get(url)
                cur = r.json().get('current', {})
                pm25 = float(cur.get('pm2_5', 55.0))
                pm10 = float(cur.get('pm10', pm25 * 1.3))
                aqi = client.compute_cpcb_aqi(pm25, pm10)
                return s['id'], s['name'], pm25, aqi

        results = await asyncio.gather(*[fetch(s) for s in ALL_40_DELHI_NCR_STATIONS])
    duration = time.time() - start
    print(f"Fetched all {len(results)} stations in {duration:.2f} seconds!")
    for sid, name, pm25, aqi in results[:10]:
        print(f"  {sid} | {name:20} | PM2.5: {pm25:5.1f} | CPCB AQI: {aqi}")

if __name__ == "__main__":
    asyncio.run(test_speed())
