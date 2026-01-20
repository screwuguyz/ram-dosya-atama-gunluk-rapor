@echo off
cd /d "%~dp0"

echo [RAM] Guncellemeler kontrol ediliyor...
call npm install

echo [RAM] Production build aliniyor...
call npm run build

echo [RAM] API baslatiliyor...
start "RAM API (json-server)" cmd /K npm run api

timeout /t 2 /nobreak >nul

echo [RAM] Uygulama (prod) baslatiliyor...
start "RAM Uygulama" cmd /K npm run start

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo [RAM] Calisiyor.
