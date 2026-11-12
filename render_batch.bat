@echo off
setlocal
cd /d "%~dp0"

if "%~2"=="" (
  echo Usage: render_batch.bat ^<project_folder_name^> ^<batch_html_file^> [sfxOnly^|mute]
  echo Example: render_batch.bat my_short shots_01_05.html sfxOnly
  exit /b 1
)

set "PROJECT=%~1"
set "BATCH=%~2"
set "MIX=%~3"
if "%MIX%"=="" set "MIX=sfxOnly"

node render_shots.js "%PROJECT%" "%MIX%" --batch "%BATCH%"
endlocal