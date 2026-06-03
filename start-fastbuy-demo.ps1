$front  = $PSScriptRoot
$back   = Join-Path (Split-Path $PSScriptRoot) "FastBuy-Back"
$domain = "crepe-phonics-slogan.ngrok-free.dev"

# -- Free port 5173 so Vite always starts there in demo mode ------------------
function Stop-Port([int]$port) {
    $lines = netstat -ano | Where-Object { $_ -match "TCP.*:$port\s+.*LISTENING" }
    foreach ($line in $lines) {
        $p = ($line -split '\s+')[-1]
        if ($p -match '^\d+$') {
            Write-Host "  Freeing port $port (PID $p)" -ForegroundColor Yellow
            try { Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
}
Write-Host "Checking for stale processes..."
Stop-Port 5173
Start-Sleep -Seconds 1

# -- Start services -----------------------------------------------------------
Write-Host "Starting Vite in DEMO mode..." -ForegroundColor Cyan
$viteProc = Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "Set-Location '$front'; npm run dev" `
    -PassThru

Write-Host "Waiting 10 s for Vite to bind port 5173..."
Start-Sleep -Seconds 10

Write-Host "Starting ngrok tunnel ($domain)..." -ForegroundColor Cyan
$ngrokProc = Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "ngrok http --domain=$domain 5173" `
    -PassThru

Write-Host "Waiting 3 s for ngrok..."
Start-Sleep -Seconds 3

Start-Process "https://$domain"

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Magenta
Write-Host "  DEMO MODE  --  $domain" -ForegroundColor Magenta
Write-Host "  All data is local to each browser tab." -ForegroundColor DarkMagenta
Write-Host "=====================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Press Ctrl+C HERE to stop all services." -ForegroundColor Cyan
Write-Host ""

# -- Hold: Ctrl+C triggers finally which kills everything ---------------------
function Kill-Tree($proc) {
    if ($proc -ne $null -and -not $proc.HasExited) {
        try { taskkill /pid $proc.Id /t /f | Out-Null } catch {}
    }
}

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Write-Host ""
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    Kill-Tree $ngrokProc
    Kill-Tree $viteProc
    Write-Host "All services stopped." -ForegroundColor Green
    Start-Sleep -Seconds 2
}
