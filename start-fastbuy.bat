@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "& {
    $FRONT = Split-Path -Parent '%~f0'
    $BACK  = Join-Path $FRONT '..\FastBuy-Back'
    $DOMAIN = 'crepe-phonics-slogan.ngrok-free.dev'

    Write-Host 'Freeing ports 5173 and 8080...' -ForegroundColor Cyan
    foreach ($p in 5173, 8080) {
        $lines = netstat -ano | Select-String ('TCP.*:' + $p + '\s+.*LISTENING')
        foreach ($line in $lines) {
            $pid = ($line.Line -split '\s+')[-1]
            if ($pid -match '^\d+$') {
                try { Stop-Process -Id ([int]$pid) -Force -ErrorAction SilentlyContinue } catch {}
            }
        }
    }

    Write-Host 'Starting Spring Boot backend...' -ForegroundColor Cyan
    $backend  = Start-Process 'cmd' -ArgumentList '/k', """cd /d $BACK && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local""" -PassThru

    Write-Host 'Starting Vite frontend...' -ForegroundColor Cyan
    $frontend = Start-Process 'cmd' -ArgumentList '/k', """cd /d $FRONT && npm run dev""" -PassThru

    Write-Host 'Waiting for Vite to bind port 5173...' -ForegroundColor Cyan
    Start-Sleep -Seconds 10

    Write-Host 'Starting ngrok tunnel...' -ForegroundColor Cyan
    $ngrok    = Start-Process 'cmd' -ArgumentList '/k', ""ngrok http --domain=$DOMAIN 5173"" -PassThru

    Start-Sleep -Seconds 3
    Start-Process ""https://$DOMAIN""

    Write-Host ''
    Write-Host '==========================================================' -ForegroundColor Green
    Write-Host '  FastBuy is running' -ForegroundColor Green
    Write-Host '==========================================================' -ForegroundColor Green
    Write-Host \"  URL:  https://$DOMAIN\"
    Write-Host '  API:  /api/*  ->  http://localhost:8080/*'
    Write-Host ''
    Write-Host '  Press ENTER or close this window to stop all services.' -ForegroundColor Yellow
    Write-Host '==========================================================' -ForegroundColor Green
    Write-Host ''

    try {
        Read-Host
    } finally {
        Write-Host 'Stopping services...' -ForegroundColor Cyan
        foreach ($proc in @($backend, $frontend, $ngrok)) {
            if ($proc -ne $null -and -not $proc.HasExited) {
                # Kill the cmd window and all its children
                $children = Get-WmiObject Win32_Process | Where-Object { $_.ParentProcessId -eq $proc.Id }
                foreach ($child in $children) {
                    try { Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
                }
                try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
            }
        }
        # Also free the ports one more time to be safe
        foreach ($p in 5173, 8080) {
            $lines = netstat -ano | Select-String ('TCP.*:' + $p + '\s+.*LISTENING')
            foreach ($line in $lines) {
                $pid2 = ($line.Line -split '\s+')[-1]
                if ($pid2 -match '^\d+$') {
                    try { Stop-Process -Id ([int]$pid2) -Force -ErrorAction SilentlyContinue } catch {}
                }
            }
        }
        Write-Host 'All services stopped.' -ForegroundColor Green
    }
}"
