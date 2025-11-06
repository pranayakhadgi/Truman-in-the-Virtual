// UIComponents.js - All UI components for the skybox tour

// Controls Menu Component (Top Left)
function ControlsMenu({ isSpeaking, onToggleSpeech }) {
  return (
    <div className="absolute top-4 left-4 z-20">
      <div className="bg-purple-400 bg-opacity-80 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3 shadow-lg">
        {/* Search */}
        <button className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50">
          <i className="fas fa-search text-lg"></i>
        </button>
        {/* Audio - Text to Speech */}
        <button 
          onClick={onToggleSpeech}
          className={`text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50 ${isSpeaking ? 'bg-purple-500 bg-opacity-50' : ''}`}
          title={isSpeaking ? 'Stop audio' : 'Play scene description'}
        >
          <i className={`fas ${isSpeaking ? 'fa-volume-mute' : 'fa-volume-up'} text-lg`}></i>
        </button>
        {/* Subtitles */}
        <button className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50">
          <i className="fas fa-closed-captioning text-lg"></i>
        </button>
        {/* More (Three Dots) */}
        <button className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50">
          <i className="fas fa-ellipsis-v text-lg"></i>
        </button>
      </div>
    </div>
  );
}

// Action Buttons Component (Top Right)
function ActionButtons() {
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center space-x-3">
      <button 
        onClick={() => window.open('https://www.truman.edu/admission-cost/landing-pages/apply-source-mogo/', '_blank')}
        className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Learn More
      </button>
      <button 
        onClick={() => window.open('https://www.truman.edu/admission-cost/landing-pages/apply-source-mogo/', '_blank')}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Apply Now
      </button>
    </div>
  );
}

// Scene Label and Logo Component (Bottom Left)
function SceneLabelAndLogo({ currentSkybox, skyboxConfigs }) {
  return (
    <div className="absolute bottom-4 left-4 z-20">
      {/* Scene Label - Outside logo box */}
      <p className="text-white text-xl font-bold mb-3 text-left opacity-95 drop-shadow-lg" style={{fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: '0.5px'}}>
        {skyboxConfigs[currentSkybox]?.name}
      </p>
      {/* Logo Box */}
      <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white border-opacity-20">
        <div className="flex justify-center">
          <img src="/public/logo/logo.svg" alt="Truman State University" className="h-10 w-auto opacity-95" />
        </div>
      </div>
    </div>
  );
}

// Skybox Navigation Controls Component (Bottom Center)
function SkyboxNavigationControls({ currentSkybox, skyboxConfigs, onPrevious, onNext }) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-black bg-opacity-70 rounded-lg p-4 flex items-center space-x-4">
        {/* Previous Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            console.log('Previous button onClick triggered');
            onPrevious();
          }}
          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
        >
          <i className="fas fa-step-backward text-lg"></i>
        </button>
        
        {/* Current Skybox Info */}
        <div className="text-white text-center min-w-[120px]">
          <p className="text-xs text-gray-300">
            {currentSkybox + 1} of {skyboxConfigs.length}
          </p>
        </div>
        
        {/* Next Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            console.log('Next button onClick triggered');
            onNext();
          }}
          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
        >
          <i className="fas fa-step-forward text-lg"></i>
        </button>
      </div>
    </div>
  );
}

// View Map Button Component (Bottom Right)
function ViewMapButton() {
  return (
    <div className="absolute bottom-4 right-4 z-20">
      <button 
        onClick={(e) => {
          e.preventDefault();
          console.log('View Map button clicked');
          if (window.showMap) {
            window.showMap();
          } else {
            console.error('showMap function not available');
          }
        }}
        className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
      >
        <i className="fas fa-map-marked-alt"></i>
        <span>View Map</span>
      </button>
    </div>
  );
}

// Make all components available globally
window.ControlsMenu = ControlsMenu;
window.ActionButtons = ActionButtons;
window.SceneLabelAndLogo = SceneLabelAndLogo;
window.SkyboxNavigationControls = SkyboxNavigationControls;
window.ViewMapButton = ViewMapButton;

