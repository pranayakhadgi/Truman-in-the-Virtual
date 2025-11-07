# Truman Virtual Tour

An immersive 3D virtual tour application for Truman State University that allows prospective students and visitors to explore the campus from anywhere in the world through an interactive browser-based 3D environment.

## What Problem Does This Solve?

The Truman Virtual Tour addresses the challenge of providing accessible, engaging campus exploration for prospective students who cannot physically visit the campus. It offers:

- **Remote Campus Exploration**: Experience Truman's campus locations in 360° immersive environments
- **Interactive Learning**: Click on annotations to learn about key campus locations and features
- **Accessibility**: Text-to-speech narration and intuitive navigation for all users
- **Personalized Experience**: Multi-step questionnaire to customize the tour experience
- **Seamless Application Process**: Direct integration with Truman's application portal
- **Location Mapping**: Interactive map showing exact locations of each scene

## Features

- **Interactive 3D Skybox Environments**: Explore "Thousand Hills in Truman" and "The Quad" in full 360° views
- **Auto-Rotating Camera**: Smooth automatic rotation for hands-free exploration
- **Interactive Annotations**: Click on location markers to learn about campus features
- **Text-to-Speech Narration**: Female voice narration for each scene
- **Welcome Flow**: Multi-step form to collect visitor information and interests
- **Question Flow (queries.html)**: Personalized questionnaire with branching logic
- **Database Integration**: MongoDB Atlas for storing user sessions and responses
- **Interactive Map Dialog**: Bottom-right dialog showing exact location of current scene
- **Direct Application Link**: Quick access to Truman's application portal
- **Visit Truman Link**: Direct link to campus visit scheduling

## Screenshots

### Welcome Page
<img width="1396" height="785" alt="Screen Shot 2025-11-06 at 12 17 46 PM" src="https://github.com/user-attachments/assets/093f5a28-2c47-4126-8b4c-f8436e642401" />

*Interactive welcome page with campus slideshow and tour initiation*

### Skybox Environment - The Quad
<img width="1399" height="784" alt="Screen Shot 2025-11-06 at 8 36 07 PM" src="https://github.com/user-attachments/assets/1df4ac45-6bc2-48da-aeb7-916fa087db76" />

*Immersive 3D environment showing Truman's iconic Quad with AI autoamted voice tour*

### Application Redirect
<img width="1395" height="785" alt="Screen Shot 2025-11-06 at 12 18 27 PM" src="https://github.com/user-attachments/assets/f6a1a94f-0ba8-4dae-867d-4ba2becc718a" />

*Seamless redirect to Truman's online application portal*

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Maps API key (for map features)

### Installation

```bash
# Install dependencies
cd Backend
npm install

# Create .env file in Backend/ directory
# See Environment Setup section below
```

### Environment Setup

Create a `.env` file in the `Backend/` directory:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Server Port (default: 3000)
PORT=3000

# Node Environment
NODE_ENV=development

# Allowed CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000,http://127.0.0.1:8000,http://127.0.0.1:3000
```

### Running the Application

```bash
# Start backend server
cd Backend
npm start

# Access the application
# Open http://localhost:3000 in your browser
```

### Application Flow

1. **Welcome Page** (`/`) - Landing page with campus slideshow
2. **Queries Page** (`/queries`) - Personalized questionnaire flow
3. **3D Tour** (`/tour`) - Interactive skybox environment
4. **Map Dialog** - Click "View Map" button to see location

## Project Structure

```
truman-virtual-tour/
├── Backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   └── Session.js           # Session data model
│   ├── routes/
│   │   └── sessionRoutes.js     # API endpoints
│   ├── server.js                # Express server
│   └── .env                     # Environment variables
├── Frontend/
│   ├── components/
│   │   ├── skybox/
│   │   │   ├── constants.js     # Skybox configurations
│   │   │   ├── SkyboxScene.js   # 3D scene component
│   │   │   └── UIComponents.js  # UI components
│   │   ├── welcome-flow/        # Welcome flow components
│   │   └── context/             # React context
│   ├── config/
│   │   ├── questionTree.js      # Question flow logic
│   │   └── facilities.js        # Facility data
│   ├── services/
│   │   └── api.js               # API service layer
│   ├── app.js                   # Main React app
│   ├── index.html               # 3D tour page
│   ├── queries.html             # Question flow page
│   ├── welcome.html             # Landing page
│   └── MapView.js               # Google Maps integration
├── public/                      # Static assets
│   ├── field-skyboxes 2/        # Skybox images
│   ├── images/                  # Campus images
│   └── logo/                    # Truman logo
└── README.md                    # This file
```

## Technologies

- **Frontend**: React, Three.js, TailwindCSS, Babel
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **3D Rendering**: Three.js WebGL
- **Text-to-Speech**: Web Speech API
- **Maps**: Google Maps JavaScript API
- **Database**: MongoDB Atlas

## API Endpoints

### Session Management
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/responses` - Add question response
- `POST /api/sessions/:id/facilities` - Add facility selection
- `PATCH /api/sessions/:id/contact` - Update contact info
- `POST /api/sessions/:id/complete` - Mark session complete

