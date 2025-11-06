# Live Server Extension Setup Guide

## What is Live Server?

Live Server is a VS Code extension that creates a local development server with live reload capability. It automatically refreshes your browser when you save files.

## Installation

### For VS Code:
1. Open VS Code
2. Go to Extensions (Cmd+Shift+X on Mac, Ctrl+Shift+X on Windows)
3. Search for "Live Server" by Ritwick Dey
4. Click "Install"
5. Restart VS Code if prompted

### For Other Editors:
- **Sublime Text**: Use "LiveReload" package
- **Atom**: Use "atom-live-server" package
- **WebStorm**: Built-in Live Edit feature

## Configuration for This Project

### Option 1: Use Live Server for Frontend Only

**Setup:**
1. Open VS Code in the project root
2. Right-click on `Frontend/index.html` or `Frontend/welcome.html`
3. Select "Open with Live Server"
4. This will start a server (usually on port 5500)

**Note:** Live Server only serves static files. You'll still need:
- Backend server running on port 3000 for API calls
- Update API URLs to point to `http://localhost:3000/api`

### Option 2: Use Current Setup (Recommended)

Your current setup is better because:
- ✅ Backend and frontend integrated
- ✅ API calls work seamlessly
- ✅ CORS configured correctly
- ✅ All routes work together

**Current commands:**
```bash
npm start     # Backend on port 3000 (serves frontend too)
npm run dev   # Frontend dev server on port 8000
```

## Live Server Settings (if you use it)

Create `.vscode/settings.json`:
```json
{
  "liveServer.settings.port": 5500,
  "liveServer.settings.root": "/Frontend",
  "liveServer.settings.CustomBrowser": "chrome",
  "liveServer.settings.donotShowInfoMsg": true
}
```

## Recommendation

**Stick with your current setup** because:
1. Backend integration is already working
2. API endpoints are configured
3. MongoDB connection is set up
4. All routes are properly configured

Live Server is great for pure frontend projects, but your project benefits from the integrated backend server.

## If You Still Want Live Server

You can use it for quick frontend testing, but remember:
- Update API calls to use `http://localhost:3000/api`
- Backend must be running separately
- Some features may not work without backend

