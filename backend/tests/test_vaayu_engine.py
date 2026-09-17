import pytest
from backend.app.services.forecasting.inversion_module import inversion_module
from backend.app.services.forecasting.coupling_engine import coupled_engine
from backend.app.services.attribution.source_classifier import source_classifier
from backend.app.services.attribution.plume_dispersion import plume_tracker
from backend.app.services.grap.classifier import grap_engine
from backend.app.services.advisory.rag_engine import rag_advisor

def test_inversion_module():
    # Severe winter inversion scenario: low PBL (300m), calm wind (1.0 m/s), cold night (12C)
    res = inversion_module.compute_isi(
        pbl_height_m=300.0,
        wind_speed_ms=1.0,
        temperature_c=12.0,
        relative_humidity=75.0,
        is_nighttime=True
    )
    assert res["inversion_severity_index"] >= 0.65
    assert "Severe" in res["status"] or "Moderate" in res["status"]
    assert res["trapping_efficiency_pct"] > 60.0

def test_coupled_forecasting_engine():
    current_readings = {"pm25": 280.0, "pm10": 420.0, "no2": 70.0, "o3": 25.0}
    weather = [
        {"temperature": 16.0, "wind_speed": 1.5, "wind_direction": 315.0, "pbl_height": 350.0, "relative_humidity": 70.0}
        for _ in range(72)
    ]
    forecast = coupled_engine.run_coupled_forecast(current_readings, weather, stubble_fire_count=50)
    
    assert "horizons" in forecast
    assert "24h" in forecast["horizons"]
    assert "72h" in forecast["horizons"]
    # Verify that coupled model captures particulate trapping (positive coupling delta)
    assert forecast["overall_coupling_delta"]["delta_pm25_ugm3"] > 0
    assert forecast["overall_coupling_delta"]["retention_gain_pct"] > 5.0

def test_source_apportionment():
    res = source_classifier.calculate_apportionment(
        pm25=320.0,
        pm10=450.0,
        no2=75.0,
        so2=20.0,
        wind_direction_deg=315.0, # NW wind from Punjab
        fire_count=65,
        isi=0.78
    )
    pcts = res["breakdown_percentages"]
    total = sum(pcts.values())
    assert 99.0 <= total <= 101.0
    assert pcts["stubble_burning"] > 20.0 # Significant stubble contribution under NW wind

def test_plume_dispersion_tracker():
    fires = [{"region": "Sangrur, Punjab", "latitude": 30.24, "longitude": 75.84, "frp": 85.0}]
    
    # Case 1: NW Wind (315 deg) blowing towards Delhi NCR (135 deg SE)
    res_nw = plume_tracker.project_plume_dispersion(
        fire_clusters=fires,
        wind_speed_ms=2.5,
        wind_direction_deg=315.0,
        pbl_height_m=400.0,
        isi=0.75
    )
    assert len(res_nw["plumes"]) >= 1
    plume_nw = res_nw["plumes"][0]
    assert plume_nw["distance_to_delhi_km"] > 150.0
    assert len(plume_nw["trajectory"]) == 8 # 0, 6, 12, 18, 24, 36, 48, 72h
    assert len(plume_nw["plume_polygon"]) > 10 # Gaussian envelope polygon generated
    assert plume_nw["reaches_delhi"] is True
    assert "Delhi NCR Expected" in plume_nw["impact_status"]
    assert plume_nw["estimated_arrival_in_delhi_hours"] is not None

    # Case 2: ENE Wind (74 deg) blowing towards WSW away from Delhi
    res_ene = plume_tracker.project_plume_dispersion(
        fire_clusters=fires,
        wind_speed_ms=3.0,
        wind_direction_deg=74.0,
        pbl_height_m=800.0,
        isi=0.5
    )
    plume_ene = res_ene["plumes"][0]
    assert plume_ene["reaches_delhi"] is False
    assert "Deflected" in plume_ene["impact_status"]
    assert plume_ene["estimated_arrival_in_delhi_hours"] is None

def test_grap_stage_engine():
    # Test Stage III (AQI > 400)
    res = grap_engine.evaluate_grap_stage(current_aqi=420, forecast_aqi_72h=[425, 430, 440])
    assert res["current_stage"] == "STAGE_III"
    assert "STAGE III" in res["auto_drafted_notice"]["mandate_title"]
    assert len(res["auto_drafted_notice"]["action_checklist"]) >= 4

