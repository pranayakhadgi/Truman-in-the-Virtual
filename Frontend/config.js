// config.js - Google Maps Configuration

// Google Maps Configuration
const GOOGLE_MAPS_CONFIG = {
  // API Key - matches the key in index.html
  apiKey: 'AIzaSyBoxO3KA_9_gIOE0j1gKhI16vhbAfi35qw',
  
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

