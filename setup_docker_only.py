#!/usr/bin/env python3
"""
Docker-only setup script for LEGO Price Agent
This script can be run using Docker without requiring Python to be installed locally.
"""

import subprocess
import time
import os

def run_docker_command(command, description):
    """Run a Docker command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_docker():
    """Check if Docker is running"""
    print("🔍 Checking Docker...")
    try:
        result = subprocess.run("docker --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Docker is available")
            return True
        else:
            print("❌ Docker is not available")
            return False
    except:
        print("❌ Docker is not available")
        return False

def setup_database():
    """Set up the database using Docker"""
    print("\n🗄️ Setting up database...")
    
    # Start database services
    if not run_docker_command("docker-compose up -d db redis", "Starting database services"):
        return False
    
    # Wait for database to be ready
    print("⏳ Waiting for database to be ready...")
    time.sleep(10)
    
    return True

def install_dependencies():
    """Install dependencies using Docker"""
    print("\n📦 Installing dependencies...")
    
    # Install Python dependencies in backend container
    if not run_docker_command("docker-compose run --rm backend pip install -r requirements.txt", "Installing Python dependencies"):
        return False
    
    # Install Node.js dependencies in frontend container
    if not run_docker_command("docker-compose run --rm frontend npm install", "Installing Node.js dependencies"):
        return False
    
    return True

def run_migrations():
    """Run database migrations using Docker"""
    print("\n🔄 Running database migrations...")
    
    # Initialize Alembic
    if not run_docker_command("docker-compose run --rm backend alembic init alembic", "Initializing Alembic"):
        return False
    
    # Create initial migration
    if not run_docker_command("docker-compose run --rm backend alembic revision --autogenerate -m 'Initial migration'", "Creating initial migration"):
        return False
    
    # Run migrations
    if not run_docker_command("docker-compose run --rm backend alembic upgrade head", "Running migrations"):
        return False
    
    return True

def start_services():
    """Start the application services"""
    print("\n🚀 Starting application services...")
    
    # Start all services
    if not run_docker_command("docker-compose up -d", "Starting all services"):
        return False
    
    print("\n✅ Setup completed successfully!")
    print("\n🌐 Application URLs:")
    print("   Frontend: http://localhost:3000")
    print("   Backend API: http://localhost:8000")
    print("   API Documentation: http://localhost:8000/docs")
    print("   Database: localhost:5432")
    
    return True

def main():
    """Main setup function"""
    print("🏗️ LEGO Price Agent - Docker Setup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_docker():
        print("\n❌ Please install Docker and Docker Compose first")
        print("Download from: https://www.docker.com/products/docker-desktop/")
        return
    
    # Setup steps
    steps = [
        ("Setting up database", setup_database),
        ("Installing dependencies", install_dependencies),
        ("Running migrations", run_migrations),
        ("Starting services", start_services),
    ]
    
    for step_name, step_func in steps:
        print(f"\n{'='*20} {step_name} {'='*20}")
        if not step_func():
            print(f"\n❌ Setup failed at: {step_name}")
            return
    
    print("\n🎉 Setup completed successfully!")
    print("\n📝 Next steps:")
    print("   1. Open http://localhost:3000 in your browser")
    print("   2. Register a new account")
    print("   3. Start using the LEGO Price Agent!")
    print("\n🛠️ Development commands:")
    print("   - View logs: docker-compose logs -f")
    print("   - Stop services: docker-compose down")
    print("   - Restart services: docker-compose restart")

if __name__ == "__main__":
    main() 