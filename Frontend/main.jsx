/**
 * Vite Entry Point
 * 
 * This is the main entry point for Vite build system.
 * It imports React, ReactDOM, and all components, then renders the app.
 * 
 * This replaces the browser-based Babel transformation, significantly
 * improving load times by pre-compiling JSX at build time.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

// Import configuration files
import './config.js';
import './BuildingData.js';
import './MapView.js';

// Import skybox components
import { skyboxConfigs, sceneScripts, SKYBOX_RADIUS, ANNOTATION_OFFSET } from './components/skybox/constants.js';
import SkyboxScene from './components/skybox/SkyboxScene.jsx';
import { 
  ControlsMenu, 
  ActionButtons, 
  SceneLabelAndLogo, 
  SkyboxNavigationControls, 
  ViewMapButton, 
  CaptionDisplay 
} from './components/skybox/UIComponents.jsx';

// Import main app
import App from './app.jsx';

// Make components available globally for backward compatibility
window.skyboxConfigs = skyboxConfigs;
window.sceneScripts = sceneScripts;
window.SKYBOX_RADIUS = SKYBOX_RADIUS;
window.ANNOTATION_OFFSET = ANNOTATION_OFFSET;
window.SkyboxScene = SkyboxScene;
window.ControlsMenu = ControlsMenu;
window.ActionButtons = ActionButtons;
window.SceneLabelAndLogo = SceneLabelAndLogo;
window.SkyboxNavigationControls = SkyboxNavigationControls;
window.ViewMapButton = ViewMapButton;
window.CaptionDisplay = CaptionDisplay;

// Render the app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(React.createElement(App));
  console.log('✅ React app rendered with Vite');
  
  // Remove transition overlay after render
  setTimeout(() => {
    const overlay = document.getElementById('transition-overlay');
    if (overlay) {
      overlay.style.pointerEvents = 'none';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 1000);
    }
  }, 500);
} else {
  console.error('❌ Root element not found!');
}

