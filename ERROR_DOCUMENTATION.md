# Error Documentation - 404 Resource Loading Issues

**Date:** 2025-11-06  
**Severity:** HIGH  
**Status:** ✅ RESOLVED

---

## 🔴 **ERROR #1: 404 on /tour Route - Resource Loading Failure**

### **Error Details**
```
tour:1  Failed to load resource: the server responded with a status of 404 (Not Found)
```

**When It Occurs:**
- After clicking "Begin Your Journey" on welcome.html
- During transition from welcome page to 3D tour
- Page shows white blank state
- Console shows 404 errors

**Root Cause:**
The `index.html` file uses **relative paths** for resources:
- `href="style.css"` → Resolves to `/tour/style.css` ❌
- `src="app.js"` → Resolves to `/tour/app.js` ❌

When served from `/tour` route, the browser resolves these relative to `/tour/`, but the files are actually at:
- `/style.css` ✅
- `/app.js` ✅

### **Why This Happened**

1. **Static File Serving:**
   - Server serves `Frontend/` directory as static files
   - Files are accessible at root: `/style.css`, `/app.js`
   - But when HTML is served from `/tour`, relative paths break

2. **Route Configuration:**
   ```javascript
   app.get('/tour', (req, res) => {
     res.sendFile(path.join(__dirname, '../Frontend/index.html'));
   });
   ```
   - Route serves the file, but browser thinks it's at `/tour/`
   - Relative paths resolve relative to current URL path

3. **Missing Absolute Paths:**
   - HTML should use absolute paths (`/style.css`) not relative (`style.css`)
   - This ensures resources load regardless of route

### **Fix Applied**

**File:** `Frontend/index.html`

**Changed:**
```html
<!-- BEFORE (Relative - BREAKS) -->
<link rel="stylesheet" href="style.css">
<script type="text/babel" src="app.js"></script>

<!-- AFTER (Absolute - WORKS) -->
<link rel="stylesheet" href="/style.css">
<script type="text/babel" src="/app.js"></script>
```

### **Verification**

```bash
# Test resources are accessible
curl http://localhost:3000/style.css    # ✅ 200 OK
curl http://localhost:3000/app.js       # ✅ 200 OK
curl http://localhost:3000/tour         # ✅ 200 OK
```

---

## 📋 **PREVENTION CHECKLIST**

### **Before Adding New Routes:**
- [ ] Check all `src=` and `href=` attributes in HTML
- [ ] Use absolute paths (`/path/to/file`) not relative (`path/to/file`)
- [ ] Test route in browser and check Network tab
- [ ] Verify all resources load (CSS, JS, images)

### **Path Rules:**
1. **✅ DO:** Use absolute paths starting with `/`
   ```html
   <link href="/styles/main.css">
   <script src="/js/app.js">
   <img src="/public/logo.svg">
   ```

2. **❌ DON'T:** Use relative paths
   ```html
   <link href="styles/main.css">      <!-- BREAKS on /tour -->
   <script src="../js/app.js">         <!-- BREAKS on /tour -->
   <img src="./images/logo.svg">       <!-- BREAKS on /tour -->
   ```

### **Testing Protocol:**
1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Filter by "Failed" or "404"
   - Identify which resources are missing

2. **Test Each Route:**
   ```bash
   # Test route serves HTML
   curl http://localhost:3000/tour
   
   # Test resources are accessible
   curl http://localhost:3000/style.css
   curl http://localhost:3000/app.js
   ```

3. **Verify Static File Serving:**
   - Check `app.use(express.static(...))` in server.js
   - Ensure static directory is correct
   - Verify files exist in that directory

---

## 🔧 **SYSTEMATIC FIX PROCESS**

### **Step 1: Identify the Error**
- Check browser console for 404 errors
- Note which file/resource is failing
- Check the URL it's trying to load

### **Step 2: Check File Location**
```bash
# Find where file actually is
find . -name "style.css"
find . -name "app.js"

# Check if accessible via static serving
curl http://localhost:3000/style.css
```

### **Step 3: Fix the Path**
- Change relative to absolute path
- Use `/` prefix for root-relative paths
- Test in browser

### **Step 4: Verify Fix**
- Hard refresh browser (Cmd+Shift+R)
- Check Network tab - no 404s
- Verify page loads correctly

---

## 🎯 **CURRENT FILE STATUS**

### **Files with Correct Paths (Absolute):**
- ✅ `Frontend/welcome.html` - All paths absolute
- ✅ `Frontend/welcome-flow.html` - All paths absolute
- ✅ `Frontend/transition.html` - All paths absolute
- ✅ `Frontend/index.html` - **FIXED** - Now uses absolute paths

### **Files to Check:**
- ⚠️ Any new HTML files added in future
- ⚠️ Any new component files
- ⚠️ Any new asset references

---

## 📝 **LESSONS LEARNED**

1. **Always Use Absolute Paths for Static Resources**
   - Relative paths break when served from different routes
   - Absolute paths work regardless of route

2. **Test Routes in Browser, Not Just curl**
   - curl tests the route, but browser resolves paths differently
   - Always check Network tab in DevTools

3. **Document Path Conventions**
   - Establish pattern: All static resources use `/` prefix
   - Enforce in code reviews

4. **Add Route Testing to Checklist**
   - When adding new routes, test all resources load
   - Check console for errors

---

## 🚨 **RED FLAGS TO WATCH FOR**

1. **Relative Paths in HTML:**
   - `href="file.css"` → Should be `href="/file.css"`
   - `src="script.js"` → Should be `src="/script.js"`
   - `url('../images/...')` → Should be `url('/public/images/...')`

2. **404 Errors in Console:**
   - Always investigate immediately
   - Don't assume it's "just a favicon"
   - Check Network tab for full details

3. **White Blank Pages:**
   - Usually means critical resource failed to load
   - Check console for errors
   - Verify all CSS/JS files load

4. **Route-Specific Issues:**
   - If page works at `/` but not `/tour`
   - Likely relative path issue
   - Check all resource paths

---

## ✅ **VERIFICATION CHECKLIST**

After any route or HTML changes:
- [ ] All `src=` attributes use absolute paths
- [ ] All `href=` attributes use absolute paths
- [ ] All `url()` in CSS use absolute paths
- [ ] Test route in browser
- [ ] Check Network tab for 404s
- [ ] Verify page renders correctly
- [ ] Check console for errors

---

## 🔄 **ONGOING MAINTENANCE**

### **Code Review Checklist:**
- [ ] No relative paths in HTML/CSS
- [ ] All static resources use `/` prefix
- [ ] Routes tested in browser
- [ ] Network tab checked for errors

### **Automated Checks (Future):**
- Add linting rule for relative paths
- Add pre-commit hook to check paths
- Add test that verifies all resources load

---

**Last Updated:** 2025-11-06  
**Status:** ✅ RESOLVED  
**Prevention:** ✅ DOCUMENTED

