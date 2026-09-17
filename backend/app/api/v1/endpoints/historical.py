from fastapi import APIRouter
from typing import Dict, Any
from backend.app.services.ingestion.dataset_loader import historical_loader

router = APIRouter()

@router.get("/summary")
async def get_historical_summary() -> Dict[str, Any]:
    """
    Returns multi-year (2015–2026) trends, winter inversion episode frequencies,
    and seasonal air quality profiles across Delhi NCR.
    """
    return historical_loader.get_historical_summary()
