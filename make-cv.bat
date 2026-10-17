@echo off
REM ---------------------------------------------------------------
REM  Double-click to rebuild files\CV_Sumith_Abeykoon.pdf from the
REM  website's data files (career, publications, beamtimes, grants)
REM  plus data\cv.json.  Then commit and push as usual.
REM ---------------------------------------------------------------
title Sumith Abeykoon - build CV
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 ( set PY=python ) else ( set PY=py )

%PY% -c "import reportlab" >nul 2>nul
if not %errorlevel%==0 (
    echo Installing the reportlab package, once...
    %PY% -m pip install reportlab
)
%PY% "tools\make-cv.py"
echo.
pause
