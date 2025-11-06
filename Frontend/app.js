// Main App Component
function App() {
  const [currentSkybox, setCurrentSkybox] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [speechSynthesis, setSpeechSynthesis] = React.useState(null);
  
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
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    
    const femaleVoice = getFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
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
    } else {
      const sceneName = skyboxConfigs[currentSkybox]?.name || 'Current scene';
      const script = sceneScripts[sceneName] || `Welcome to ${sceneName}.`;
      speakText(script);
    }
  };
  
  // Navigation handlers
  const handlePreviousSkybox = () => {
    console.log('Previous button clicked!', { isTransitioning, currentSkybox });
    const prevIndex = currentSkybox > 0 ? currentSkybox - 1 : skyboxConfigs.length - 1;
    console.log(`Previous button clicked: ${currentSkybox} -> ${prevIndex}`);
    
    setCurrentSkybox(prevIndex);
    setIsTransitioning(true);
    
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
