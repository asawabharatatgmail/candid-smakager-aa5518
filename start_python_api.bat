@echo off
cd /d "%~dp0eduveda-python"
python -m uvicorn app.main:app --reload --port 8000
