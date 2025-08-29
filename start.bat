@echo off
echo Starting MERN Blog Application...

echo.
echo Checking Docker installation...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo.
echo Building and starting all services...
docker compose up --build -d

echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak > nul

echo.
echo Services Status:
docker compose ps

echo.
echo Application URLs:
echo Frontend: http://localhost:3001
echo Backend API: http://localhost:3000
echo MongoDB: localhost:27017

echo.
echo Useful commands:
echo View logs: docker compose logs -f
echo Stop services: docker compose down
echo Stop and remove volumes: docker compose down -v

pause