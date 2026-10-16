@echo off
REM ---------------------------------------------------------------
REM  Double-click this file to see your website properly.
REM
REM  Double-clicking index.html instead will show the pages but the
REM  gallery and publication lists will be empty - browsers block a
REM  page opened as a file from reading other files on your disk.
REM  This opens it as a real (local) website, so everything appears.
REM
REM  A black window will open. Leave it open while you look at the
REM  site. Close it, or press Ctrl+C in it, when you are done.
REM ---------------------------------------------------------------

title Sumith Abeykoon - website preview
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
    python "tools\preview.py"
    goto :done
)

where py >nul 2>nul
if %errorlevel%==0 (
    py "tools\preview.py"
    goto :done
)

echo.
echo   Python was not found on this computer.
echo.
echo   Install it from https://www.python.org/downloads/
echo   and tick "Add Python to PATH" during setup.
echo   Then double-click this file again.
echo.
pause

:done
