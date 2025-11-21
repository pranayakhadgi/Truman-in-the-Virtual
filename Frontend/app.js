/**
 * Main React Application Component
 * 
 * This is the root component of the 3D virtual tour application.
 * It manages the overall application state including:
 * - Current skybox scene index
 * - Text-to-speech narration state
 * - Caption display state
 * - Scene transitions
 * 
 * The component renders the 3D skybox scene along with all UI controls
 * (navigation buttons, audio controls, map button, etc.).
 * 
 * Component dependencies are loaded from window object (loaded via script tags)
 * to support the Babel-in-browser transpilation setup.
 */
function App() {
  const [currentSkybox, setCurrentSkybox] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [speechSynthesis, setSpeechSynthesis] = React.useState(null);
  const [showCaptions, setShowCaptions] = React.useState(false);
  const [currentCaptionText, setCurrentCaptionText] = React.useState('');
  const [currentWordIndex, setCurrentWordIndex] = React.useState(-1);
  
  // Get skybox configs
  const skyboxConfigs = window.skyboxConfigs || [
    { name: "Thousand Hills in Truman" },
    { name: "The Quad" }
  ];
  
  // Get component references from window (needed for JSX)
  const SkyboxScene = window.SkyboxScene;
  const ControlsMenu = window.ControlsMenu;
  const ActionButtons = window.ActionButtons;
  const SceneLabelAndLogo = window.SceneLabelAndLogo;
  const SkyboxNavigationControls = window.SkyboxNavigationControls;
  const ViewMapButton = window.ViewMapButton;
  const CaptionDisplay = window.CaptionDisplay;
  
  // Validate components are available
  if (!SkyboxScene || !ControlsMenu || !ActionButtons || !SceneLabelAndLogo || 
      !SkyboxNavigationControls || !ViewMapButton || !CaptionDisplay) {
    console.error('❌ Missing components:', {
      SkyboxScene: !!SkyboxScene,
      ControlsMenu: !!ControlsMenu,
      ActionButtons: !!ActionButtons,
      SceneLabelAndLogo: !!SceneLabelAndLogo,
      SkyboxNavigationControls: !!SkyboxNavigationControls,
      ViewMapButton: !!ViewMapButton,
      CaptionDisplay: !!CaptionDisplay
    });
    return React.createElement('div', { 
      style: { padding: '20px', color: 'white', textAlign: 'center' } 
    }, 'Loading components...');
  }
  
  // Initialize text-to-speech
    React.useEffect(() => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);
      
      const loadVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
          console.log('Voices loaded:', voices.length);
        }
      };
      
      loadVoices();
      synth.onvoiceschanged = loadVoices;
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  }, []);
  
  // Get female voice
  const getFemaleVoice = () => {
    if (!speechSynthesis) return null;
    
    const voices = speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      console.warn('No voices available yet');
      return null;
    }
    
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('susan') ||
      (voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('female')) ||
      (voice.name.toLowerCase().includes('microsoft') && voice.name.toLowerCase().includes('female'))
    );
    
    if (!femaleVoice) {
      const nonMaleVoice = voices.find(voice => 
        !voice.name.toLowerCase().includes('male') &&
        !voice.name.toLowerCase().includes('man') &&
        !voice.name.toLowerCase().includes('david') &&
        !voice.name.toLowerCase().includes('mark') &&
        !voice.name.toLowerCase().includes('alex')
      );
      return nonMaleVoice || voices[0];
    }
    
    return femaleVoice;
  };
  
  // Text-to-speech function with female voice
  const speakText = (text, onEnd) => {
    if (!speechSynthesis) {
      console.warn('Speech synthesis not available');
      return;
    }
    
    speechSynthesis.cancel();
    
    // Always set caption text (component will handle visibility)
    setCurrentCaptionText(text);
    setCurrentWordIndex(-1); // Reset word index
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    
    const femaleVoice = getFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Split text into words for tracking (simple word boundary approach)
    const allWords = text.split(/\s+/).filter(w => w.length > 0);
    let wordCharPositions = [];
    let charPos = 0;
    
    // Build character position map for each word
    text.split(/(\s+)/).forEach(segment => {
      if (segment.trim().length > 0) {
        wordCharPositions.push({
          start: charPos,
          end: charPos + segment.length,
          word: segment.trim()
        });
      }
      charPos += segment.length;
    });
    
    // Track word boundaries for highlighting
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        // Find which word contains this character index
        const charIndex = event.charIndex;
        
        for (let i = 0; i < wordCharPositions.length; i++) {
          const wordPos = wordCharPositions[i];
          if (charIndex >= wordPos.start && charIndex < wordPos.end) {
            setCurrentWordIndex(i);
            break;
          }
        }
      }
    };
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentWordIndex(0); // Start at first word
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      // Clear caption text after a short delay
      setTimeout(() => {
        setCurrentCaptionText('');
        setCurrentWordIndex(-1);
      }, 500);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setCurrentCaptionText('');
      setCurrentWordIndex(-1);
    };
    
    speechSynthesis.speak(utterance);
  };
  
  // Scene-specific scripts
  const sceneScripts = window.sceneScripts || {
    "Thousand Hills in Truman": "Just a short drive west of Kirksville lies the stunning Thousand Hills State Park, a true natural treasure spanning over 3,000 acres with the centerpiece Forest Lake. Created in the early 1950s to supply water for the city, Forest Lake is surrounded by lush woods, savanna landscapes, and a network of hiking and mountain biking trails perfect for outdoor enthusiasts of all levels. The park offers a rich variety of recreational activities including fishing, boating, camping, and wildlife watching, making it a favorite escape for nature lovers and families alike.",
    "The Quad": "Welcome to Truman State University's iconic Quad, the vibrant heart of campus life. Once a shimmering lake, this space was transformed in 1924 after a fire at Baldwin Hall drained the water and filled the area with rubble, creating the peaceful grassy oasis you see today. Students flock here in sunny weather to play frisbee, take relaxing hammock naps, and enjoy spontaneous events ranging from barbecues and student radio promotions to lively snowball fights during Missouri winters. The Quad is more than just a green space—it's a communal hub where friendships form, creativity flourishes, and campus spirit thrives amidst the historic buildings that surround it."
  };
  
  // Toggle speech for current scene
  const toggleSceneSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentCaptionText('');
      setCurrentWordIndex(-1);
    } else {
      const sceneName = skyboxConfigs[currentSkybox]?.name || 'Current scene';
      const script = sceneScripts[sceneName] || `Welcome to ${sceneName}.`;
      speakText(script);
    }
  };
  
  // Toggle captions
  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
    // If turning off captions, clear current text
    if (showCaptions) {
      setCurrentCaptionText('');
    } else if (isSpeaking) {
      // If turning on captions while speaking, show current script
      const sceneName = skyboxConfigs[currentSkybox]?.name || 'Current scene';
      const script = sceneScripts[sceneName] || `Welcome to ${sceneName}.`;
      setCurrentCaptionText(script);
    }
  };
  
  // Update current skybox index for map dialog
  React.useEffect(() => {
    if (window.updateCurrentSkyboxIndex) {
      window.updateCurrentSkyboxIndex(currentSkybox);
    }
  }, [currentSkybox]);
  
  // Navigation handlers
    const handlePreviousSkybox = () => {
      console.log('Previous button clicked!', { isTransitioning, currentSkybox });
      const prevIndex = currentSkybox > 0 ? currentSkybox - 1 : skyboxConfigs.length - 1;
      console.log(`Previous button clicked: ${currentSkybox} -> ${prevIndex}`);
      
      setCurrentSkybox(prevIndex);
      setIsTransitioning(true);
      
    // Update skybox index for map
    if (window.updateCurrentSkyboxIndex) {
      window.updateCurrentSkyboxIndex(prevIndex);
    }
    
      if (window.transitionToSkybox) {
        window.transitionToSkybox(prevIndex);
      } else {
        console.error('transitionToSkybox function not available');
        setIsTransitioning(false);
      }
    };
    
    const handleNextSkybox = () => {
      console.log('Next button clicked!', { isTransitioning, currentSkybox });
      const nextIndex = currentSkybox < skyboxConfigs.length - 1 ? currentSkybox + 1 : 0;
      console.log(`Next button clicked: ${currentSkybox} -> ${nextIndex}`);
      
      setCurrentSkybox(nextIndex);
      setIsTransitioning(true);
      
    // Update skybox index for map
    if (window.updateCurrentSkyboxIndex) {
      window.updateCurrentSkyboxIndex(nextIndex);
    }
    
      if (window.transitionToSkybox) {
        window.transitionToSkybox(nextIndex);
      } else {
        console.error('transitionToSkybox function not available');
        setIsTransitioning(false);
      }
    };
    
  // Use JSX with local component references (should work now that we have local vars)
  return (
    <div 
      className="relative h-full w-full overflow-hidden" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'stretch', 
        justifyContent: 'flex-start',
        pointerEvents: 'auto' // Enable pointer events for the container
      }}
    >
      {/* 3D Scene Container with Flexbox */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        pointerEvents: 'auto', // Scene needs pointer events for camera controls
        zIndex: 10,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        {SkyboxScene && <SkyboxScene />}
      </div>
      
      {/* UI Components - Using absolute positioning but with flexbox for internal layouts */}
      {/* These are positioned absolutely, so they overlay the scene */}
      {ControlsMenu && <ControlsMenu 
        isSpeaking={isSpeaking}
        onToggleSpeech={toggleSceneSpeech}
        showCaptions={showCaptions}
        onToggleCaptions={toggleCaptions}
      />}
      {ActionButtons && <ActionButtons />}
      {SceneLabelAndLogo && <SceneLabelAndLogo 
        currentSkybox={currentSkybox}
        skyboxConfigs={skyboxConfigs}
      />}
      {SkyboxNavigationControls && <SkyboxNavigationControls
        currentSkybox={currentSkybox}
        skyboxConfigs={skyboxConfigs}
        onPrevious={handlePreviousSkybox}
        onNext={handleNextSkybox}
      />}
      {ViewMapButton && <ViewMapButton />}
      {CaptionDisplay && <CaptionDisplay 
        show={showCaptions}
        text={currentCaptionText}
        isSpeaking={isSpeaking}
        currentWordIndex={currentWordIndex}
      />}
    </div>
  );
  }
  
  // Wait for all components to be available before rendering
  function waitForComponents(maxAttempts = 50) {
    let attempts = 0;
    
    const checkAndRender = () => {
      attempts++;
      const missing = [];
      
      if (!window.SkyboxScene) missing.push('SkyboxScene');
      if (!window.ControlsMenu) missing.push('ControlsMenu');
      if (!window.ActionButtons) missing.push('ActionButtons');
      if (!window.SceneLabelAndLogo) missing.push('SceneLabelAndLogo');
      if (!window.SkyboxNavigationControls) missing.push('SkyboxNavigationControls');
      if (!window.ViewMapButton) missing.push('ViewMapButton');
      if (!window.CaptionDisplay) missing.push('CaptionDisplay');
      
      if (missing.length === 0) {
        console.log('✅ All React components loaded, rendering app...');
        const rootElement = document.getElementById("root");
        if (rootElement) {
          try {
            const root = ReactDOM.createRoot(rootElement);
            // Use React.createElement to ensure components are properly referenced
            root.render(React.createElement(App));
            console.log('✅ React app rendered successfully');
            
            // Remove transition overlay immediately to allow interactions
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
              // Immediately disable pointer events
              overlay.style.pointerEvents = 'none';
              overlay.style.zIndex = '-1'; // Move behind everything
              overlay.style.opacity = '0';
              // Remove from DOM quickly
              setTimeout(() => {
                overlay.remove();
                console.log('✅ Transition overlay removed - interactions enabled');
              }, 500);
            }
            
            // Also ensure root container has proper pointer events
            const rootElement = document.getElementById('root');
            if (rootElement) {
              rootElement.style.pointerEvents = 'auto';
              rootElement.style.zIndex = '1';
            }
            
            // Verify render worked
            setTimeout(() => {
              if (rootElement.children.length === 0) {
                console.error('❌ React app rendered but root is empty!');
              } else {
                console.log('✅ React app content verified in DOM');
              }
            }, 500);
          } catch (error) {
            console.error('❌ Error rendering React app:', error);
            console.error('Error stack:', error.stack);
            
            // Show error to user
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; z-index: 10001; max-width: 600px; text-align: center;';
            errorDiv.innerHTML = '<h2>⚠️ Rendering Error</h2><p>' + error.message + '</p><p><small>Check console for details</small></p>';
            document.body.appendChild(errorDiv);
          }
        } else {
          console.error('❌ Root element not found!');
        }
      } else if (attempts < maxAttempts) {
        if (attempts % 10 === 0) {
          console.log('⏳ Still waiting for components:', missing.join(', '));
        }
        setTimeout(checkAndRender, 100);
      } else {
        console.error('❌ Timeout waiting for components:', missing.join(', '));
        console.error('Available components:', {
          SkyboxScene: !!window.SkyboxScene,
          ControlsMenu: !!window.ControlsMenu,
          ActionButtons: !!window.ActionButtons,
          SceneLabelAndLogo: !!window.SceneLabelAndLogo,
          SkyboxNavigationControls: !!window.SkyboxNavigationControls,
          ViewMapButton: !!window.ViewMapButton,
          CaptionDisplay: !!window.CaptionDisplay
        });
      }
    };
    
    // Start checking
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkAndRender);
    } else {
      // Give Babel a moment to transpile
      setTimeout(checkAndRender, 200);
    }
  }
  
  // Start waiting for components
  waitForComponents();

// Smooth fade-out of transition overlay once 3D scene is ready
// This ensures the overlay doesn't block UI interactions
function removeTransitionOverlay() {
  const transitionOverlay = document.getElementById('transition-overlay');
  if (transitionOverlay) {
    console.log('Removing transition overlay...');
    // First, disable pointer events so it stops blocking
    transitionOverlay.style.pointerEvents = 'none';
    // Then fade out
    transitionOverlay.style.opacity = '0';
    // Finally remove from DOM after fade completes
    setTimeout(() => {
      transitionOverlay.remove();
      console.log('Transition overlay removed');
    }, 1000);
  }
}

// Remove overlay after a short delay to ensure scene is loaded
setTimeout(removeTransitionOverlay, 2000);

// Also remove overlay when React app is confirmed rendered
window.addEventListener('load', function() {
  setTimeout(removeTransitionOverlay, 1500);
});
