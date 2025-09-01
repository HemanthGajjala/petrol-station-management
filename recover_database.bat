@echo off
echo Starting database recovery tool...
cd %~dp0\backend
python database_recovery.py
pause
