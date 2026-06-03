@echo off
setlocal
set FRONT=%~dp0
set BACK=%FRONT%..\FastBuy-Back
set DOMAIN=crepe-phonics-slogan.ngrok-free.dev

echo Freeing ports 5173 and 8080...
powershell -NoProfile -Command ^
  "foreach ($p in 5173,8080) { $lines = netstat -ano | Select-String ('TCP.*:' + $p + '\s+.*LISTENING'); foreach ($line in $lines) { $pid = ($line.Line -split '\s+')[-1]; if ($pid -match '^\d+$') { try { Stop-Process -Id ([int]$pid) -Force -ErrorAction SilentlyContinue } catch {} } } }"

echo Starting Spring Boot backend...
start "FastBuy Backend" cmd /k "cd /d %BACK% && mvnw.cmd spring-boot:run"

echo Starting Vite frontend...
start "FastBuy Frontend" cmd /k "cd /d %FRONT% && npm run dev"

echo Waiting for Vite to bind port 5173...
timeout /t 10 /nobreak >nul

echo Starting ngrok tunnel...
start "FastBuy Ngrok" cmd /k "ngrok http --domain=%DOMAIN% 5173"

timeout /t 3 /nobreak >nul

start https://%DOMAIN%

echo.
echo ==========================================================
echo   FastBuy is running
echo ==========================================================
echo   URL:  https://%DOMAIN%
echo   API:  /api/*  -^>  http://localhost:8080/*
echo.
echo   Three windows: Backend, Frontend, Ngrok.
echo   Close them to stop all services.
echo ==========================================================
echo.
pause
endlocal
