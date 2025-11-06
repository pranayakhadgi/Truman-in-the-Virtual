# Path Prevention Guide - Never Repeat 404 Errors

## 🎯 **GOLDEN RULE**

**ALWAYS USE ABSOLUTE PATHS FOR STATIC RESOURCES**

When serving HTML from routes (like `/tour`, `/welcome-flow`), relative paths break because the browser resolves them relative to the current URL path, not the file system.

---

## ✅ **CORRECT PATTERNS**

### **HTML Files:**
```html
<!-- ✅ CORRECT - Absolute paths -->
<link rel="stylesheet" href="/style.css">
<script src="/app.js"></script>
<img src="/public/logo/logo.svg">
<link rel="icon" href="data:,">

<!-- ✅ CORRECT - External URLs -->
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=..."></link>
```

### **CSS Files:**
```css
/* ✅ CORRECT - Absolute paths */
background-image: url('/public/images/photo.jpg');
background-image: url('/public/icons/icons.png');
```

### **JavaScript Files:**
```javascript
// ✅ CORRECT - Absolute paths
const imagePath = '/public/images/photo.jpg';
fetch('/api/sessions', {...});
```

---

## ❌ **WRONG PATTERNS (DON'T USE)**

```html
<!-- ❌ WRONG - Relative paths break on routes -->
<link rel="stylesheet" href="style.css">        <!-- Breaks on /tour -->
<script src="app.js"></script>                  <!-- Breaks on /tour -->
<img src="../public/logo.svg">                  <!-- Breaks on /tour -->
<link rel="stylesheet" href="./styles/main.css"> <!-- Breaks on /tour -->
```

---

## 🔍 **HOW TO IDENTIFY THE PROBLEM**

### **Symptoms:**
1. ✅ Page loads at `/` but ❌ shows blank at `/tour`
2. Console shows: `Failed to load resource: 404`
3. Network tab shows red entries for CSS/JS files
4. Page renders but styles are missing

### **Quick Check:**
```bash
# If you see relative paths like this, they're WRONG:
href="style.css"        # ❌
src="app.js"            # ❌
href="./styles.css"     # ❌
src="../js/app.js"      # ❌

# Should be:
href="/style.css"       # ✅
src="/app.js"           # ✅
```

---

## 🛠️ **FIX PROCESS**

### **Step 1: Find the Problem**
```bash
# Search for relative paths
grep -r 'href="[^h/]' Frontend/*.html
grep -r 'src="[^h/]' Frontend/*.html
```

### **Step 2: Fix Each File**
```html
<!-- BEFORE -->
<link rel="stylesheet" href="style.css">

<!-- AFTER -->
<link rel="stylesheet" href="/style.css">
```

### **Step 3: Test**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to the route
4. Check for 404 errors
5. Verify all resources load (green status)

---

## 📋 **PRE-COMMIT CHECKLIST**

Before committing any HTML/CSS/JS changes:

- [ ] All `href=` attributes use absolute paths or full URLs
- [ ] All `src=` attributes use absolute paths or full URLs
- [ ] All `url()` in CSS use absolute paths
- [ ] Tested route in browser
- [ ] Checked Network tab - no 404s
- [ ] Console shows no errors

---

## 🎓 **WHY THIS HAPPENS**

### **The Problem:**
```
Route: /tour
HTML served from: /tour
Relative path: style.css
Browser resolves to: /tour/style.css ❌
Actual file location: /style.css ✅
```

### **The Solution:**
```
Route: /tour
HTML served from: /tour
Absolute path: /style.css
Browser resolves to: /style.css ✅
Actual file location: /style.css ✅
```

---

## 📊 **CURRENT STATUS**

### **Files Verified:**
- ✅ `Frontend/welcome.html` - All paths absolute
- ✅ `Frontend/welcome-flow.html` - All paths absolute
- ✅ `Frontend/transition.html` - All paths absolute
- ✅ `Frontend/index.html` - **FIXED** - All paths absolute

### **Files to Watch:**
- Any new HTML files
- Any new component files
- Any CSS files with `url()` references

---

## 🚨 **RED FLAGS**

If you see any of these, fix immediately:

1. **Relative paths in HTML:**
   ```html
   <link href="file.css">      <!-- ❌ -->
   <script src="script.js">    <!-- ❌ -->
   ```

2. **Relative paths in CSS:**
   ```css
   url('../images/photo.jpg')   <!-- ❌ -->
   url('./icons/icon.png')     <!-- ❌ -->
   ```

3. **404 errors in console:**
   - Never ignore these
   - Always investigate
   - Check Network tab for details

---

## ✅ **VERIFICATION COMMANDS**

```bash
# Test route serves HTML
curl http://localhost:3000/tour

# Test resources are accessible
curl http://localhost:3000/style.css
curl http://localhost:3000/app.js
curl http://localhost:3000/public/logo/logo.svg

# Check for relative paths (should return nothing)
grep -r 'href="[^h/]' Frontend/*.html | grep -v "http"
grep -r 'src="[^h/]' Frontend/*.html | grep -v "http"
```

---

## 📝 **DOCUMENTATION STANDARD**

When documenting errors:
1. **Describe the problem** - What happened?
2. **Root cause** - Why did it happen?
3. **Fix applied** - What was changed?
4. **Prevention** - How to avoid it?
5. **Verification** - How to test it's fixed?

---

**Remember:** Absolute paths = No surprises! 🎯

