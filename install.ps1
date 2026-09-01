# disclaimer
$c = (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/JustCallMeBrad/DetectiveOkappikiRotectorMococo/refs/heads/main/README.md" -UseBasicParsing).Content -split "`r?`n"; $s = ($c | Select-String -SimpleMatch "~~~~~~ Disclaimer! ~~~~~~").LineNumber; $e = ($c | Select-String -SimpleMatch "~~~~~~ Intro ~~~~~~").LineNumber; $c[$s..($e - 2)]
Write-Output "DORM is licensed under GPL-3.0"
Write-Output "Vencord is a modified Discord client, which is against Discord's ToS (https://discord.com/terms). Use at your own risk"
Write-Output "By pressing Enter you acknowledge and agree to all of the text above. If you do not, please exit the script"
pause

$documents = ([Environment]::GetFolderPath('MyDocuments'))
$dormPath = Join-Path $documents ".dorm"

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

# create dorm directory
wd "Creating DORM directory"
if (Test-Path $dormPath) {
    wd "Existing DORM directory found"
    $confirm = Read-Host "The script will delete the current DORM installation directory (Documents\.dorm) and everything inside it to continue with the installation process. Continue? (y/n)"
    if ($confirm -ne 'y') {
        wd "Aborted"
        Pop-Location
        exit
    }
    wd "Reinstalling DORM"
    Get-Process node -ErrorAction SilentlyContinue | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force $dormPath
}
Set-Location $documents
New-Item -Path . -Name ".dorm" -ItemType "Directory"
Set-Location .dorm
New-Item -Path . -Name "README.txt" -ItemType "File" -Value "DORM quick-install directory, do not delete unless you know what you're doing\nPlease do not put any other installation paths or files here, they may be deleted"

wd "Creating Vencord directory"
git clone https://github.com/Vendicated/Vencord
Set-Location Vencord

wd "Preparing installation"
Get-Process -Name "Discord" -ErrorAction SilentlyContinue | Stop-Process -Force
pnpm install --frozen-lockfile
Set-Location src
New-Item -Path . -Name "userplugins" -ItemType "Directory"
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

Pop-Location
wd "Done installing DORM, restart Discord if it is open. You may exit the window"
pause
