// UIComponents.js - All UI components for the skybox tour

// Controls Menu Component (Top Left)
function ControlsMenu({ isSpeaking, onToggleSpeech, showCaptions, onToggleCaptions }) {
  const handleToggleSpeech = () => {
    console.log('✅ Audio button clicked, isSpeaking:', isSpeaking);
    if (onToggleSpeech) {
      onToggleSpeech();
    } else {
      console.warn('onToggleSpeech handler not provided');
    }
  };
  
  const handleToggleCaptions = () => {
    console.log('✅ Captions button clicked, showCaptions:', showCaptions);
    if (onToggleCaptions) {
      onToggleCaptions();
    } else {
      console.warn('onToggleCaptions handler not provided');
    }
  };
  
  return (
    <div className="absolute top-4 left-4 z-20" style={{ pointerEvents: 'auto' }}>
      <div className="bg-purple-400 bg-opacity-80 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3 shadow-lg" style={{ pointerEvents: 'auto' }}>
        {/* Search */}
        <button 
          className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
          onClick={() => console.log('Search button clicked')}
        >
          <i className="fas fa-search text-lg"></i>
        </button>
        {/* Audio - Text to Speech */}
        <button 
          onClick={handleToggleSpeech}
          className={`text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50 cursor-pointer ${isSpeaking ? 'bg-purple-500 bg-opacity-50' : ''}`}
          title={isSpeaking ? 'Stop audio' : 'Play scene description'}
          style={{ pointerEvents: 'auto' }}
        >
          <i className={`fas ${isSpeaking ? 'fa-volume-mute' : 'fa-volume-up'} text-lg`}></i>
        </button>
        {/* Subtitles/Captions */}
        <button 
          onClick={handleToggleCaptions}
          className={`text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50 cursor-pointer ${showCaptions ? 'bg-purple-500 bg-opacity-50' : ''}`}
          title={showCaptions ? 'Hide captions' : 'Show captions'}
          style={{ pointerEvents: 'auto' }}
        >
          <i className="fas fa-closed-captioning text-lg"></i>
        </button>
        {/* More (Three Dots) */}
        <button 
          className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
          onClick={() => console.log('More button clicked')}
        >
          <i className="fas fa-ellipsis-v text-lg"></i>
        </button>
      </div>
    </div>
  );
}

// Action Buttons Component (Top Right)
function ActionButtons() {
  const handleVisitClick = () => {
    console.log('✅ Visit Truman button clicked');
    window.open('https://www.truman.edu/admission-cost/visit-truman/?q=/visit&', '_blank');
  };
  
  const handleApplyClick = () => {
    console.log('✅ Apply Now button clicked');
    window.open('https://www.truman.edu/admission-cost/landing-pages/apply-source-mogo/', '_blank');
  };
  
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center space-x-3" style={{ pointerEvents: 'auto' }}>
      <button 
        onClick={handleVisitClick}
        onMouseDown={() => console.log('Visit button mousedown')}
        className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
        style={{ pointerEvents: 'auto', zIndex: 1000 }}
      >
        Visit Truman
      </button>
      <button 
        onClick={handleApplyClick}
        onMouseDown={() => console.log('Apply button mousedown')}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
        style={{ pointerEvents: 'auto', zIndex: 1000 }}
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
  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✅ Previous button clicked');
    if (onPrevious) {
      onPrevious();
    } else {
      console.warn('onPrevious handler not provided');
    }
  };
  
  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✅ Next button clicked');
    if (onNext) {
      onNext();
    } else {
      console.warn('onNext handler not provided');
    }
  };
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20" style={{ pointerEvents: 'auto' }}>
      <div className="bg-black bg-opacity-70 rounded-lg p-4 flex items-center space-x-4" style={{ pointerEvents: 'auto' }}>
        {/* Previous Button */}
        <button 
          onClick={handlePrevious}
          onMouseDown={() => console.log('Previous button mousedown')}
          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
          style={{ pointerEvents: 'auto', zIndex: 1000 }}
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
          onClick={handleNext}
          onMouseDown={() => console.log('Next button mousedown')}
          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
          style={{ pointerEvents: 'auto', zIndex: 1000 }}
        >
          <i className="fas fa-step-forward text-lg"></i>
        </button>
      </div>
    </div>
  );
}

