@echo off
echo Starting database rebuild process...
cd %~dp0\backend
python rebuild_database.py
pause
