# Port Conflict Fix Guide

## 🔴 **ERROR: EADDRINUSE - Port 3000 Already in Use**

### **What Happens:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

### **Why It Happens:**
- Previous server instance is still running
- Another application is using port 3000
- Server didn't shut down properly

---

## ✅ **QUICK FIX (3 Methods)**

### **Method 1: Kill Process Automatically** ⭐ Recommended
```bash
npm run start:clean
```
This automatically kills any process on port 3000 before starting.

### **Method 2: Manual Kill**
```bash
# Find and kill process on port 3000
kill $(lsof -ti :3000)

# Then start server
npm start
```

### **Method 3: One-Liner**
```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null; npm start
```

---

## 🔍 **HOW TO CHECK IF PORT IS IN USE**

```bash
# Check what's using port 3000
lsof -i :3000

# Or check process
ps aux | grep node | grep server
```

---

## 🛠️ **IMPROVED ERROR HANDLING**

The server now shows a helpful message when port is in use:

```
❌ Port 3000 is already in use!

🔧 Quick Fix:
   Run this command to free the port:
   kill $(lsof -ti :3000)

   Or use a different port by setting PORT in .env file
```

---

## 📋 **PREVENTION**

### **Always Stop Server Properly:**
- Press `Ctrl+C` in terminal where server is running
- Or use: `kill $(lsof -ti :3000)`

### **Use the Clean Start Script:**
```bash
npm run start:clean
```
This ensures no conflicts before starting.

---

## 🎯 **RECOMMENDED WORKFLOW**

### **Starting Server:**
```bash
# Option 1: Clean start (recommended)
npm run start:clean

# Option 2: Regular start (if port is free)
npm start
```

### **Stopping Server:**
```bash
# In terminal where server is running:
Ctrl+C

# Or from another terminal:
kill $(lsof -ti :3000)
```

---

## ✅ **VERIFICATION**

After starting server, you should see:
```
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

If you see this → Server is running correctly! ✅

---

## 🚨 **TROUBLESHOOTING**

### **If kill command doesn't work:**
```bash
# Force kill
kill -9 $(lsof -ti :3000)

# Or find process ID manually
lsof -i :3000
# Then kill with the PID shown
kill -9 <PID>
```

### **If port is still in use:**
```bash
# Check all node processes
ps aux | grep node

# Kill all node processes (be careful!)
pkill -9 node
```

### **Use Different Port:**
Edit `Backend/.env`:
```
PORT=3001
```

Then access at: `http://localhost:3001`

---

## 📝 **SUMMARY**

**Problem:** Port 3000 already in use  
**Solution:** Kill existing process, then start  
**Prevention:** Use `npm run start:clean`  
**Quick Fix:** `kill $(lsof -ti :3000) && npm start`

