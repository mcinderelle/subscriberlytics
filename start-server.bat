@echo off
echo Starting Subscriberlytics local server...
echo.
echo The app will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.
python -m http.server 8000
pause

