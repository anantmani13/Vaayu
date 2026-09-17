from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from backend.app.services.advisory.rag_engine import rag_advisor
from backend.app.services.ingestion.cpcb_client import cpcb_client

router = APIRouter()

class HealthQueryRequest(BaseModel):
    query: str
    user_profile: Optional[str] = "general" # asthma, elderly, child, outdoor_worker, general
    locality: Optional[str] = "Anand Vihar, Delhi"
    language: Optional[str] = "hi" # "hi" or "en"
    current_aqi: Optional[int] = None

@router.post("/query")
async def get_health_advisory(req: HealthQueryRequest) -> Dict[str, Any]:
    """
    Returns personalized, vernacular health guidance grounded in ICMR & WHO guidelines.
    """
    aqi = req.current_aqi
    if aqi is None:
        stations = await cpcb_client.fetch_all_stations()
        avg_pm25 = sum(s["pm25"] for s in stations) / len(stations)
        avg_pm10 = sum(s["pm10"] for s in stations) / len(stations)
        aqi = cpcb_client.compute_cpcb_aqi(avg_pm25, avg_pm10)
        
    return rag_advisor.generate_advisory(
        query=req.query,
        user_profile=req.user_profile,
        current_aqi=aqi,
        locality=req.locality,
        language=req.language
    )
