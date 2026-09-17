import httpx

def test_live():
    # 1. Stations
    r_st = httpx.get('http://localhost:8000/api/v1/forecast/stations')
    print('Stations status:', r_st.status_code)
    stations = r_st.json()
    print(f'Total stations: {len(stations)}')

    anand = [s for s in stations if 'Anand Vihar' in s['name']][0]
    punjabi = [s for s in stations if 'Punjabi Bagh' in s['name']][0]
    mandir = [s for s in stations if 'Mandir Marg' in s['name']][0]
    bawana = [s for s in stations if 'Bawana' in s['name']][0]

    print(f"Anand Vihar: AQI={anand['aqi']} ({anand['category']}), US AQI={anand['aqi_us']}, PM2.5={anand['pm25']}, 24h Proj={anand['projected_24h_aqi']}")
    print(f"Punjabi Bagh: AQI={punjabi['aqi']} ({punjabi['category']}), US AQI={punjabi['aqi_us']}, PM2.5={punjabi['pm25']}, 24h Proj={punjabi['projected_24h_aqi']}")
    print(f"Mandir Marg: AQI={mandir['aqi']} ({mandir['category']}), US AQI={mandir['aqi_us']}, PM2.5={mandir['pm25']}, 24h Proj={mandir['projected_24h_aqi']}")
    print(f"Bawana: AQI={bawana['aqi']} ({bawana['category']}), US AQI={bawana['aqi_us']}, PM2.5={bawana['pm25']}, 24h Proj={bawana['projected_24h_aqi']}")

    # 2. Anand Vihar coupled forecast
    r_fc_anand = httpx.get('http://localhost:8000/api/v1/forecast/delhi?station_id=DL001')
    d_anand = r_fc_anand.json()
    print('\nAnand Vihar Calibrated City:', d_anand['city'])
    print('Anand Vihar Initial AQI:', d_anand['composite_aqi'])
    print('Anand Vihar Forecast +6h:', d_anand['forecast']['horizons']['6h']['pm25'], 'ug/m3 -> AQI:', d_anand['forecast']['horizons']['6h']['composite_aqi'])
    print('Anand Vihar Forecast +24h:', d_anand['forecast']['horizons']['24h']['pm25'], 'ug/m3 -> AQI:', d_anand['forecast']['horizons']['24h']['composite_aqi'])

    # 3. Punjabi Bagh coupled forecast
    r_fc_punjabi = httpx.get('http://localhost:8000/api/v1/forecast/delhi?station_id=DL002')
    d_punjabi = r_fc_punjabi.json()
    print('\nPunjabi Bagh Calibrated City:', d_punjabi['city'])
    print('Punjabi Bagh Initial AQI:', d_punjabi['composite_aqi'])
    print('Punjabi Bagh Forecast +6h:', d_punjabi['forecast']['horizons']['6h']['pm25'], 'ug/m3 -> AQI:', d_punjabi['forecast']['horizons']['6h']['composite_aqi'])
    print('Punjabi Bagh Forecast +24h:', d_punjabi['forecast']['horizons']['24h']['pm25'], 'ug/m3 -> AQI:', d_punjabi['forecast']['horizons']['24h']['composite_aqi'])

if __name__ == '__main__':
    test_live()
