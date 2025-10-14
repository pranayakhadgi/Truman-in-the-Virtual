# Truman in the Virtual - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Direct GitHub Import (Recommended)
1. Go to: https://vercel.com/new/import?framework=other&hasTrialAvailable=1&project-name=truman-in-the-virtual&remainingProjects=1&s=https%3A%2F%2Fgithub.com%2Fpranayakhadgi%2FTruman-in-the-Virtual&teamSlug=pranayas-projects-110992b8&totalProjects=1
2. Choose "Other" as framework preset
3. Set root directory to `/` (current directory)
4. Leave build command empty (static site)
5. Set output directory to `/`
6. Click "Deploy"

### Option 2: Manual Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# For production deployment
vercel --prod
```

## 🔧 Local Development with Live Editing

### Start Development Server
```bash
# Option 1: Python server (recommended)
python3 dev-server.py

# Option 2: Simple Python server
python3 -m http.server 8000

# Option 3: Node.js server (if you have Node.js)
npx serve .
```

### Live Editing Features
- ✅ **Hot reload**: Changes to HTML, CSS, JS files reflect immediately
- ✅ **CORS enabled**: Works with Three.js and external CDNs
- ✅ **Auto browser open**: Automatically opens your browser
- ✅ **Cross-platform**: Works on macOS, Windows, Linux

## 📁 Project Structure for Vercel
```
truman-in-the-virtual/
├── index.html          # Main entry point
├── app.js              # React + Three.js application
├── style.css           # Styling
├── vercel.json         # Vercel configuration
├── package.json        # Project metadata
├── dev-server.py       # Development server
├── images/             # Static assets
│   └── logo.svg
├── posx.jpg            # Skybox textures
├── negx.jpg
├── posy.jpg
├── negy.jpg
├── posz.jpg
├── negz.jpg
└── readme.txt          # Project documentation
```

## ⚙️ Vercel Configuration

### Framework Settings
- **Framework Preset**: Other
- **Build Command**: (leave empty - static site)
- **Output Directory**: / (root)
- **Install Command**: (leave empty)

### Environment Variables
No environment variables needed for this static site.

### Custom Headers (in vercel.json)
- Cross-Origin-Embedder-Policy: require-corp
- Cross-Origin-Opener-Policy: same-origin

## 🔄 Live Editing Workflow

### Development Process
1. **Start dev server**: `python3 dev-server.py`
2. **Edit files**: Modify HTML, CSS, or JS files
3. **See changes**: Browser automatically refreshes
4. **Test 3D features**: Navigate skybox, test controls
5. **Commit changes**: `git add . && git commit -m "Update"`
6. **Deploy**: Push to GitHub (auto-deploys to Vercel)

### File Watching
The development server automatically detects changes to:
- `index.html`
- `app.js`
- `style.css`
- Skybox images (`*.jpg`)

## 🌐 Production Deployment

### Automatic Deployment
- Push to `main` branch → Auto-deploys to Vercel
- Preview deployments for pull requests
- Custom domain support

### Manual Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🎯 Dynamic UI/UX Capabilities

### Current Setup (Static + React)
- ✅ **Interactive 3D navigation**
- ✅ **Real-time mouse controls**
- ✅ **Responsive design**
- ✅ **Component-based architecture**

### Future Enhancements (Optional)
For more advanced features, consider upgrading to:
- **Next.js**: Server-side rendering, API routes
- **Vite + React**: Faster development, better tooling
- **Three.js + React Three Fiber**: More React integration

## 🐛 Troubleshooting

### Common Issues
1. **CORS errors**: Use the provided dev-server.py
2. **Skybox not loading**: Ensure all 6 images are in root directory
3. **Three.js not working**: Check browser console for errors
4. **Vercel deployment fails**: Check vercel.json configuration

### Debug Commands
```bash
# Check if files are accessible
python3 -c "import os; print(os.listdir('.'))"

# Test local server
curl http://localhost:8000

# Check Vercel deployment
vercel logs
```

## 📱 Mobile Support
- Responsive design works on mobile devices
- Touch controls for 3D navigation
- Optimized for various screen sizes

## 🔒 Security Considerations
- No sensitive data in client-side code
- CORS headers configured for Three.js
- Static site - no server-side vulnerabilities

---

**Ready to deploy?** Just push your code to GitHub and use the Vercel import link above!