def test_rag_advisory():
    res = rag_advisor.generate_advisory(
        query="I have asthma, can I go outside?",
        user_profile="asthma",
        current_aqi=380,
        language="en"
    )
    assert "advisory_text" in res
    assert "asthma" in res["profile_matched"].lower()
    assert "ICMR" in res["citation"]

@pytest.mark.anyio
async def test_40_stations_and_nearest_detection():
    from backend.app.services.ingestion.cpcb_client import ALL_40_DELHI_NCR_STATIONS, cpcb_client
    from backend.app.api.v1.endpoints.forecast import get_nearest_station
    
    assert len(ALL_40_DELHI_NCR_STATIONS) == 40
    stations = await cpcb_client.fetch_all_stations()
    assert len(stations) == 40
    
    # Test nearest station to Central Secretariat / Lodhi Road coordinates (28.588, 77.221)
    res = await get_nearest_station(28.588, 77.221)
    assert "nearest_station" in res
    assert res["nearest_station"]["distance_km"] < 3.0
    assert "Lodhi Road" in res["nearest_station"]["name"] or "Jawaharlal Nehru" in res["nearest_station"]["name"]

def test_vernacular_speech_and_topic_rag():
    # Test Hindi jogging query
    res_hi = rag_advisor.generate_advisory(
        query="क्या मैं सुबह दौड़ने जा सकता हूँ?",
        user_profile="asthma",
        current_aqi=320,
        locality="Rohini, Delhi",
        language="hi"
    )
    assert "दौड़ने" in res_hi["advisory_text"] or "सैर" in res_hi["advisory_text"] or "व्यायाम" in res_hi["advisory_text"]
    assert "ICMR" in res_hi["citation"]
    
    # Test English mask query
    res_en = rag_advisor.generate_advisory(
        query="Which mask is best: cloth or N95?",
        user_profile="general",
        current_aqi=310,
        locality="Anand Vihar, Delhi",
        language="en"
    )
    assert "N95" in res_en["advisory_text"]

@pytest.mark.anyio
async def test_station_calibrated_coupled_forecast():
    from backend.app.api.v1.endpoints.forecast import get_delhi_forecast
    from backend.app.services.ingestion.cpcb_client import cpcb_client
    
    stations = await cpcb_client.fetch_all_stations()
    assert len(stations) == 40
    
    # Verify all stations have vital fields
    for st in stations:
        assert "aqi" in st and st["aqi"] > 0
        assert "pm25" in st and st["pm25"] > 0
        assert "projected_24h_aqi" in st
        assert "forecast_trend" in st
        assert "category" in st

    # Anand Vihar station-specific coupled forecast
    res_anand = await get_delhi_forecast(station_id="DL001")
    assert res_anand["target_station"] is not None
    assert "Anand Vihar" in res_anand["target_station"]["name"]
    assert res_anand["forecast"]["horizons"]["6h"]["pm25"] > 10.0
    
    # Punjabi Bagh station-specific coupled forecast
    res_punjabi = await get_delhi_forecast(station_id="DL002")
    assert res_punjabi["target_station"] is not None
    assert "Punjabi Bagh" in res_punjabi["target_station"]["name"]

    # Wazirpur industrial station coupled forecast
    res_wazirpur = await get_delhi_forecast(station_id="DL008")
    assert res_wazirpur["target_station"] is not None
    assert "Wazirpur" in res_wazirpur["target_station"]["name"]

    # Sector 62 Noida (NCR) station coupled forecast
    res_noida = await get_delhi_forecast(station_id="NCR035")
    assert res_noida["target_station"] is not None
    assert "Noida" in res_noida["target_station"]["name"]
    
    # The forecasts must reflect the differing ground realities across distinct stations
    assert res_anand["forecast"]["horizons"]["6h"]["pm25"] != res_punjabi["forecast"]["horizons"]["6h"]["pm25"]
    assert res_wazirpur["forecast"]["horizons"]["6h"]["pm25"] != res_noida["forecast"]["horizons"]["6h"]["pm25"]
    assert len(res_noida["forecast"]["hourly_trajectory"]) >= 24
