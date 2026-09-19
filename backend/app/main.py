from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.core.config import settings
from backend.app.api.v1.endpoints import forecast, attribution, grap, advisory, historical
# High-Resolution Coupled Environmental Intelligence System for Delhi NCR (Vaayu)
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

# API Status Endpoint
@app.get(f"{settings.API_V1_STR}/status")
def api_status():
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

# Static Files & SPA Frontend Serving for Production Deployments (Render, Railway, Docker)
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
assets_dir = frontend_dist / "assets"

if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(frontend_dist / "index.html")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        candidate = frontend_dist / full_path
        if candidate.exists() and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return api_status()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

