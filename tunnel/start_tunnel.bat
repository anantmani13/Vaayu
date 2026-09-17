@echo off
echo =========================================================================
echo VAAYU - GLOBAL PUBLIC LINK GENERATOR
echo Creating a global HTTPS URL for remote access (Judges, Mobile, Mentors)...
echo =========================================================================
echo.
echo Forwarding local port 5173 to public Internet...
echo.
npx localtunnel --port 5173
pause
