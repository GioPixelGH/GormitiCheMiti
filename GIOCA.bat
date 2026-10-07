@echo off
rem ====================================================
rem   GORMITI - Le Pietre di Gorm
rem   Avvia il gioco in una finestra dedicata di Edge
rem ====================================================
set "GAME=%~dp0index.html"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --app="file:///%GAME%" --start-maximized
) else (
  start "" "%GAME%"
)
