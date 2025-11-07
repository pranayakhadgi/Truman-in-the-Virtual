// MapView.js - Google Maps Integration for Truman Virtual Tour (Dialog Version)

let map = null;
let markers = [];
let mapDialog = null;
let geocoder = null;

// Location mappings for skybox scenes
const locationMappings = {
  0: { // Thousand Hills in Truman
    name: "Thousand Hills State Park",
    address: "Thousand Hills State Park, Kirksville, MO 63501, USA",
    lat: 40.19231378040324,  // Exact coordinates for Thousand Hills State Park
    lng: -92.64884155007502

    //40.34508954846465, -92.57451304955303 40.19231378040324, -92.64884155007502
  },
  1: { // The Quad
    name: "Truman State University Quad",
    address: "Truman State University, Kirksville, MO 63501",
    lat: 40.18873778168771,  // Exact coordinates for Truman State University Quad
    lng: -92.58083505450213
  }
};

// Handle map errors (API not activated, invalid key, etc.)
function handleMapError(error) {
  console.error('Google Maps Error:', error);
  
  const mapDiv = document.getElementById('map-dialog-map');
  if (!mapDiv) return;
  
  // Remove existing error display if present
  const existingError = mapDiv.querySelector('#mapErrorDisplay');
  if (existingError) {
    existingError.remove();
  }
  
  // Check for specific error types
  let errorMessage = 'Unable to load Google Maps.';
  let errorDetails = '';
  
  if (error && (error.name === 'ApiNotActivatedMapError' || error.message?.includes('ApiNotActivatedMapError') || error.message?.includes('api-not-activated'))) {
    errorMessage = 'Google Maps JavaScript API is not activated.';
    errorDetails = `
      <p style="margin: 10px 0; font-size: 14px;">
        To fix this issue:
      </p>
      <ol style="margin: 10px 0; padding-left: 20px; font-size: 14px; text-align: left;">
        <li>Go to <a href="https://console.cloud.google.com/apis/library" target="_blank" style="color: #667eea; text-decoration: underline;">Google Cloud Console</a></li>
        <li>Select your project (or create a new one)</li>
        <li>Search for "Maps JavaScript API"</li>
        <li>Click "Enable" to activate the API</li>
        <li>Wait a few minutes for the API to activate</li>
        <li>Refresh this page</li>
      </ol>
      <p style="margin: 10px 0; font-size: 12px; color: #666;">
        Note: Make sure your API key has the Maps JavaScript API enabled.
      </p>
    `;
  } else if (error && (error.name === 'InvalidKeyMapError' || error.message?.includes('key') || error.message?.includes('authentication'))) {
    errorMessage = 'Invalid Google Maps API Key.';
    errorDetails = `
      <p style="margin: 10px 0; font-size: 14px;">
        Please check your API key configuration in the code.
      </p>
    `;
  } else {
    errorDetails = `
      <p style="margin: 10px 0; font-size: 14px;">
        Error: ${error?.message || 'Unknown error'}
      </p>
    `;
  }
  
  // Create error display
  const errorDiv = document.createElement('div');
  errorDiv.id = 'mapErrorDisplay';
  errorDiv.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    max-width: 500px;
    text-align: center;
    z-index: 1001;
  `;
  errorDiv.innerHTML = `
    <div style="color: #ef4444; font-size: 48px; margin-bottom: 15px;">⚠️</div>
    <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">${errorMessage}</h2>
    <div style="color: #4b5563;">
      ${errorDetails}
    </div>
    <button onclick="document.getElementById('mapErrorDisplay').remove(); window.hideMapDialog();" 
            style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
      Close
    </button>
  `;
  
  mapDiv.appendChild(errorDiv);
}

// Global error handler for Google Maps API
window.gm_authFailure = function() {
  console.error('Google Maps authentication failed');
  handleMapError({ name: 'InvalidKeyMapError', message: 'API key authentication failed' });
};

// Geocode address to get exact coordinates
function geocodeAddress(address, callback) {
  if (!geocoder) {
    geocoder = new google.maps.Geocoder();
  }
  
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const location = results[0].geometry.location;
      callback({
        lat: location.lat(),
        lng: location.lng()
      });
    } else {
      console.warn('Geocoding failed for:', address, status);
      // Use fallback coordinates
      callback(null);
    }
  });
}

// Initialize map in dialog
function initMapDialog(skyboxIndex) {
  console.log('Initializing map dialog for skybox index:', skyboxIndex);
  
  // Check if Google Maps API is loaded
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    console.error('Google Maps API not loaded yet. Please wait...');
    setTimeout(() => {
      if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
        initMapDialog(skyboxIndex);
      } else {
        console.error('Google Maps API failed to load');
        handleMapError({ message: 'Google Maps API failed to load' });
      }
    }, 500);
    return;
  }
  
  // Get location for current skybox
  const location = locationMappings[skyboxIndex] || locationMappings[0];
  
  // Get map container
  const mapContainer = document.getElementById('map-dialog-map');
  if (!mapContainer) {
    console.error('Map container not found!');
    return;
  }
  
  try {
    // Geocode the address to get exact coordinates
    geocodeAddress(location.address, (coords) => {
      const center = coords || { lat: location.lat, lng: location.lng };
      
      // Create the map
      map = new google.maps.Map(mapContainer, {
        center: center,
        zoom: 15,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      });
      
      // Listen for successful map load
      let mapLoaded = false;
      google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
        mapLoaded = true;
        console.log('Map created successfully');
      });
      
      // Check for API errors after a delay
      setTimeout(() => {
        if (!mapLoaded) {
          handleMapError({ name: 'ApiNotActivatedMapError', message: 'Maps JavaScript API not activated. Please enable it in Google Cloud Console.' });
        }
      }, 3000);
      
      // Add marker for the location
      addLocationMarker(location, center);
    });
  } catch (error) {
    console.error('Error creating map:', error);
    handleMapError(error);
  }
}

// Add marker for location
function addLocationMarker(location, coords) {
  // Clear existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  
  // Create marker
  const marker = new google.maps.Marker({
    position: coords,
    map: map,
    title: location.name,
    animation: google.maps.Animation.DROP
  });
  
  // Add info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="color: #000; padding: 5px; min-width: 200px;">
        <h3 style="margin: 0 0 5px 0; font-weight: bold; color: #667eea;">${location.name}</h3>
        <p style="margin: 0; font-size: 12px; color: #666;">${location.address}</p>
      </div>
    `
  });
  
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
  
  // Open info window by default
  infoWindow.open(map, marker);
  
  markers.push(marker);
  
  console.log(`Added marker for ${location.name}`);
}

