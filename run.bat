@echo off
title New Bot Runner
color 0a
echo ==========================================
echo    Starting New Bot...
echo ==========================================
cd /d "%~dp0"
node index.js
pause