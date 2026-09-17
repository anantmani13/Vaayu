from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.endpoints import forecast, attribution, grap, advisory, historical

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "High-resolution coupled weather-chemistry forecasting system for Delhi NCR. "
        "Models atmospheric inversion feedback loops, stubble-burning plume dispersion, "
        "and delivers grounded vernacular health guidance."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware (permits local Vite dev server and global tunnel domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(forecast.router, prefix=f"{settings.API_V1_STR}/forecast", tags=["Coupled Forecasting"])
app.include_router(attribution.router, prefix=f"{settings.API_V1_STR}/attribution", tags=["Source Apportionment & Plumes"])
app.include_router(grap.router, prefix=f"{settings.API_V1_STR}/grap", tags=["CAQM GRAP Compliance"])
app.include_router(advisory.router, prefix=f"{settings.API_V1_STR}/advisory", tags=["Vernacular Health Advisory"])
app.include_router(historical.router, prefix=f"{settings.API_V1_STR}/historical", tags=["2015-2026 Historical Archive"])

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "aesthetic": "Wabi-Sabi Organic Environmental Intelligence",
        "docs": "/docs",
        "endpoints": {
            "delhi_forecast": f"{settings.API_V1_STR}/forecast/delhi",
            "stations": f"{settings.API_V1_STR}/forecast/stations",
            "attribution": f"{settings.API_V1_STR}/attribution",
            "grap_status": f"{settings.API_V1_STR}/grap/status",
            "health_advisory": f"{settings.API_V1_STR}/advisory/query",
            "historical_archive": f"{settings.API_V1_STR}/historical/summary"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
