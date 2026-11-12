@echo off
setlocal
cd /d "%~dp0"

if "%~2"=="" (
  echo Usage: render_one.bat ^<project_folder_name^> ^<shot_number^> [sfxOnly^|mute]
  echo Example: render_one.bat my_short 4 sfxOnly
  exit /b 1
)

set "PROJECT=%~1"
set "SHOT=%~2"
set "MIX=%~3"
if "%MIX%"=="" set "MIX=sfxOnly"

node render_shots.js "%PROJECT%" "%MIX%" --shot "%SHOT%"
endlocal