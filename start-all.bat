@echo off
title PresUniverse All-in-One Launcher
echo ==========================================================
echo           PresUniverse Virtual Tour Launcher             
echo ==========================================================
echo.

echo [1/2] Starting local Whisper.cpp Server on Port 9000 (NVIDIA GPU)...
start "Whisper.cpp Server" cmd /c "cd whisper.cpp\build\bin\Release && whisper-server.exe -m ..\..\..\models\ggml-small.bin --port 9000 --device 1 --threads 4 & pause"

echo.
echo Waiting 3 seconds for Whisper to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting Express Secure Backend on http://localhost:3000...
node server.js

pause
