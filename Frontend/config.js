// config.js - Google Maps Configuration

// Google Maps Configuration
const GOOGLE_MAPS_CONFIG = {
  // API Key - Replace with your actual key or use environment variable
  // For now, using a placeholder - you'll need to add your actual API key
  apiKey: 'AIzaSyBNg6CCs715j47H9UsyRx9hniIvEofzLOA', // This is from Ali's code - replace with your own
  
  // Truman State University Campus Center
  campusCenter: {
    lat: 40.1885,   
    lng: -92.5890   
  },
  
  // Default map settings
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 19,
  
  // Map style/type
  mapTypeId: 'roadmap'
};

// Make it available globally (for script tag usage)
window.GOOGLE_MAPS_CONFIG = GOOGLE_MAPS_CONFIG;

console.log('config.js loaded successfully');

