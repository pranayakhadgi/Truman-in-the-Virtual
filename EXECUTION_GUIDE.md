# Complete Execution Guide - Truman Virtual Tour

**Last Updated:** 2025-11-06  
**Purpose:** Step-by-step guide to run the system properly

---

## 🎯 **QUICK START (5 Minutes)**

```bash
# 1. Navigate to project
cd /Users/pantujantu/Desktop/Projects/virtual

# 2. Start backend server
npm start

# 3. Open browser
# Visit: http://localhost:3000
```

---

## 📋 **DETAILED STEP-BY-STEP GUIDE**

### **STEP 1: Verify Prerequisites** (2 minutes)

#### 1.1 Check Node.js Installation
```bash
node --version
# Should show: v16.x.x or higher
```

#### 1.2 Check npm Installation
```bash
npm --version
# Should show: 8.x.x or higher
```

#### 1.3 Verify .env File Exists
```bash
ls -la Backend/.env
# Should show the file exists
```

#### 1.4 Check .env File Content
```bash
cd Backend
cat .env | grep MONGODB_URI
# Should show your MongoDB connection string
# Should NOT show: <password> or YOUR_PASSWORD_HERE
```

**✅ Verification:**
- [ ] Node.js installed
- [ ] npm installed
- [ ] .env file exists
- [ ] MongoDB URI is configured (not placeholder)

---

### **STEP 2: Install Dependencies** (3 minutes)

#### 2.1 Install Backend Dependencies
```bash
cd Backend
npm install
```

**Expected Output:**
```
added 150 packages in 10s
```

#### 2.2 Verify Key Packages
```bash
npm list mongoose express dotenv
# Should show versions, not "missing"
```

**✅ Verification:**
- [ ] No errors during installation
- [ ] node_modules folder created
- [ ] Key packages installed

---

### **STEP 3: Test Database Connection** (2 minutes)

#### 3.1 Run Database Test
```bash
cd Backend
npm run test:db
```

**Expected Output:**
```
🧪 Starting Database Tests...

Test 1: Database Connection
✅ MongoDB Connected: truman-virtual-tour.q7gbnfm.mongodb.net
📊 Database Name: truman-virtual-tour
🔗 Connection State: Connected
✅ Connection successful

[... more tests ...]

🎉 All tests passed!
```

**✅ Verification:**
- [ ] All tests pass
- [ ] No connection errors
- [ ] Database name shows correctly

**❌ If Tests Fail:**
- Check MongoDB Atlas IP whitelist
- Verify password in .env file
- Check internet connection

---

### **STEP 4: Start Backend Server** (1 minute)

#### 4.1 Start Server
```bash
cd Backend
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: ac-8iexgtt-shard-00-xx.q7gbnfm.mongodb.net
📊 Database Name: truman-virtual-tour
🔗 Connection State: Connected
==========================================
🚀 Truman Virtual Tour Backend
==========================================
📱 Server running on port 3000
🌐 Frontend: http://localhost:3000
🔧 API Health: http://localhost:3000/api/health
📊 Environment: development
🗄️  Database: ✅ Connected
==========================================
```

**✅ Verification:**
- [ ] Server starts without errors
- [ ] MongoDB shows "Connected"
- [ ] Port 3000 is listening
- [ ] No error messages

**❌ If Server Fails:**
- Check if port 3000 is already in use: `lsof -ti :3000`
- Kill existing process: `kill $(lsof -ti :3000)`
- Check .env file is correct
- Verify MongoDB connection

---

### **STEP 5: Verify Backend is Working** (1 minute)

#### 5.1 Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

**Expected Output:**
```json
{
  "status": "OK",
  "message": "Truman Virtual Tour Backend is running",
  "database": "Connected",
  "timestamp": "2025-11-06T...",
  "version": "1.1.0"
}
```

