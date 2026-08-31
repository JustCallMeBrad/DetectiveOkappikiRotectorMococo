# disclaimer
$c = (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/JustCallMeBrad/DetectiveOkappikiRotectorMococo/refs/heads/main/README.md" -UseBasicParsing).Content -split "`r?`n"; $s = ($c | Select-String -SimpleMatch "~~~~~~ Disclaimer! ~~~~~~").LineNumber; $e = ($c | Select-String -SimpleMatch "~~~~~~ Intro ~~~~~~").LineNumber; $c[$s..($e - 2)]
write "DORM is licensed under GPL-3.0"
write "Vencord is a modified Discord client, which is against Discord's ToS (https://discord.com/terms). Use at your own risk"
write "By pressing Enter you acknowledge and agree to all of the text above. If you do not, please exit the script"
pause

function wd {
    param([string]$Message)
    write "[DORM] $Message"
}

pushd

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
cd $env:TEMP
if (Test-Path "Vencord") {
    wd "Existing Vencord directory found, removing it..."
    Get-Process node -ErrorAction SilentlyContinue | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
    rmdir -Recurse -Force "Vencord"
}

git clone https://github.com/Vendicated/Vencord
cd Vencord

wd "Preparing installation"
Get-Process -Name "Discord" -ErrorAction SilentlyContinue | Stop-Process -Force
pnpm install --frozen-lockfile
cd src
mkdir userplugins
cd userplugins

# install dorm
wd "Installing DORM"
git clone --no-checkout --depth 1 --filter=blob:none https://github.com/JustCallMeBrad/DetectiveOkappikiRotectorMococo.git tmp_repo
cd tmp_repo
git sparse-checkout init --cone
git sparse-checkout set detectiveOkappikiRotectorMococo
git checkout main
mv -Path .\detectiveOkappikiRotectorMococo -Destination ..\
cd ..
Remove-Item -Recurse -Force tmp_repo

# build and inject
wd "Building Vencord"
cd ..\..
pnpm build
wd "You may be required to interact with the installer"
pnpm inject

# clean up
wd "Cleaning up ..."
if ($env:TEMP) {
    Start-Sleep -Seconds 2
    cd $env:TEMP # prevent resource is in use error
    rmdir -Recurse -Force "$env:TEMP\Vencord"
}
else {
    Write-Error "TEMP environment variable not set, aborting cleanup" # lets just be safe so we dont delete something accidentally
}

popd
wd "Done installing DORM, restart Discord if it is open. You may exit the window"
pause
