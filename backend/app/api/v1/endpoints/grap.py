from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.app.services.ingestion.cpcb_client import cpcb_client
from backend.app.services.ingestion.weather_client import weather_client
from backend.app.services.forecasting.coupling_engine import coupled_engine
from backend.app.services.grap.classifier import grap_engine

router = APIRouter()

class DispatchActionRequest(BaseModel):
    bulletin_id: str
    officer_name: str = "Nodal Officer, CAQM"
    action_notes: str = "Approved for public dispatch across NCR municipal jurisdictions."

@router.get("/status")
async def get_grap_status() -> Dict[str, Any]:
    """
    Returns current active GRAP stage, 72h forecast trajectory evaluation,
    and statutory compliance notice ready for officer sign-off.
    """
    stations = await cpcb_client.fetch_all_stations()
    weather_data = await weather_client.fetch_meteorology()
    
    avg_pm25 = sum(s["pm25"] for s in stations) / len(stations)
    avg_pm10 = sum(s["pm10"] for s in stations) / len(stations)
    current_aqi = cpcb_client.compute_cpcb_aqi(avg_pm25, avg_pm10)
    
    forecast_results = coupled_engine.run_coupled_forecast(
        current_readings={"pm25": avg_pm25, "pm10": avg_pm10},
        weather_forecast=weather_data.get("hourly", [])
    )
    
    forecast_aqi_72h = [p["composite_aqi"] for p in forecast_results.get("hourly_trajectory", [])]
    
    return grap_engine.evaluate_grap_stage(
        current_aqi=current_aqi,
        forecast_aqi_72h=forecast_aqi_72h
    )

@router.post("/dispatch")
async def dispatch_grap_notice(req: DispatchActionRequest) -> Dict[str, Any]:
    """
    Simulates official sign-off and public dispatch of the auto-drafted GRAP compliance bulletin.
    """
    return {
        "status": "SUCCESS",
        "bulletin_id": req.bulletin_id,
        "dispatched_by": req.officer_name,
        "dispatch_network": [
            "Delhi Pollution Control Committee (DPCC)",
            "Haryana State Pollution Control Board (HSPCB)",
            "UP Pollution Control Board (UPPCB)",
            "Delhi Police (Traffic Division)",
            "Directorate of Education (DoE, Delhi NCR)"
        ],
        "message": "Statutory compliance mandate successfully broadcasted across NCR nodal authorities."
    }
