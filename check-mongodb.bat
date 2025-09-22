@echo off
echo Checking MongoDB Connection...
cd %~dp0
node backend/mongo-connection-check.js
pause 