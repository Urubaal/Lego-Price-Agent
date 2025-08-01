# LEGO Price Agent - Setup Guide

This guide will help you set up the LEGO Price Agent project on your Windows system.

## Prerequisites Installation

### 1. Install Python (Required for Option A)

1. Go to [Python Downloads](https://www.python.org/downloads/)
2. Download Python 3.11 or later
3. **IMPORTANT**: During installation, check "Add Python to PATH"
4. Verify installation by opening a new terminal and running:
   ```bash
   python --version
   ```

### 2. Install Docker Desktop (Required for all options)

1. Go to [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Download Docker Desktop for Windows
3. Install and start Docker Desktop
4. Verify installation by opening a new terminal and running:
   ```bash
   docker --version
   ```

## Setup Options

### Option A: Automated Setup (Recommended if you have Python)

If you have Python installed, you can use the automated setup script:

```bash
python setup_dev.py
```

This script will:
- Start database services
- Install all dependencies
- Run database migrations
- Start all application services

### Option B: Docker-Only Setup (No Python required)

If you don't have Python installed, use the Docker-only setup:

```bash
setup_docker.bat
```

This batch script will:
- Use Docker to install dependencies
- Set up the database
- Run migrations
- Start all services

### Option C: Manual Setup

If you prefer to set up manually:

```bash
docker-compose up -d
```

## Verification

After setup, you should be able to access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Troubleshooting

### Python not found
- Make sure Python is installed and added to PATH
- Try using Option B (Docker-only setup) instead

### Docker not found
- Install Docker Desktop from the official website
- Make sure Docker Desktop is running

### Port conflicts
- Make sure ports 3000, 8000, 5432, and 6379 are available
- Stop any existing services using these ports

### Database connection issues
- Wait a few minutes for the database to fully start
- Check Docker logs: `docker-compose logs db`

## Development Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild containers
docker-compose up --build
```

## Getting Started

1. Open http://localhost:3000 in your browser
2. Register a new account
3. Start using the LEGO Price Agent!

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. View the logs: `docker-compose logs -f`
3. Make sure all prerequisites are installed correctly 