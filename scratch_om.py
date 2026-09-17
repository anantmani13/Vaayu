import asyncio
import httpx
from backend.app.services.ingestion.cpcb_client import ALL_40_DELHI_NCR_STATIONS, CpcbClient

async def check_all():
    client = CpcbClient()
    async with httpx.AsyncClient() as http:
        for s in ALL_40_DELHI_NCR_STATIONS:
            lat, lon = s['lat'], s['lon']
            om_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm2_5,pm10,nitrogen_dioxide,ozone&timezone=Asia%2FKolkata"
            r = await http.get(om_url)
            cur = r.json().get('current', {})
            pm25 = cur.get('pm2_5')
            pm10 = cur.get('pm10')
            cpcb_aqi = client.compute_cpcb_aqi(pm25, pm10) if pm25 is not None and pm10 is not None else -1
            print(f"{s['id']} | {s['name'][:22]:22} | Lat: {lat:.3f}, Lon: {lon:.3f} | OM PM2.5: {pm25} | OM PM10: {pm10} -> CPCB AQI: {cpcb_aqi}")

if __name__ == "__main__":
    asyncio.run(check_all())
