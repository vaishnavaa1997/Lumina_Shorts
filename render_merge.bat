@echo off
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  echo Usage: render_merge.bat ^<project_folder_name^>
  echo Example: render_merge.bat my_short
  exit /b 1
)

set "PROJECT=%~1"

node render_shots.js "%PROJECT%" sfxOnly --merge-only
endlocal