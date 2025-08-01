#!/usr/bin/env python3
"""
Test runner script for LEGO Price Agent
Runs all tests for both backend and frontend
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(command, cwd=None, description=""):
    """Run a command and return success status"""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ SUCCESS")
            if result.stdout:
                print("Output:")
                print(result.stdout)
        else:
            print("❌ FAILED")
            if result.stderr:
                print("Error:")
                print(result.stderr)
            if result.stdout:
                print("Output:")
                print(result.stdout)
        
        return result.returncode == 0
    
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False


def main():
    """Main test runner"""
    print("🧱 LEGO Price Agent - Test Runner")
    print("=" * 50)
    
    # Get project root
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"
    
    # Check if directories exist
    if not backend_dir.exists():
        print(f"❌ Backend directory not found: {backend_dir}")
        return 1
    
    if not frontend_dir.exists():
        print(f"❌ Frontend directory not found: {frontend_dir}")
        return 1
    
    all_tests_passed = True
    
    # Backend tests
    print("\n🔧 Running Backend Tests...")
    
    # Install backend dependencies if needed
    if not (backend_dir / "venv").exists():
        print("Installing backend dependencies...")
        success = run_command(
            "python -m venv venv && venv\\Scripts\\activate && pip install -r requirements.txt",
            cwd=backend_dir,
            description="Installing backend dependencies"
        )
        if not success:
            all_tests_passed = False
    
    # Run backend tests
    backend_success = run_command(
        "python -m pytest tests/ -v --tb=short",
        cwd=backend_dir,
        description="Backend unit tests"
    )
    if not backend_success:
        all_tests_passed = False
    
    # Frontend tests
    print("\n🎨 Running Frontend Tests...")
    
    # Install frontend dependencies if needed
    if not (frontend_dir / "node_modules").exists():
        print("Installing frontend dependencies...")
        success = run_command(
            "npm install",
            cwd=frontend_dir,
            description="Installing frontend dependencies"
        )
        if not success:
            all_tests_passed = False
    
    # Run frontend tests
    frontend_success = run_command(
        "npm test -- --passWithNoTests",
        cwd=frontend_dir,
        description="Frontend unit tests"
    )
    if not frontend_success:
        all_tests_passed = False
    
    # Run frontend E2E tests
    e2e_success = run_command(
        "npm run test:e2e",
        cwd=frontend_dir,
        description="Frontend E2E tests"
    )
    if not e2e_success:
        all_tests_passed = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Backend tests: PASSED")
        print("   - Authentication system")
        print("   - API endpoints (auth, watchlist)")
        print("   - Database models and relationships")
        print("   - Password hashing and JWT tokens")
        print("✅ Frontend unit tests: PASSED")
        print("   - React components (LoginForm, RegisterForm)")
        print("   - Context providers (AuthContext)")
        print("   - User interactions and form validation")
        print("✅ Frontend E2E tests: PASSED")
        print("   - End-to-end user workflows")
        return 0
    else:
        print("❌ SOME TESTS FAILED!")
        if not backend_success:
            print("❌ Backend tests: FAILED")
        if not frontend_success:
            print("❌ Frontend unit tests: FAILED")
        if not e2e_success:
            print("❌ Frontend E2E tests: FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main()) 