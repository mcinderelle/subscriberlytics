# Subscriberlytics Development Guide

## Running the Application

This application **must** be run through a local web server. It cannot be opened directly as a file due to browser security restrictions (CORS policy).

### Quick Start

**Option 1: Use the provided batch file (Windows)**
```bash
start-server.bat
```
Then open http://localhost:8000 in your browser.

**Option 2: Use Python's built-in HTTP server**
```bash
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

**Option 3: Use Node.js http-server**
```bash
npx http-server -p 8000
```
Then open http://localhost:8000 in your browser.

### Why a local server is needed:

1. **CORS Policy**: External APIs (like ipapi.co for currency detection) require HTTP/HTTPS
2. **Service Worker**: PWA features require localhost or HTTPS
3. **Manifest.json**: PWA manifest can't be accessed via file:// protocol

### Current Status

✅ The server is already running in the background on port 8000
👉 Open http://localhost:8000 in your browser

### Note

The errors you saw before were expected when opening files directly. With the local server, everything will work correctly.

