@echo off
echo ==========================================
echo    FacePulse AI - Setup & Installation
echo ==========================================

echo.
echo [1/3] Checking Dependencies...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+.
    exit /b 1
)

where go >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Go (Golang) not found. Backend will not run.
)

echo.
echo [2/3] Installing Frontend Dependencies...
cd frontend
call npm install

echo.
echo [3/3] Setting up Backend...
cd ../backend-go
go mod tidy

echo.
echo ==========================================
echo    Setup Complete! 
echo.
echo To start the app:
echo 1. Start Backend: cd backend-go && go run main.go
echo 2. Start Frontend: cd frontend && npm run dev
echo ==========================================
pause
