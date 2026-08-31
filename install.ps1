# disclaimer
$c = (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/JustCallMeBrad/DetectiveOkappikiRotectorMococo/refs/heads/main/README.md" -UseBasicParsing).Content -split "`r?`n"; $s = ($c | Select-String -SimpleMatch "~~~~~~ Disclaimer! ~~~~~~").LineNumber; $e = ($c | Select-String -SimpleMatch "~~~~~~ Intro ~~~~~~").LineNumber; $c[$s..($e - 2)]
Write-Output "DORM is licensed under GPL-3.0"
Write-Output "Vencord is a modified Discord client, which is against Discord's ToS (https://discord.com/terms). Use at your own risk"
Write-Output "By pressing Enter you acknowledge and agree to all of the text above. If you do not, please exit the script"
pause

function wd {
    param([string]$Message)
    Write-Output "[DORM] $Message"
}

Push-Location

# install deps
wd "Installing deps:"
wd "Installing winget"
Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe
wd "Installing git"
winget install -e --id Git.Git --no-upgrade --source winget
wd "Installing pnpm"
winget install -e --id pnpm.pnpm --no-upgrade
wd "Installing nodejs"
winget install -e --id OpenJS.NodeJS --no-upgrade

# create vencord directory
wd "Creating Vencord directory"
Set-Location $env:TEMP
if (Test-Path "Vencord") {
    wd "Existing Vencord directory found, removing it..."
    Get-Process node -ErrorAction SilentlyContinue | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force "Vencord"
}

git clone https://github.com/Vendicated/Vencord
Set-Location Vencord

wd "Preparing installation"
Get-Process -Name "Discord" -ErrorAction SilentlyContinue | Stop-Process -Force
pnpm install --frozen-lockfile
Set-Location src
mkdir userplugins
Set-Location userplugins

# install dorm
wd "Installing DORM"
git clone --no-checkout --depth 1 --filter=blob:none https://github.com/JustCallMeBrad/DetectiveOkappikiRotectorMococo.git tmp_repo
Set-Location tmp_repo
git sparse-checkout init --cone
git sparse-checkout set detectiveOkappikiRotectorMococo
git checkout main
Move-Item -Path .\detectiveOkappikiRotectorMococo -Destination ..\
Set-Location ..
Remove-Item -Recurse -Force tmp_repo

# build and inject
wd "Building Vencord"
Set-Location ..\..
pnpm build
wd "You may be required to interact with the installer"
pnpm inject

# clean up
wd "Cleaning up ..."
if ($env:TEMP) {
    Start-Sleep -Seconds 2
    Set-Location $env:TEMP # prevent resource is in use error
    Remove-Item -Recurse -Force "$env:TEMP\Vencord"
}
else {
    Write-Error "TEMP environment variable not set, aborting cleanup" # lets just be safe so we dont delete something accidentally
}

Pop-Location
wd "Done installing DORM, restart Discord if it is open. You may exit the window"
pause
