# Truman Virtual Tour

An immersive 3D virtual tour application for Truman State University that allows prospective students and visitors to explore the campus through an interactive browser-based 3D environment.

## Overview

This application provides a complete virtual campus experience with:
- Interactive 3D skybox environments using Three.js
- Personalized questionnaire flow to customize the tour
- Database integration for session tracking
- Google Maps integration for location visualization
- Text-to-speech narration for accessibility

## Project Structure

```
virtual/
├── api/
│   └── index.js              # Vercel serverless function entry point
├── Backend/
│   ├── config/
│   │   └── database.js      # MongoDB connection configuration
│   ├── models/
│   │   └── Session.js        # Session data model
│   ├── routes/
│   │   └── sessionRoutes.js  # API route handlers
│   └── server.js             # Express server
├── Frontend/
│   ├── components/
│   │   ├── skybox/           # 3D scene components
│   │   ├── welcome-flow/     # Questionnaire components
│   │   └── shared/           # Shared React components
│   ├── config/               # Configuration files
│   ├── services/
│   │   └── api.js            # API service layer
│   ├── app.js                # Main React application
│   ├── index.html            # 3D tour page
│   ├── queries.html          # Questionnaire page
│   └── welcome.html          # Landing page
└── public/                   # Static assets (images, logos, skyboxes)
```

## Application Flow

1. Welcome Page (`/`) - Landing page with campus slideshow
2. Questionnaire (`/queries`) - Multi-step form to collect user preferences
3. 3D Tour (`/tour`) - Interactive skybox environment with navigation

## Technologies

- Frontend: React, Three.js, TailwindCSS, HTML5
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Deployment: Vercel (serverless functions)
- Maps: Google Maps JavaScript API

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- Python 3 (for dev server)
- MongoDB Atlas account

### Setup

1. Install backend dependencies:
```bash
cd Backend
npm install
```

2. Create `.env` file in `Backend/` directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

3. Start servers (two terminals):

Terminal 1 - Backend:
```bash
cd Backend
npm start
```

Terminal 2 - Frontend:
```bash
cd Frontend
python3 dev-server.py
```

4. Access application:
- Frontend: http://localhost:8000
- Backend API: http://localhost:3000/api/health

## Deployment

### Vercel Deployment

1. Set up MongoDB Atlas:
   - Create free cluster
   - Add database user
   - Configure network access (allow 0.0.0.0/0)
   - Get connection string

2. Deploy to Vercel:
   - Connect GitHub repository
   - Add environment variables:
     - `MONGODB_URI`: MongoDB connection string
     - `NODE_ENV`: production
   - Deploy

3. Configuration:
   - `vercel.json` handles routing
   - `api/index.js` serves as serverless function
   - Frontend files served from `Frontend/` directory
   - Public assets from `public/` directory

### Environment Variables

Required for production:
- `MONGODB_URI`: MongoDB Atlas connection string
- `NODE_ENV`: Set to `production`

## API Endpoints

- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/responses` - Save question response
- `POST /api/sessions/:id/facilities` - Save facility selection
- `PATCH /api/sessions/:id/contact` - Update contact information
- `POST /api/sessions/:id/complete` - Mark session complete
- `GET /api/health` - Health check endpoint

## Database Schema

Session model includes:
- `sessionId`: Unique identifier
- `userType`: User classification
- `interest`: Area of interest
- `selectedFacilities`: Array of selected facilities
- `contactInfo`: Contact details
- `responses`: Question/answer pairs
- `status`: Session status

## Google Maps Setup

1. Enable Maps JavaScript API in Google Cloud Console
2. Create API key
3. Configure API key restrictions
4. Update `config.js` with API key (or use environment variable)

Location coordinates:
- Thousand Hills State Park: 40.34508954846465, -92.57451304955303
- Truman State University Quad: 40.18873778168771, -92.58083505450213

## Troubleshooting

### Database Connection Issues
- Verify `MONGODB_URI` in environment variables
- Check MongoDB Atlas network access settings
- Ensure IP whitelist includes 0.0.0.0/0 for Vercel

### Frontend Not Loading
- Check browser console for errors
- Verify all script files are loading
- Ensure backend server is running (for local development)

### API Errors
- Check Vercel function logs
- Verify environment variables are set
- Test API endpoints directly

## Team

Developers: Pranaya Khadgi Shahi, Ali Musterih Addikebir  
Professor: Dr. Kafi Rahman  
Institution: Truman State University, Computer Science Department

## License

MIT License
