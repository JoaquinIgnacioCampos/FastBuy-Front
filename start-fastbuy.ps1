$FRONT  = $PSScriptRoot
$BACK   = Resolve-Path (Join-Path $FRONT '..\FastBuy-Back')
$DOMAIN = 'crepe-phonics-slogan.ngrok-free.dev'

function Free-Port($port) {
    netstat -ano | Select-String "TCP.*:$port\s+.*LISTENING" | ForEach-Object {
        $p = ($_.Line -split '\s+')[-1]
        if ($p -match '^\d+$') {
            try { Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
}

Write-Host 'Freeing ports 5173 and 8080...' -ForegroundColor Cyan
Free-Port 5173
Free-Port 8080

Write-Host 'Starting Spring Boot backend...' -ForegroundColor Cyan
$backend = Start-Process cmd -ArgumentList '/k', "cd /d `"$BACK`" && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local" -PassThru

Write-Host 'Starting Vite frontend...' -ForegroundColor Cyan
$frontend = Start-Process cmd -ArgumentList '/k', "cd /d `"$FRONT`" && npm run dev" -PassThru

Write-Host 'Waiting for Vite to bind port 5173...' -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host 'Starting ngrok tunnel...' -ForegroundColor Cyan
$ngrok = Start-Process cmd -ArgumentList '/k', "ngrok http --domain=$DOMAIN 5173" -PassThru

Start-Sleep -Seconds 3
Start-Process "https://$DOMAIN"

Write-Host ''
Write-Host '==========================================================' -ForegroundColor Green
Write-Host '  FastBuy is running' -ForegroundColor Green
Write-Host '==========================================================' -ForegroundColor Green
Write-Host "  URL:  https://$DOMAIN"
Write-Host '  API:  /api/*  ->  http://localhost:8080/*'
Write-Host ''
Write-Host '  Press ENTER to stop all services.' -ForegroundColor Yellow
Write-Host '==========================================================' -ForegroundColor Green
Write-Host ''

try {
    $null = Read-Host
} finally {
    Write-Host 'Stopping services...' -ForegroundColor Cyan
    foreach ($proc in @($backend, $frontend, $ngrok)) {
        if ($null -ne $proc -and -not $proc.HasExited) {
            # /T kills the entire process tree (cmd + its children: mvnw/node/ngrok)
            taskkill /F /T /PID $proc.Id 2>$null
        }
    }
    Free-Port 5173
    Free-Port 8080
    Write-Host 'All services stopped.' -ForegroundColor Green
}
