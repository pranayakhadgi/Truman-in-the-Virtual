// Main App Component
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
    
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 3D Scene */}
      <SkyboxScene />
      
      {/* UI Components */}
      <ControlsMenu 
        isSpeaking={isSpeaking}
        onToggleSpeech={toggleSceneSpeech}
        showCaptions={showCaptions}
        onToggleCaptions={toggleCaptions}
      />
      <ActionButtons />
      <SceneLabelAndLogo 
        currentSkybox={currentSkybox}
        skyboxConfigs={skyboxConfigs}
      />
      <SkyboxNavigationControls
        currentSkybox={currentSkybox}
        skyboxConfigs={skyboxConfigs}
        onPrevious={handlePreviousSkybox}
        onNext={handleNextSkybox}
      />
      <ViewMapButton />
      <CaptionDisplay 
        show={showCaptions}
        text={currentCaptionText}
        isSpeaking={isSpeaking}
        currentWordIndex={currentWordIndex}
      />
    </div>
  );
  }
  
  // Render App
  const rootElement = document.getElementById("root");
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);

// Smooth fade-out of transition overlay once 3D scene is ready
const transitionOverlay = document.getElementById('transition-overlay');
if (transitionOverlay) {
  setTimeout(() => {
    transitionOverlay.style.opacity = '0';
    setTimeout(() => {
      transitionOverlay.remove();
    }, 1000);
  }, 2000);
}
