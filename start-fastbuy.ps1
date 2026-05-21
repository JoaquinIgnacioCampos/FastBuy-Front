$front  = $PSScriptRoot
$back   = Join-Path (Split-Path $PSScriptRoot) "FastBuy-Back"
$domain = "crepe-phonics-slogan.ngrok-free.dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$back'; .\mvnw spring-boot:run"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$front'; npm run dev"

Write-Host "Waiting for Vite to start..."
Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http --domain=$domain 5173"

Write-Host "Waiting for ngrok tunnel..."
Start-Sleep -Seconds 3

Start-Process "https://$domain"
Write-Host "Opened https://$domain"
