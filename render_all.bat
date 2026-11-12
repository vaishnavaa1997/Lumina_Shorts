@echo off
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  echo Usage: render_all.bat ^<project_folder_name^> [sfxOnly^|mute]
  echo Example: render_all.bat my_short sfxOnly
  exit /b 1
)

set "PROJECT=%~1"
set "MIX=%~2"
if "%MIX%"=="" set "MIX=sfxOnly"

if exist "projects\%PROJECT%\bgm_master.html" (
  echo [1/2] Rendering Continuous Situational Master BGM ^(bgm_master.wav^)...
  node render_bgm.js "%PROJECT%" bgmOnly
)

echo [2/2] Rendering All 9:16 Vertical Shots ^(1080x1920 @ 60fps^) + Merging Master Short...
node render_shots.js "%PROJECT%" "%MIX%"

echo.
echo [COMPLETE] Output files ready in: projects\%PROJECT%\build\
endlocal