### Health Check
- `GET /api/health` - Server and database status

## Google Maps Setup

### API Key Configuration

The Google Maps API key is located in `Frontend/index.html`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY" async defer></script>
```

**Current API Key**: `AIzaSyBoxO3KA_9_gIOE0j1gKhI16vhbAfi35qw`

### Enable Maps JavaScript API

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library)
2. Search for "Maps JavaScript API"
3. Click "Enable"
4. Wait 2-5 minutes for activation

### Location Coordinates

- **Thousand Hills State Park**: `40.34508954846465, -92.57451304955303`
- **Truman State University Quad**: `40.18873778168771, -92.58083505450213`

### Common Errors

- **ApiNotActivatedMapError**: Enable Maps JavaScript API in Google Cloud Console
- **InvalidKeyMapError**: Verify API key and restrictions
- **RefererNotAllowedMapError**: Adjust HTTP referrer restrictions

## Database Schema

### Session Model
- `sessionId` (UUID) - Unique session identifier
- `userType` - User classification (prospective_student, parent, etc.)
- `interest` - Area of interest (computer_science, liberal_arts, etc.)
- `selectedFacilities` - Array of selected facilities
- `contactInfo` - Contact information (email, name, phone, zipCode, optInForUpdates)
- `responses` - Array of question/answer pairs
- `status` - Session status (active, completed, abandoned)

## File Flow

```
welcome.html → queries.html → index.html (skybox)
```

1. User starts at `/` (welcome.html)
2. Redirects to `/queries` (queries.html) for personalized questionnaire
3. Completes flow and redirects to `/tour` (index.html) for 3D experience
4. Can click "View Map" to see location in dialog overlay

## Development

### Testing Database Connection
```bash
cd Backend
npm run test:db
```

### Checking API Health
```bash
# Start server
npm start

# Visit http://localhost:3000/api/health
```

### Troubleshooting

#### MongoDB Connection Issues
- Verify `.env` file exists in `Backend/` directory
- Check `MONGODB_URI` is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Restart server after `.env` changes

#### Google Maps Not Loading
- Enable Maps JavaScript API in Google Cloud Console
- Verify API key is correct
- Check API key restrictions
- Wait 2-5 minutes after enabling API

#### Frontend Not Loading
- Ensure backend server is running
- Check browser console for errors
- Verify all script files are loading correctly

## Security Notes

- `.env` file is in `.gitignore` (never commit sensitive data)
- API keys should be restricted in production
- MongoDB connection string should be kept secure
- Use environment variables for all sensitive configuration

## Team

**Developers:**
- Pranaya Khadgi Shahi
- Ali Musterih Addikebir

**Business pitch:**
- Mayowa Esan

**Professor:**
- Dr. Kafi Rahman (The Truman CS Department)

**Institution:**
- Truman State University
- Computer Science Department

## Links

- **Live Demo**: [trumaninthevirtual.vercel.app](https://trumaninthevirtual.vercel.app)
- **GitHub Repository**: [Truman-in-the-Virtual](https://github.com/pranayakhadgi/Truman-in-the-Virtual)
- **Truman State University**: [www.truman.edu](https://www.truman.edu/)
- **Visit Truman**: [Visit Scheduling](https://www.truman.edu/admission-cost/visit-truman/?q=/visit&)
- **Apply Now**: [Application Portal](https://www.truman.edu/admission-cost/landing-pages/apply-source-mogo/)

## License

MIT License

---

**Last Updated:** January 2025  
**Version:** 2.0.0  
**Status:** Production Ready
