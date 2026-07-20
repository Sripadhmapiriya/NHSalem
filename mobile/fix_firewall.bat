@echo off
:: Check for Admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator rights confirmed.
) else (
    echo Requesting Administrator rights...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit /b
)

echo Opening port 4000 in Windows Firewall...
powershell -Command "New-NetFirewallRule -DisplayName 'NodeJS Backend' -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow"
echo Done! Please restart your Expo server now.
pause
