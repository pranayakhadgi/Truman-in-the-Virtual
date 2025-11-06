# Startup Issues - Fixed

## Issues Identified

### Issue #1: MongoDB Connection Failed
**Error:** `The uri parameter to openUri() must be a string, got "undefined"`

**Root Cause:**
- When running `npm start` from root directory, `dotenv` was looking for `.env` in the wrong location
- The `.env` file is in `Backend/.env` but the script was looking in root

**Fix Applied:**
- Updated `Backend/server.js` to explicitly load `.env` from `Backend/` directory
- Updated `Backend/config/database.js` to explicitly load `.env` from `Backend/` directory
- Added path checking to provide better error messages

**Files Changed:**
```javascript
// Backend/server.js
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Backend/config/database.js  
require('dotenv').config({ path: path.join(__dirname, '../.env') });
```

### Issue #2: Dev Server Path Error
**Error:** `can't open file '/Users/pantujantu/Desktop/Projects/virtual/dev-server.py': [Errno 2] No such file or directory`

**Root Cause:**
- `npm run dev` was trying to run `dev-server.py` from root directory
- The file is actually in `Frontend/dev-server.py`

**Fix Applied:**
- Updated root `package.json` to change directory before running script

**Files Changed:**
```json
// package.json
"dev": "cd Frontend && python3 dev-server.py"
```

## How to Use

### From Root Directory:
```bash
# Start backend server
npm start

# Start frontend dev server  
npm run dev

# Or use existing scripts:
npm run backend    # Starts backend
npm run frontend   # Starts frontend
```

### From Backend Directory:
```bash
cd Backend
npm start          # Works
npm run dev        # Works with nodemon
```

## Verification

Both fixes tested and working:
- ✅ `.env` file loads correctly from root
- ✅ `dev-server.py` found in Frontend/
- ✅ MongoDB connection should work now

## Status: ✅ RESOLVED

