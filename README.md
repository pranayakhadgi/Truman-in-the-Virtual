# Truman Virtual Tour - Immersive 3D Campus Experience

## 🎓 Project Overview
An immersive 3D virtual tour application for Truman State University, allowing prospective students and visitors to explore the campus from anywhere in the world through a browser-based 3D environment.

## 📁 Project Structure
```
truman-virtual-tour/
├── Frontend/                 # Frontend application files
│   ├── welcome.html         # Welcome page with slideshow
│   ├── index.html           # 3D virtual tour experience
│   ├── app.js              # React + Three.js application
│   └── style.css           # Custom styling
├── Backend/                 # Backend services
│   ├── server.js           # Express.js server
│   └── package.json        # Backend dependencies
├── Database/                # Database schemas and configurations
│   ├── schema.sql          # Database schema
│   └── README.md           # Database documentation
├── public/                  # Static assets
│   ├── logo/               # Truman logos and branding
│   ├── icons/              # Pixelated icons and animations
│   └── images/             # Campus photos and skybox images
└── README.md               # This file
```

## 🚀 Features

### Welcome Page
- **Truman-themed slideshow** with campus images
- **Elegant typography** with Cinzel and Playfair Display fonts
- **Pixelated loading animation** using Hana Caraka icons
- **Responsive design** for all devices
- **Smooth animations** and transitions

### 3D Virtual Tour
- **Interactive 3D skybox** using Three.js
- **Multi-skybox system** with smooth transitions
- **Media player controls** for navigation
- **Mouse navigation** with OrbitControls
- **Real-time 3D rendering** in browser
- **Truman branding** integration
- **Cross-platform compatibility**
- **Loading animations** during transitions

### Technical Features
- **React.js** for component-based architecture
- **Three.js** for 3D graphics rendering
- **TailwindCSS** for responsive styling
- **Express.js** backend server
- **Vercel deployment** ready

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Advanced styling and animations
- **JavaScript (ES6+)** - Modern JavaScript features
- **React 18** - Component-based UI
- **Three.js** - 3D graphics library
- **TailwindCSS** - Utility-first CSS framework
- **Font Awesome** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **dotenv** - Environment variable management

### Database (Future)
- **PostgreSQL** - Primary database
- **Redis** - Session storage
- **MongoDB** - Analytics data
- **Elasticsearch** - Search functionality

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Modern web browser with WebGL support

### Frontend Setup
```bash
# Navigate to project directory
cd truman-virtual-tour

# Install frontend dependencies (if using npm)
npm install

# Start development server
python3 dev-server.py
# OR
node Backend/server.js
```

### Backend Setup
```bash
# Navigate to backend directory
cd Backend

# Install backend dependencies
npm install

# Start backend server
npm start
# OR for development
npm run dev
```

## 🌐 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Other
   - Root Directory: Frontend/
   - Build Command: (leave empty)
   - Output Directory: Frontend/
3. Deploy automatically on git push

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy to your hosting service
# Files are ready in Frontend/ directory
```

## 📊 Project Timeline & Updates

### October 14, 2025
- ✅ **Initial project setup** - Created basic 3D skybox experience
- ✅ **Welcome page implementation** - Added Truman-themed slideshow
- ✅ **Font improvements** - Implemented elegant typography
- ✅ **Pixelated animations** - Added Hana Caraka icons loading animation
- ✅ **Project reorganization** - Structured into Frontend/Backend/Database/Public folders
- ✅ **Path refactoring** - Updated all file paths for new structure
- ✅ **Comprehensive documentation** - Created detailed README
- ✅ **Multi-skybox system** - Implemented smooth transitions between Truman Campus and Football Field
- ✅ **Media player controls** - Added Previous/Next navigation buttons
- ✅ **Image optimization** - Renamed football field images to prevent conflicts
- ✅ **Transition debugging** - Enhanced error handling and console logging
- ✅ **Loading indicators** - Improved pixelated loading animations during transitions
- ✅ **Distinct skybox images** - Fixed to use different image sets for each environment
- ✅ **Button click events** - Fixed navigation button functionality with proper event handling
- ✅ **State management** - Improved transition state handling and debugging

### Future Updates
- 🔄 **Database integration** - User analytics and feedback
- 🔄 **Enhanced 3D features** - Multiple campus locations
- 🔄 **Mobile optimization** - Touch controls for mobile devices
- 🔄 **Performance optimization** - Faster loading and rendering
- 🔄 **Accessibility features** - Screen reader support and keyboard navigation

## 🎯 Usage Instructions

### For Visitors
1. **Open welcome page** - View Truman campus slideshow
2. **Click "Start Virtual Tour"** - Enter 3D experience
3. **Navigate with mouse** - Look around, zoom, pan
4. **Use back button** - Return to welcome page

### For Developers
1. **Clone repository** - Get latest code
2. **Install dependencies** - Set up development environment
3. **Run development server** - Test locally
4. **Make changes** - Update code as needed
5. **Deploy changes** - Push to GitHub for auto-deployment

## 🔧 Development Guidelines

### Code Standards
- **ES6+ JavaScript** - Use modern JavaScript features
- **Component-based architecture** - Follow React best practices
- **Responsive design** - Mobile-first approach
- **Performance optimization** - Minimize bundle size
- **Accessibility** - WCAG 2.1 compliance

### File Naming
- **HTML files** - lowercase with hyphens (welcome.html)
- **JavaScript files** - camelCase (app.js)
- **CSS files** - lowercase with hyphens (style.css)
- **Image files** - descriptive names (truman_clocktower.jpg)

## 📝 Contributing

### How to Contribute
1. **Fork the repository** - Create your own copy
2. **Create feature branch** - Work on new features
3. **Follow coding standards** - Maintain code quality
4. **Test thoroughly** - Ensure everything works
5. **Submit pull request** - Share your improvements

### Development Workflow
1. **Plan changes** - Document what you're building
2. **Implement features** - Write clean, efficient code
3. **Test functionality** - Verify everything works
4. **Update documentation** - Keep README current
5. **Deploy changes** - Push to production

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

**Developers:**
- Pranaya Khadgi Shahi
- Ali Musterih Addikebir

**Professor:**
- Dr. Kafi Rahman

**Institution:**
- Truman State University
- Computer Science Department

## 📞 Support

For questions or support, please contact:
- **Email:** [Contact Information]
- **GitHub Issues:** [Repository Issues]
- **Documentation:** [Project Wiki]

## 🔗 Links

- **Live Demo:** [Vercel Deployment URL]
- **GitHub Repository:** [Repository URL]
- **Documentation:** [Project Documentation]
- **Truman State University:** [University Website]

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0  
**Status:** Active Development