// View Map Button Component (Bottom Right)
function ViewMapButton() {
  const [isMapOpen, setIsMapOpen] = React.useState(false);
  
  // Get current skybox index from app state or window
  const getCurrentSkyboxIndex = () => {
    // Try to get from window if available
    if (window.currentSkyboxIndex !== undefined) {
      return window.currentSkyboxIndex;
    }
    return 0; // Default to first skybox
  };
  
  const handleToggleMap = () => {
    const newState = !isMapOpen;
    setIsMapOpen(newState);
    
    if (newState) {
      // Open map dialog
      if (window.showMapDialog) {
        window.showMapDialog(getCurrentSkyboxIndex());
      } else {
        console.error('showMapDialog function not available');
      }
    } else {
      // Close map dialog
      if (window.hideMapDialog) {
        window.hideMapDialog();
      }
    }
  };
  
  const handleMapClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✅ View Map button clicked');
    handleToggleMap();
  };
  
  return (
    <>
      <div className="absolute bottom-4 right-4 z-20" style={{ pointerEvents: 'auto' }}>
        <button 
          onClick={handleMapClick}
          onMouseDown={() => console.log('View Map button mousedown')}
          className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 cursor-pointer"
          style={{ pointerEvents: 'auto', zIndex: 1000 }}
        >
          <i className="fas fa-map-marked-alt"></i>
          <span>View Map</span>
        </button>
      </div>
      
      {/* Map Dialog Container - will be populated by MapView.js */}
      <div id="map-dialog-container" style={{ display: 'none' }}></div>
    </>
  );
}

// Caption Display Component (Below caption button, top-left)
function CaptionDisplay({ show, text, isSpeaking, currentWordIndex }) {
  const textContainerRef = React.useRef(null);
  const wordRefs = React.useRef({});
  
  // Split text into words for highlighting
  const words = React.useMemo(() => {
    if (!text) return [];
    // Split by spaces but keep the spaces
    return text.split(/(\s+)/);
  }, [text]);
  
  // Filter out empty strings and get actual word indices
  const actualWords = React.useMemo(() => {
    return words.map((word, index) => ({
      word,
      index,
      isWord: word.trim().length > 0
    })).filter(item => item.isWord);
  }, [words]);
  
  // Scroll to highlighted word
  React.useEffect(() => {
    if (currentWordIndex >= 0 && currentWordIndex < actualWords.length && textContainerRef.current) {
      const wordElement = wordRefs.current[currentWordIndex];
      if (wordElement) {
        // Scroll the word into view smoothly
        wordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentWordIndex, actualWords.length]);
  
  if (!show || !text) {
    return null;
  }
  
  return (
    <div className="absolute top-20 left-4 z-20 w-96 max-w-[calc(100vw-2rem)] max-h-[60vh]">
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 bg-opacity-95 backdrop-blur-md rounded-xl p-5 shadow-2xl border-2 border-purple-300 border-opacity-60 transform transition-all duration-300 hover:shadow-purple-500/50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-1.5">
              <i className="fas fa-closed-captioning text-purple-100 text-sm"></i>
            </div>
            <span className="text-purple-50 text-xs font-bold uppercase tracking-wider" style={{fontFamily: "'Courier New', monospace", letterSpacing: '0.1em'}}>
              Captions
            </span>
          </div>
          {isSpeaking && (
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          )}
        </div>
        
        {/* Caption Text with Word Highlighting */}
        <div 
          ref={textContainerRef}
          className="bg-black bg-opacity-20 rounded-lg p-4 border border-purple-200 border-opacity-20 overflow-y-auto flex-1"
          style={{ maxHeight: '50vh' }}
        >
          <p 
            className="text-white text-sm leading-relaxed" 
            style={{
              fontFamily: "'Courier New', 'Monaco', 'Consolas', 'Lucida Console', monospace",
              lineHeight: '1.8',
              wordSpacing: '0.05em'
            }}
          >
            {words.map((word, wordArrayIndex) => {
              // Find if this word is in the actualWords array
              const actualWordIndex = actualWords.findIndex(aw => aw.index === wordArrayIndex);
              const isCurrentWord = actualWordIndex === currentWordIndex && isSpeaking;
              const isPastWord = actualWordIndex >= 0 && actualWordIndex < currentWordIndex;
              
              return (
                <span
                  key={wordArrayIndex}
                  ref={el => {
                    if (actualWordIndex >= 0) {
                      wordRefs.current[actualWordIndex] = el;
                    }
                  }}
                  className={`inline transition-all duration-200 ${
                    isCurrentWord 
                      ? 'bg-purple-300 bg-opacity-80 text-purple-900 font-semibold px-1 rounded shadow-md' 
                      : isPastWord
                      ? 'text-purple-200'
                      : 'text-white'
                  }`}
                  style={{
                    fontFamily: "'Courier New', 'Monaco', 'Consolas', 'Lucida Console', monospace"
                  }}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Make all components available globally - ensure they're set immediately
if (typeof window !== 'undefined') {
  window.ControlsMenu = ControlsMenu;
  window.ActionButtons = ActionButtons;
  window.SceneLabelAndLogo = SceneLabelAndLogo;
  window.SkyboxNavigationControls = SkyboxNavigationControls;
  window.ViewMapButton = ViewMapButton;
  window.CaptionDisplay = CaptionDisplay;
  console.log('✅ UI Components registered globally');
}

