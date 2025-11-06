# 🚀 Quick Start Guide - 5 Minutes

## ✅ **CURRENT STATUS CHECK**

Run this to see current status:
```bash
cd Backend
test -f .env && echo "✅ .env exists" || echo "❌ .env missing"
test -d node_modules && echo "✅ Dependencies installed" || echo "❌ Run: npm install"
curl -s http://localhost:3000/api/health > /dev/null && echo "✅ Server running" || echo "❌ Server not running"
```

---

## 📋 **EXECUTION STEPS**

### **STEP 1: Start Backend** (1 command)
```bash
npm start
```

**✅ Look for:**
- "Server running on port 3000"
- "Database: ✅ Connected"
- No error messages

---

### **STEP 2: Open Browser** (1 click)
```
http://localhost:3000
```

**✅ Should see:**
- Welcome page with slideshow
- "Begin Your Journey" button
- Truman logo

---

### **STEP 3: Open DevTools** (1 keypress)
- **Mac:** `Cmd + Option + I`
- **Windows:** `F12`

**✅ Check Console Tab:**
- No red errors
- May see info messages (OK)

**✅ Check Network Tab:**
- Filter by "Failed"
- Should see nothing
- All requests green (200 OK)

---

### **STEP 4: Test Flow** (1 click)
1. Click "Begin Your Journey"
2. Watch smooth transition
3. See loading screen
4. 3D scene loads

**✅ Success if:**
- Smooth fade transition
- No white blank screen
- 3D scene appears
- Can drag to rotate

---

## 🔧 **IF SOMETHING GOES WRONG**

### **Server won't start?**
```bash
# Kill existing process
kill $(lsof -ti :3000)

# Start again
npm start
```

### **404 errors?**
```bash
# Hard refresh browser
# Mac: Cmd+Shift+R
# Windows: Ctrl+Shift+R
```

### **Database error?**
```bash
# Test connection
cd Backend
npm run test:db
```

---

## ✅ **FINAL CHECKLIST**

Before you're done, verify:

- [ ] Server running (port 3000)
- [ ] Welcome page loads
- [ ] No console errors
- [ ] No 404 errors
- [ ] Button works
- [ ] 3D scene loads
- [ ] Can interact with scene

**If all checked ✅ → You're good to go!**

---

**For detailed guide, see: `EXECUTION_GUIDE.md`**