#### 5.2 Test Session Creation
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"userType":"unknown"}'
```

**Expected Output:**
```json
{
  "success": true,
  "sessionId": "uuid-here",
  "message": "Session created successfully"
}
```

**✅ Verification:**
- [ ] Health endpoint returns OK
- [ ] Database shows "Connected"
- [ ] Session creation works
- [ ] No 404 or 500 errors

---

### **STEP 6: Open Application in Browser** (1 minute)

#### 6.1 Open Browser
```
http://localhost:3000
```

#### 6.2 Open Developer Tools
- **Mac:** `Cmd + Option + I`
- **Windows/Linux:** `F12` or `Ctrl + Shift + I`

#### 6.3 Check Console Tab
- Should see no red errors
- May see info messages (OK)
- No 404 errors

#### 6.4 Check Network Tab
- Filter by "Failed" or "404"
- Should see no failed requests
- All resources should be green (200 OK)

**✅ Verification:**
- [ ] Welcome page loads
- [ ] Images display correctly
- [ ] Logo appears
- [ ] No console errors
- [ ] No 404 errors in Network tab

---

### **STEP 7: Test Complete Flow** (2 minutes)

#### 7.1 Click "Begin Your Journey"
- Button should show loading animation
- Smooth fade-out overlay appears
- Redirects to `/tour` after 1.5 seconds

#### 7.2 Verify Transition
- Loading overlay shows on `/tour` page
- "Loading 3D environment..." message
- Overlay fades out after 2 seconds

#### 7.3 Verify 3D Scene
- 3D skybox renders
- Can drag to rotate view
- No white blank screen
- No console errors

**✅ Verification:**
- [ ] Button click works
- [ ] Smooth transition occurs
- [ ] 3D scene loads
- [ ] Can interact with scene
- [ ] No errors in console

---

## 🔍 **TROUBLESHOOTING CHECKLIST**

### **Problem: Server Won't Start**

**Check:**
1. Port 3000 available?
   ```bash
   lsof -ti :3000
   # If output, kill it: kill $(lsof -ti :3000)
   ```

2. .env file correct?
   ```bash
   cd Backend
   cat .env | grep MONGODB_URI
   ```

3. Dependencies installed?
   ```bash
   cd Backend
   npm install
   ```

### **Problem: Database Connection Fails**

**Check:**
1. MongoDB Atlas IP whitelisted?
   - Go to MongoDB Atlas → Network Access
   - Add your IP or allow 0.0.0.0/0

2. Password correct in .env?
   - No `<password>` placeholder
   - Password matches Atlas

3. Internet connection?
   - Can you access MongoDB Atlas website?

### **Problem: 404 Errors in Browser**

**Check:**
1. All paths absolute?
   ```bash
   grep -r 'href="[^h/]' Frontend/*.html
   grep -r 'src="[^h/]' Frontend/*.html
   # Should return nothing (or only external URLs)
   ```

2. Server running?
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Hard refresh browser?
   - `Cmd+Shift+R` (Mac)
   - `Ctrl+Shift+R` (Windows)

### **Problem: White Blank Page**

**Check:**
1. Console errors?
   - Open DevTools (F12)
   - Check Console tab
   - Look for red errors

2. Network tab?
   - Check for failed requests
   - Verify all resources load

3. JavaScript errors?
   - Check if React/Three.js loaded
   - Verify app.js loads

---

## ✅ **FINAL VERIFICATION CHECKLIST**

Before considering the system "working":

- [ ] Backend server running (port 3000)
- [ ] MongoDB connected
- [ ] Health endpoint returns OK
- [ ] Welcome page loads correctly
- [ ] All images display
- [ ] Button "Begin Your Journey" works
- [ ] Smooth transition occurs
- [ ] 3D scene loads
- [ ] Can interact with 3D scene
- [ ] No console errors
- [ ] No 404 errors in Network tab
- [ ] No white blank screens

---

## 🚀 **QUICK REFERENCE COMMANDS**

```bash
# Start backend
cd Backend && npm start

# Test database
cd Backend && npm run test:db

# Check server health
curl http://localhost:3000/api/health

# Kill server if needed
kill $(lsof -ti :3000)

# Check for errors
curl -v http://localhost:3000/tour 2>&1 | grep -E "HTTP|404"
```

---

## 📊 **EXPECTED FLOW**

```
1. Start Server
   ↓
2. Open Browser → http://localhost:3000
   ↓
3. See Welcome Page (slideshow, logo, button)
   ↓
4. Click "Begin Your Journey"
   ↓
5. Smooth fade-out overlay
   ↓
6. Redirect to /tour
   ↓
7. Loading overlay shows
   ↓
8. 3D scene loads
   ↓
9. Overlay fades out
   ↓
10. 3D skybox interactive
```

---

## 🎯 **SUCCESS CRITERIA**

The system is working properly when:

1. ✅ Server starts without errors
2. ✅ Database connects successfully
3. ✅ Welcome page displays correctly
4. ✅ Button click triggers smooth transition
5. ✅ 3D scene loads and is interactive
6. ✅ No console errors
7. ✅ No 404 errors
8. ✅ Smooth user experience

---

**Follow this guide step-by-step and you'll have a working system!** 🎉

