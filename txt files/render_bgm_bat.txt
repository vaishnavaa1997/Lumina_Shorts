@echo off
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  echo Usage: render_bgm.bat ^<project_folder_name^> [bgmOnly^|bgmFull]
  echo Example: render_bgm.bat my_short bgmOnly
  exit /b 1
)

set "PROJECT=%~1"
set "MODE=%~2"
if "%MODE%"=="" set "MODE=bgmOnly"

node render_bgm.js "%PROJECT%" "%MODE%"
endlocal