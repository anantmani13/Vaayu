import os
from typing import List
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv

# Load from backend/.env if it exists, otherwise current working directory .env
_env_backend = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_backend.exists():
    load_dotenv(_env_backend)
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vaayu — Coupled AQI Forecasting & Vernacular Advisory"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # External APIs
    NASA_FIRMS_MAP_KEY: str = os.getenv("NASA_FIRMS_MAP_KEY", "e44dbff991ec206308d0cef5f204ba73")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DATA_GOV_IN_API_KEY: str = os.getenv("DATA_GOV_IN_API_KEY", "")
    WAQI_API_TOKEN: str = os.getenv("WAQI_API_TOKEN", "9c2cee10570d9a5bee584f8eef5ea5a7d94f4538")
    
    # Server configuration
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: List[str] = ["*"]
    
    # Geographic Focus: Delhi NCR Coordinates & Airshed Bounds
    DELHI_LAT: float = 28.6139
    DELHI_LON: float = 77.2090
    
    # Airshed bounding box (Punjab, Haryana, Delhi NCR, Western UP)
    AIRSHED_BBOX: dict = {
        "lat_min": 28.0,
        "lon_min": 74.0,
        "lat_max": 32.5,
        "lon_max": 78.5
    }
    
    # Model parameters
    FORECAST_HORIZONS: List[int] = [6, 24, 48, 72]
    COUPLED_ITERATIONS: int = 3
    
    class Config:
        case_sensitive = True

settings = Settings()
