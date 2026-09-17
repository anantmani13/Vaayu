@echo off
echo =========================================================================
echo VAAYU (वायु) — Atmospheric Intelligence & Health Advisory System
echo Starting FastAPI Backend (Port 8000) and React Vite Frontend (Port 5173)...
echo =========================================================================
echo.

start "Vaayu Backend [FastAPI]" cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "Vaayu Frontend [Vite]" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo Both services are launching!
echo Backend API Docs:  http://localhost:8000/docs
echo Frontend Web App:  http://localhost:5173
echo To generate a Global Public Link for judges, run tunnel\start_tunnel.bat
echo =========================================================================
