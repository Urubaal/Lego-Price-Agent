# LEGO Price Agent - Prerequisites Installation Script
# Run this script as Administrator

Write-Host "LEGO Price Agent - Prerequisites Check" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "WARNING: This script should be run as Administrator for best results." -ForegroundColor Yellow
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
}

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python is installed: $pythonVersion" -ForegroundColor Green
        $pythonInstalled = $true
    } else {
        Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
        $pythonInstalled = $false
    }
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    $pythonInstalled = $false
}

# Check Docker
Write-Host "Checking Docker installation..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
        $dockerInstalled = $true
    } else {
        Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
        $dockerInstalled = $false
    }
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    $dockerInstalled = $false
}

Write-Host ""
Write-Host "Installation Recommendations:" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

if (-not $pythonInstalled) {
    Write-Host "1. Install Python:" -ForegroundColor White
    Write-Host "   - Go to: https://www.python.org/downloads/" -ForegroundColor Gray
    Write-Host "   - Download Python 3.11 or later" -ForegroundColor Gray
    Write-Host "   - IMPORTANT: Check 'Add Python to PATH' during installation" -ForegroundColor Red
    Write-Host ""
}

if (-not $dockerInstalled) {
    Write-Host "2. Install Docker Desktop:" -ForegroundColor White
    Write-Host "   - Go to: https://www.docker.com/products/docker-desktop/" -ForegroundColor Gray
    Write-Host "   - Download Docker Desktop for Windows" -ForegroundColor Gray
    Write-Host "   - Install and start Docker Desktop" -ForegroundColor Gray
    Write-Host ""
}

if ($pythonInstalled -and $dockerInstalled) {
    Write-Host "🎉 All prerequisites are installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run the setup:" -ForegroundColor White
    Write-Host "  python setup_dev.py" -ForegroundColor Cyan
} elseif ($dockerInstalled) {
    Write-Host "✅ Docker is installed. You can use the Docker-only setup:" -ForegroundColor Green
    Write-Host "  setup_docker.bat" -ForegroundColor Cyan
} else {
    Write-Host "❌ Please install the required prerequisites first." -ForegroundColor Red
}

Write-Host ""
Write-Host "For detailed instructions, see SETUP_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to continue" 