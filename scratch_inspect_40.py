import asyncio
import httpx
from backend.app.services.ingestion.cpcb_client import ALL_40_DELHI_NCR_STATIONS, CpcbClient

async def inspect_all():
    client = CpcbClient()
    sem = asyncio.Semaphore(10)
    async with httpx.AsyncClient(timeout=6.0) as http:
        async def get_st(s):
            async with sem:
                lat, lon = s['lat'], s['lon']
                url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&timezone=Asia%2FKolkata"
                try:
                    r = await http.get(url)
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
                        "id": s["id"],
                        "name": s["name"],
                        "pm25": pm25,
                        "pm10": pm10,
                        "in_aqi": in_aqi,
                        "us_aqi": us_aqi,
                        "cat": cat,
                        "time": cur.get("time")
                    }
                except Exception as e:
                    return {"id": s["id"], "name": s["name"], "error": str(e)}

        results = await asyncio.gather(*[get_st(s) for s in ALL_40_DELHI_NCR_STATIONS])
        
    print(f"{'ID':7} | {'Station Name':25} | {'PM2.5':6} | {'PM10':6} | {'CPCB AQI':8} | {'US AQI':6} | {'Category':12} | {'Time'}")
    print("-" * 85)
    for r in results:
        print(f"{r['id']:7} | {r['name'][:25]:25} | {r['pm25']:6.1f} | {r['pm10']:6.1f} | {r['in_aqi']:8} | {r['us_aqi']:6} | {r['cat']:12} | {r['time']}")

    avg_pm25 = sum(r['pm25'] for r in results) / len(results)
    avg_pm10 = sum(r['pm10'] for r in results) / len(results)
    comp_aqi = client.compute_cpcb_aqi(avg_pm25, avg_pm10)
    print("\n--- REGIONAL SUMMARY ---")
    print(f"Delhi-NCR Mean PM2.5: {avg_pm25:.1f} ug/m3")
    print(f"Delhi-NCR Mean PM10:  {avg_pm10:.1f} ug/m3")
    print(f"Delhi-NCR Composite CPCB AQI: {comp_aqi} ({client.get_aqi_category(comp_aqi)})")

if __name__ == "__main__":
    asyncio.run(inspect_all())
