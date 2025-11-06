// MapView.js - Google Maps Integration for Truman Virtual Tour

let map = null;
let markers = [];

// Initialize and show the map
function initMap() {
  console.log('Initializing Google Map...');
  
  // Check if Google Maps API is loaded
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    console.error('Google Maps API not loaded yet. Please wait...');
    // Retry after a short delay
    setTimeout(() => {
      if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
        initMap();
      } else {
        console.error('Google Maps API failed to load');
      }
    }, 500);
    return;
  }
  
  // Get config and building data
  const config = window.GOOGLE_MAPS_CONFIG;
  const buildings = window.buildingsData;
  
  if (!config) {
    console.error('Config not found! Make sure config.js is loaded.');
    return;
  }
  
  if (!buildings) {
    console.error('Building data not found! Make sure BuildingData.js is loaded.');
    return;
  }
  
  // Create the map
  const mapContainer = document.getElementById('map');
  
  if (!mapContainer) {
    console.error('Map container not found!');
    return;
  }
  
  try {
    map = new google.maps.Map(mapContainer, {
      center: config.campusCenter,
      zoom: config.defaultZoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      mapTypeId: config.mapTypeId,
      styles: config.mapStyles || [] // Use custom styles if provided
    });
    
    console.log('Map created successfully');
    
    // Add markers for each building
    addBuildingMarkers(buildings);
  } catch (error) {
    console.error('Error creating map:', error);
  }
}

// Add markers for all buildings
function addBuildingMarkers(buildings) {
  console.log('Adding building markers...', buildings);
  
  // Clear existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  
  if (!Array.isArray(buildings)) {
    console.error('Buildings data is not an array:', buildings);
    return;
  }
  
  buildings.forEach(building => {
    // Create marker
    const marker = new google.maps.Marker({
      position: { lat: building.lat, lng: building.lng },
      map: map,
      title: building.name,
      animation: google.maps.Animation.DROP
    });
    
    // Add click listener
    marker.addListener('click', () => {
      handleMarkerClick(building);
    });
    
    // Optional: Add info window on hover
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="color: #000; padding: 5px;">
          <h3 style="margin: 0 0 5px 0; font-weight: bold;">${building.name}</h3>
          <p style="margin: 0; font-size: 12px;">${building.description || 'Click to view 3D tour'}</p>
        </div>
      `
    });
    
    marker.addListener('mouseover', () => {
      infoWindow.open(map, marker);
    });
    
    marker.addListener('mouseout', () => {
      infoWindow.close();
    });
    
    markers.push(marker);
  });
  
  console.log(`Added ${markers.length} markers to map`);
}

// Handle when a building marker is clicked
function handleMarkerClick(building) {
  console.log('Building marker clicked:', building);
  
  // Hide the map
  hideMap();
  
  // Load the building's skybox
  if (window.transitionToSkybox && building.skyboxIndex !== undefined) {
    console.log(`Transitioning to skybox index: ${building.skyboxIndex}`);
    window.transitionToSkybox(building.skyboxIndex);
  } else {
    console.error('transitionToSkybox function not found or skyboxIndex missing');
  }
}

// Show the map (called by "View Map" button)
function showMap() {
  console.log('Showing map...');
  
  // Hide 3D scene
  const rootDiv = document.getElementById('root');
  if (rootDiv) {
    rootDiv.style.display = 'none';
  }
  
  // Show map container
  const mapDiv = document.getElementById('map');
  if (mapDiv) {
    mapDiv.style.display = 'block';
  }
  
  // Initialize map if not already created
  if (!map) {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      console.log('Waiting for Google Maps API to load...');
      // Wait for Google Maps API to load
      const checkGoogleMaps = setInterval(() => {
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
          clearInterval(checkGoogleMaps);
          setTimeout(() => {
            initMap();
          }, 100);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
          console.error('Google Maps API failed to load after 10 seconds');
          alert('Failed to load Google Maps. Please refresh the page.');
        }
      }, 10000);
    } else {
      // Google Maps is ready, initialize map
      setTimeout(() => {
        initMap();
      }, 100);
    }
  } else {
    // Map already exists, just ensure it's visible and resized
    if (map) {
      setTimeout(() => {
        google.maps.event.trigger(map, 'resize');
      }, 100);
    }
  }
  
  // Add a "Back to Tour" button on the map
  addBackToTourButton();
}

// Hide the map and return to 3D tour
function hideMap() {
  console.log('Hiding map...');
  
  // Hide map container
  const mapDiv = document.getElementById('map');
  if (mapDiv) {
    mapDiv.style.display = 'none';
  }
  
  // Show 3D scene
  const rootDiv = document.getElementById('root');
  if (rootDiv) {
    rootDiv.style.display = 'block';
  }
  
  // Remove back button if it exists
  const backBtn = document.getElementById('mapBackButton');
  if (backBtn) {
    backBtn.remove();
  }
}

// Add a "Back to Tour" button overlay on the map
function addBackToTourButton() {
  // Remove existing button if present
  const existingBtn = document.getElementById('mapBackButton');
  if (existingBtn) {
    existingBtn.remove();
  }
  
  // Create back button
  const backButton = document.createElement('div');
  backButton.id = 'mapBackButton';
  backButton.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1000;
    background: #7C3AED;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    transition: all 0.3s;
  `;
  backButton.innerHTML = '<i class="fas fa-arrow-left" style="margin-right: 8px;"></i>Back to 3D Tour';
  
  // Add hover effect
  backButton.onmouseover = () => {
    backButton.style.background = '#6D28D9';
    backButton.style.transform = 'scale(1.05)';
  };
  backButton.onmouseout = () => {
    backButton.style.background = '#7C3AED';
    backButton.style.transform = 'scale(1)';
  };
  
  // Add click handler
  backButton.onclick = hideMap;
  
  // Add to map container
  const mapDiv = document.getElementById('map');
  if (mapDiv) {
    mapDiv.appendChild(backButton);
  }
}

// Make functions available globally
window.showMap = showMap;
window.hideMap = hideMap;
window.initMap = initMap;

console.log('MapView.js loaded successfully');

