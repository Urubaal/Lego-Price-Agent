@echo off
echo LEGO Price Agent - Docker Setup
echo ================================
echo.

echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo Docker is available
echo.

echo Step 1: Starting database services...
docker-compose up -d db redis
if errorlevel 1 (
    echo ERROR: Failed to start database services
    pause
    exit /b 1
)
echo Database services started
echo.

echo Step 2: Waiting for database to be ready...
timeout /t 10 /nobreak >nul
echo.

echo Step 3: Installing Python dependencies...
docker-compose run --rm backend pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo Python dependencies installed
echo.

echo Step 4: Installing Node.js dependencies...
docker-compose run --rm frontend npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo Node.js dependencies installed
echo.

echo Step 5: Running database migrations...
docker-compose run --rm backend alembic init alembic
docker-compose run --rm backend alembic revision --autogenerate -m "Initial migration"
docker-compose run --rm backend alembic upgrade head
if errorlevel 1 (
    echo ERROR: Failed to run database migrations
    pause
    exit /b 1
)
echo Database migrations completed
echo.

echo Step 6: Starting all services...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start services
    pause
    exit /b 1
)
echo.

echo ================================
echo Setup completed successfully!
echo ================================
echo.
echo Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   API Documentation: http://localhost:8000/docs
echo.
echo Next steps:
echo   1. Open http://localhost:3000 in your browser
echo   2. Register a new account
echo   3. Start using the LEGO Price Agent!
echo.
echo Development commands:
echo   - View logs: docker-compose logs -f
echo   - Stop services: docker-compose down
echo   - Restart services: docker-compose restart
echo.
pause 