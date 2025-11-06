# Truman Virtual Tour

An immersive 3D virtual tour application for Truman State University that allows prospective students and visitors to explore the campus from anywhere in the world through an interactive browser-based 3D environment.

## What Problem Does This Solve?

The Truman Virtual Tour addresses the challenge of providing accessible, engaging campus exploration for prospective students who cannot physically visit the campus. It offers:

- **Remote Campus Exploration**: Experience Truman's campus locations in 360° immersive environments
- **Interactive Learning**: Click on annotations to learn about key campus locations and features
- **Accessibility**: Text-to-speech narration and intuitive navigation for all users
- **Seamless Application Process**: Direct integration with Truman's application portal

## Features

- **Interactive 3D Skybox Environments**: Explore "Thousand Hills in Truman" and "The Quad" in full 360° views
- **Auto-Rotating Camera**: Smooth automatic rotation for hands-free exploration
- **Interactive Annotations**: Click on location markers to learn about campus features
- **Text-to-Speech Narration**: Female voice narration for each scene
- **Welcome Flow**: Multi-step form to collect visitor information and interests
- **Direct Application Link**: Quick access to Truman's application portal

## Screenshots

### Welcome Page
![Welcome Page](screenshots/welcome-page.png)
*Interactive welcome page with campus slideshow and tour initiation*

### Skybox Environment - The Quad
![The Quad](screenshots/skybox-quad.png)
*Immersive 3D environment showing Truman's iconic Quad with interactive annotations*

### Application Redirect
![Apply Now](screenshots/apply-redirect.png)
*Seamless redirect to Truman's online application portal*

## Quick Start

```bash
# Install dependencies
npm install

# Start backend server
npm start

# Access the application
# Open http://localhost:3000 in your browser
```

## Project Structure

```
truman-virtual-tour/
├── Backend/          # Express.js server and API
├── Frontend/         # React + Three.js application
├── public/           # Static assets (images, logos, skyboxes)
└── README.md         # This file
```

## Technologies

- **Frontend**: React, Three.js, TailwindCSS
- **Backend**: Node.js, Express.js, MongoDB
- **3D Rendering**: Three.js WebGL
- **Text-to-Speech**: Web Speech API

## Team

**Developers:**
- Pranaya Khadgi Shahi
- Ali Musterih Addikebir

**Professor:**
- Dr. Kafi Rahman (The Truman CS Department)

**Institution:**
- Truman State University
- Computer Science Department

## Links

- **Live Demo**: [trumaninthevirtual.vercel.app](https://trumaninthevirtual.vercel.app)
- **GitHub Repository**: [Truman-in-the-Virtual](https://github.com/pranayakhadgi/Truman-in-the-Virtual)
- **Truman State University**: [www.truman.edu](https://www.truman.edu/)

---

**Last Updated:** January 2025  
**Version:** 2.0.0  
**Status:** Production Ready