// Show map dialog
function showMapDialog(skyboxIndex = 0) {
  console.log('Showing map dialog for skybox:', skyboxIndex);
  
  // Get or create dialog container
  let container = document.getElementById('map-dialog-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'map-dialog-container';
    document.body.appendChild(container);
  }
  
  // Create dialog HTML
  container.innerHTML = `
    <div id="map-dialog" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 450px;
      height: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideInUp 0.3s ease-out;
    ">
      <div style="
        padding: 15px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">
          <i class="fas fa-map-marked-alt" style="margin-right: 8px;"></i>
          Location Map
        </h3>
        <button id="map-dialog-close" onclick="window.hideMapDialog()" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          ×
        </button>
      </div>
      <div id="map-dialog-map" style="
        flex: 1;
        width: 100%;
        height: 100%;
        min-height: 0;
      "></div>
    </div>
  `;
  
  container.style.display = 'block';
  
  // Initialize map after a short delay to ensure container is rendered
  setTimeout(() => {
    initMapDialog(skyboxIndex);
  }, 100);
}

// Hide map dialog
function hideMapDialog() {
  console.log('Hiding map dialog');
  
  const container = document.getElementById('map-dialog-container');
  if (container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }
  
  // Clear map and markers
  if (map) {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  }
  map = null;
}

// Add CSS animation
if (!document.getElementById('map-dialog-styles')) {
  const style = document.createElement('style');
  style.id = 'map-dialog-styles';
  style.textContent = `
    @keyframes slideInUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

// Make functions available globally
window.showMapDialog = showMapDialog;
window.hideMapDialog = hideMapDialog;
window.initMapDialog = initMapDialog;

// Also expose function to update current skybox index
window.updateCurrentSkyboxIndex = function(index) {
  window.currentSkyboxIndex = index;
};

console.log('MapView.js loaded successfully (Dialog Version)');
