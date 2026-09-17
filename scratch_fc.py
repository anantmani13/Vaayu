import httpx

r = httpx.get('http://localhost:8000/api/v1/forecast/delhi')
d = r.json()
print('Composite AQI:', d.get('composite_aqi'))
print('Category:', d.get('category'))
print('Pollutants:', d.get('pollutants'))
print('Forecast horizons:', [h['horizon'] for h in d.get('forecast', {}).get('horizons', [])])
for h in d.get('forecast', {}).get('horizons', []):
    print(f"  Horizon {h['horizon']}: Coupled AQI={h.get('coupled_aqi')}, PM2.5={h.get('pm25')}")
