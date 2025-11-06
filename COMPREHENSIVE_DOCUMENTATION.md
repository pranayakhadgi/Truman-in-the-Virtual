# Comprehensive Project Documentation
## Truman Virtual Tour - Complete System Overview

**Author:** Pranaya Khadgi Shahi  
**Date:** November 2025  
**Purpose:** Complete documentation of system architecture, problems encountered, and solutions implemented

---

## 📋 **TABLE OF CONTENTS**

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [File Structure & Routing](#file-structure--routing)
4. [Problems Encountered & Solutions](#problems-encountered--solutions)
5. [Execution Flow](#execution-flow)
6. [Key Mechanisms](#key-mechanisms)
7. [Lessons Learned](#lessons-learned)

---

## 🎯 **PROJECT OVERVIEW**

### **Purpose**
An immersive 3D virtual tour experience for Truman State University, featuring:
- Interactive welcome flow with branching logic
- MongoDB Atlas backend for session management
- Smooth transitions between pages
- 3D skybox rendering with Three.js

### **Tech Stack**
- **Frontend:** HTML, CSS, JavaScript, React, Three.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Deployment:** Vercel (frontend), MongoDB Atlas (database)

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Port 3000)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Static File Serving (Frontend/)                 │   │
│  │  Route Handlers (/tour, /welcome-flow)            │   │
│  │  API Endpoints (/api/*)                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              MONGODB ATLAS (Cloud)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Session Storage                                   │   │
│  │  User Responses                                    │   │
│  │  Analytics Data                                    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Request Flow**

```
User Request
    ↓
Express Server (server.js)
    ↓
├─ Static Files → Frontend/*.html, *.css, *.js
├─ Routes → /tour, /welcome-flow, /transition
└─ API → /api/sessions, /api/health
    ↓
MongoDB Atlas (if API call)
```

---

## 📁 **FILE STRUCTURE & ROUTING**

### **Complete File Structure**

```
virtual/
├── Backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection configuration
│   ├── models/
│   │   └── Session.js           # Mongoose schema for user sessions
│   ├── routes/
│   │   └── sessionRoutes.js     # API endpoints for session management
│   ├── tests/
│   │   └── testDatabase.js      # Database connection and CRUD tests
│   ├── .env                     # Environment variables (MONGODB_URI, PORT, etc.)
│   ├── package.json            # Backend dependencies
│   └── server.js               # Main Express server (routes, middleware, static files)
│
├── Frontend/
│   ├── components/
│   │   ├── context/
│   │   │   └── FormContext.jsx  # React Context for global form state
│   │   ├── shared/
│   │   │   ├── Button.jsx       # Reusable button component
│   │   │   └── LoadingSpinner.jsx # Loading animation component
│   │   └── welcome-flow/
│   │       ├── ContactForm.jsx   # Contact information form
│   │       ├── FacilitySelector.jsx # Facility selection component
│   │       ├── ProgressBar.jsx   # Multi-step progress indicator
│   │       ├── QuestionStep.jsx  # Individual question component
│   │       └── WelcomeFlow.jsx  # Main orchestrator component
│   ├── config/
│   │   ├── facilities.js         # Facility definitions and metadata
│   │   └── questionTree.js      # Branching logic for questions
│   ├── services/
│   │   └── api.js               # API service layer (fetch calls)
│   ├── styles/
│   │   └── welcomeFlow.css      # Styles for welcome flow
│   ├── app.js                   # Main React app (3D skybox scene)
│   ├── index.html               # 3D tour page (served at /tour)
│   ├── transition.html          # Loading/transition page
│   ├── welcome-flow.html        # Interactive form entry point
│   ├── welcome.html             # Initial welcome page with slideshow
│   └── dev-server.py            # Python dev server (optional)
│
├── public/
│   ├── images/                  # Skybox images, campus photos
│   ├── logo/                    # Truman logo files
│   └── icons/                   # UI icons
│
└── Documentation/
    ├── ERROR_DOCUMENTATION.md
    ├── EXECUTION_GUIDE.md
    ├── PORT_CONFLICT_FIX.md
    └── ... (other docs)
```

---

## 🔗 **ROUTING MECHANISM**

### **Backend Routes (server.js)**

#### **1. Static File Serving**
```javascript
// Serve Frontend directory as static files
app.use(express.static(path.join(__dirname, '../Frontend')));

// Serve public assets
app.use('/public', express.static(path.join(__dirname, '../public')));
```

**What This Does:**
- Makes all files in `Frontend/` accessible at root level
- Example: `Frontend/style.css` → `http://localhost:3000/style.css`
- Makes `public/` accessible at `/public/`
- Example: `public/logo/logo.svg` → `http://localhost:3000/public/logo/logo.svg`

#### **2. Route Handlers**
```javascript
// Root route → welcome.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/welcome.html'));
});

// Tour route → index.html (3D scene)
app.get('/tour', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Welcome flow route → welcome-flow.html
app.get('/welcome-flow', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/welcome-flow.html'));
});

// Transition route → transition.html
app.get('/transition', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/transition.html'));
});
```

**Route Mapping:**
- `/` → `Frontend/welcome.html`
- `/tour` → `Frontend/index.html`
- `/welcome-flow` → `Frontend/welcome-flow.html`
- `/transition` → `Frontend/transition.html`

#### **3. API Routes**
```javascript
// Health check
app.get('/api/health', ...);

// Session management
app.use('/api/sessions', sessionRoutes);
```

**API Endpoints:**
- `GET /api/health` → Server status
- `POST /api/sessions` → Create session
- `GET /api/sessions/:id` → Get session
- `PATCH /api/sessions/:id` → Update session
- `DELETE /api/sessions/:id` → Delete session

---

## 🔄 **EXECUTION FLOW**

### **Complete User Journey**

```
1. User visits http://localhost:3000
   ↓
2. Express serves welcome.html (root route)
   ↓
3. User sees slideshow, clicks "Begin Your Journey"
   ↓
4. welcome.html → startTransition() function
   ↓
5. Smooth fade-out overlay appears
   ↓
6. Redirects to /tour (after 1.5s)
   ↓
7. Express serves index.html (tour route)
   ↓
8. Transition overlay shows (fade-in)
   ↓
9. app.js loads → React renders SkyboxScene
   ↓
10. Three.js initializes 3D scene
   ↓
11. Overlay fades out (after 2s)
   ↓
12. User interacts with 3D skybox
```

### **Alternative Flow (With Welcome Flow)**

```
1. User visits http://localhost:3000
   ↓
2. welcome.html loads
   ↓
3. User clicks "Begin Your Journey"
   ↓
4. Redirects to /welcome-flow
   ↓
5. welcome-flow.html loads
   ↓
6. React components render (WelcomeFlow.jsx)
   ↓
7. FormContext initializes session via API
   ↓
8. User completes multi-step form
   ↓
9. WelcomeFlow.jsx → handleComplete()
   ↓
10. Redirects to /transition?sessionId=xxx&facilities=yyy
   ↓
11. transition.html loads, shows loading animation
   ↓
12. Auto-redirects to /tour?sessionId=xxx&facilities=yyy
   ↓
13. index.html loads, app.js reads URL params
   ↓
14. 3D scene initializes with selected facilities
```

---

## 🔧 **KEY MECHANISMS**

### **1. Server Detection Mechanism**

**Problem:** Live Server (port 5500) doesn't have `/tour` route, causing 404 errors.

**Solution:** Detect which server is running and redirect accordingly.

**Implementation (welcome.html):**
```javascript
const currentPort = window.location.port;
if (currentPort === '3000' || currentPort === '') {
    // Backend server - use route
    window.location.href = '/tour';
} else {
    // Live Server - use direct file path
    window.location.href = '/index.html';
}
```

**Why This Works:**
- Backend server (port 3000) has `/tour` route configured
- Live Server (port 5500) only serves static files
- Detection ensures correct redirect path

---

### **2. Port Conflict Handling**

**Problem:** Port 3000 stays occupied if server isn't stopped properly.

**Solution:** `start:clean` script automatically kills old processes.

**Implementation (package.json):**
```json
"start:clean": "lsof -ti :3000 | xargs kill -9 2>/dev/null; node Backend/server.js"
```

**How It Works:**
1. `lsof -ti :3000` → Finds process ID using port 3000
2. `kill -9` → Force kills the process
3. `2>/dev/null` → Suppresses errors if port is free
4. `node Backend/server.js` → Starts new server

**Error Handling (server.js):**
```javascript
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`🔧 Quick Fix: kill $(lsof -ti :${PORT})`);
    process.exit(1);
  }
});
```

---

### **3. Absolute Path Resolution**

**Problem:** Relative paths break when HTML is served from routes.

**Example:**
- File: `Frontend/index.html` has `<link href="style.css">`
- When served from `/tour`, browser looks for `/tour/style.css` ❌
- Actual file is at `/style.css` ✅

**Solution:** Use absolute paths (starting with `/`).

**Before (Broken):**
```html
<link rel="stylesheet" href="style.css">
<script src="app.js"></script>
```

**After (Fixed):**
```html
<link rel="stylesheet" href="/style.css">
<script src="/app.js"></script>
```

**Why This Works:**
- Absolute paths resolve from root (`/`)
- Works regardless of route (`/tour`, `/welcome-flow`, etc.)
- Matches static file serving configuration

---

### **4. Session Management Flow**

**Architecture:**
```
Frontend (FormContext.jsx)
    ↓ creates session
API Service (api.js)
    ↓ POST /api/sessions
Backend (sessionRoutes.js)
    ↓ validates & saves
MongoDB Atlas
    ↓ returns sessionId
Frontend
    ↓ stores in state & URL params
```

**Key Files:**
- `Frontend/components/context/FormContext.jsx` → Creates/updates session
- `Frontend/services/api.js` → Handles API calls
- `Backend/routes/sessionRoutes.js` → Processes requests
- `Backend/models/Session.js` → Defines data structure

**Session Lifecycle:**
1. **Creation:** User starts welcome flow → `createSession('unknown')`
2. **Updates:** User answers questions → `updateSession(sessionId, data)`
3. **Completion:** User finishes form → `completeSession(sessionId)`
4. **Retrieval:** 3D tour loads → `getSession(sessionId)` (from URL params)

---

### **5. Smooth Transition Mechanism**

**Three-Stage Transition:**

**Stage 1: Welcome Page Fade-Out**
```javascript
// welcome.html → startTransition()
1. Create overlay element
2. Fade in overlay (opacity 0 → 1)
3. Show loading spinner
4. Wait 1.5 seconds
5. Redirect to /tour
```

**Stage 2: Tour Page Fade-In**
```html
<!-- index.html -->
<div id="transition-overlay" style="opacity: 1;">
  <!-- Loading content -->
</div>
```

**Stage 3: Overlay Fade-Out**
```javascript
// app.js
setTimeout(() => {
  transitionOverlay.style.opacity = '0';
  setTimeout(() => {
    transitionOverlay.remove();
  }, 1000);
}, 2000);
```

**Result:** Seamless visual transition between pages.

---

## 🐛 **PROBLEMS ENCOUNTERED & SOLUTIONS**

### **Problem 1: MongoDB URI Missing Database Name**

**Error:**
```
MongoServerError: database name must be a string
```

**Root Cause:**
MongoDB URI was missing the database name segment:
```
❌ mongodb+srv://...@cluster.mongodb.net/?appName=...
✅ mongodb+srv://...@cluster.mongodb.net/database-name?appName=...
```

**Solution:**
Updated `.env` file to include database name:
```
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/truman-virtual-tour?...
```

**Files Affected:**
- `Backend/.env`

---

### **Problem 2: Port Already in Use (EADDRINUSE)**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Root Cause:**
Previous server instance still running (orphaned process).

**Solution:**
1. **Immediate Fix:**
   ```bash
   kill $(lsof -ti :3000)
   npm start
   ```

2. **Preventive Fix:**
   - Added `start:clean` script
   - Added error handling in `server.js`

**Files Affected:**
- `package.json` → Added `start:clean` script
- `Backend/server.js` → Added error handler

---

### **Problem 3: 404 Errors on Static Resources**

**Error:**
```
Failed to load resource: the server responded with a status of 404
tour:1  style.css
tour:1  app.js
```

**Root Cause:**
Relative paths in HTML break when served from routes.

**Solution:**
Changed all relative paths to absolute paths:
```html
<!-- Before -->
<link href="style.css">
<script src="app.js">

<!-- After -->
<link href="/style.css">
<script src="/app.js">
```

**Files Affected:**
- `Frontend/index.html`
- `Frontend/welcome.html`
- `Frontend/welcome-flow.html`
- `Frontend/transition.html`
- `Frontend/app.js`

---

### **Problem 4: Live Server Route Conflict**

**Error:**
```
GET http://127.0.0.1:5500/tour 404 (Not Found)
```

**Root Cause:**
Live Server (port 5500) doesn't have `/tour` route - only serves static files.

**Solution:**
Added server detection in `welcome.html`:
```javascript
const currentPort = window.location.port;
if (currentPort === '3000') {
    window.location.href = '/tour';  // Backend route
} else {
    window.location.href = '/index.html';  // Direct file
}
```

**Files Affected:**
- `Frontend/welcome.html`

---

### **Problem 5: Session Creation Validation Error**

**Error:**
```
ValidationError: userType: Path `userType` is required
```

**Root Cause:**
Mongoose schema requires `userType`, but initial session creation didn't send it.

**Solution:**
1. Updated `sessionRoutes.js` to accept `userType` from request body
2. Updated `Session.js` model to have default value `'unknown'`
3. Updated `FormContext.jsx` to send `userType: 'unknown'` initially

**Files Affected:**
- `Backend/routes/sessionRoutes.js`
- `Backend/models/Session.js`
- `Frontend/components/context/FormContext.jsx`

---

### **Problem 6: Favicon 404 Error**

**Error:**
```
transition:1  Failed to load resource: 404 (Not Found)
```

**Root Cause:**
Browser automatically requests `/favicon.ico`, which doesn't exist.

**Solution:**
1. Added favicon handler in `server.js`:
   ```javascript
   app.get('/favicon.ico', (req, res) => {
     res.status(204).end(); // No Content
   });
   ```

2. Added empty favicon link in HTML:
   ```html
   <link rel="icon" href="data:,">
   ```

**Files Affected:**
- `Backend/server.js`
- `Frontend/transition.html`

---

## 📊 **FILE INTERCONNECTIONS**

### **Frontend → Backend Communication**

```
Frontend Components
    ↓
FormContext.jsx (state management)
    ↓
api.js (API service layer)
    ↓
fetch() → http://localhost:3000/api/sessions
    ↓
Backend server.js (Express)
    ↓
sessionRoutes.js (route handlers)
    ↓
Session.js (Mongoose model)
    ↓
MongoDB Atlas
```

### **Page Routing Flow**

```
welcome.html
    ↓ (button click)
startTransition() → redirects to /tour
    ↓
Backend server.js → route handler
    ↓
index.html (served at /tour)
    ↓
app.js (loads via <script>)
    ↓
React renders SkyboxScene
    ↓
Three.js initializes 3D scene
```

### **Static Resource Loading**

```
Browser requests: /style.css
    ↓
Express static middleware
    ↓
Serves: Frontend/style.css
    ↓
Browser receives CSS file
```

---

## 🎓 **LESSONS LEARNED**

### **1. Always Use Absolute Paths for Static Resources**
- Relative paths break when served from routes
- Absolute paths (`/file.css`) work everywhere
- Prevents 404 errors

### **2. Handle Port Conflicts Proactively**
- Processes can become orphaned
- Always provide cleanup mechanism
- Better UX with automatic handling

### **3. Server Type Matters**
- Backend servers can have routes
- Static servers (Live Server) only serve files
- Detect server type for correct behavior

### **4. Environment Variables Need Explicit Loading**
- `.env` files don't auto-load
- Explicitly load with `dotenv.config({ path: ... })`
- Verify loading in different execution contexts

### **5. Error Handling Should Be User-Friendly**
- Show clear error messages
- Provide fix instructions
- Log helpful debugging info

### **6. Documentation Prevents Repeat Issues**
- Document problems as they occur
- Create prevention guides
- Maintain troubleshooting checklists

---

## 🔍 **KEY INSIGHTS FROM PRANAYA'S FEEDBACK**

### **Issue 1: "Backend should run with just npm start"**
**Problem:** Port conflicts prevented clean startup  
**Solution:** Added `start:clean` script and error handling

### **Issue 2: "Transition between welcome and skybox not working"**
**Problem:** 404 errors on resources, route conflicts  
**Solution:** Fixed paths, added server detection, improved error handling

### **Issue 3: "Port execution not working properly"**
**Problem:** Port stays occupied, unclear error messages  
**Solution:** Added automatic cleanup, better error messages

### **Issue 4: "Live Server vs Backend confusion"**
**Problem:** Using Live Server but routes don't work  
**Solution:** Added server detection, documented differences

### **Issue 5: "Need comprehensive documentation"**
**Problem:** Hard to understand system architecture  
**Solution:** Created this comprehensive documentation

---

## 📝 **MAINTENANCE CHECKLIST**

### **Before Deployment:**
- [ ] All paths are absolute (no relative paths)
- [ ] `.env` file is configured correctly
- [ ] MongoDB connection tested
- [ ] All routes tested in browser
- [ ] No console errors
- [ ] No 404 errors in Network tab

### **When Adding New Routes:**
- [ ] Add route handler in `server.js`
- [ ] Test route in browser
- [ ] Verify static resources load
- [ ] Check for path issues

### **When Adding New Files:**
- [ ] Use absolute paths in HTML
- [ ] Verify file is in correct directory
- [ ] Test file loads correctly
- [ ] Check console for errors

---

## 🚀 **QUICK REFERENCE**

### **Start Server:**
```bash
npm run start:clean  # Recommended (handles port conflicts)
npm start            # Regular start
```

### **Test Database:**
```bash
cd Backend
npm run test:db
```

### **Check Port Status:**
```bash
lsof -i :3000
```

### **Kill Port:**
```bash
kill $(lsof -ti :3000)
```

### **Push to Experimental Repo:**
```bash
git push experimental main
```

---

## 📚 **RELATED DOCUMENTATION**

- `ERROR_DOCUMENTATION.md` - Detailed error analysis
- `EXECUTION_GUIDE.md` - Step-by-step execution guide
- `PORT_CONFLICT_FIX.md` - Port conflict solutions
- `PATH_PREVENTION_GUIDE.md` - Path best practices
- `LIVE_SERVER_VS_BACKEND.md` - Server comparison

---

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Maintained By:** Pranaya Khadgi Shahi

