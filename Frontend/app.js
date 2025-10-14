// Skybox Component with Multi-Skybox Support
function SkyboxScene() {
    const mountRef = React.useRef(null);
    const [currentSkybox, setCurrentSkybox] = React.useState(0);
    const [isTransitioning, setIsTransitioning] = React.useState(false);
  
    // Skybox configurations
    const skyboxConfigs = [
      {
        name: "Truman Campus",
        images: [
          "../public/images/posx.jpg", "../public/images/negx.jpg",
          "../public/images/posy.jpg", "../public/images/negy.jpg",
          "../public/images/posz.jpg", "../public/images/negz.jpg"
        ]
      },
      {
        name: "Football Field",
        images: [
          "../public/field-skyboxes 2/Footballfield/posx.jpg", "../public/field-skyboxes 2/Footballfield/negx.jpg",
          "../public/field-skyboxes 2/Footballfield/posy.jpg", "../public/field-skyboxes 2/Footballfield/negy.jpg",
          "../public/field-skyboxes 2/Footballfield/posz.jpg", "../public/field-skyboxes 2/Footballfield/negz.jpg"
        ]
      }
    ];
  
    React.useEffect(() => {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);
  
      // Orbit controls
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
  
      // Load initial skybox
      const loader = new THREE.CubeTextureLoader();
      const loadSkybox = (config) => {
        return loader.load(config.images);
      };
      
      let currentTexture = loadSkybox(skyboxConfigs[currentSkybox]);
      scene.background = currentTexture;
  
      // Basic lighting
      const light = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(light);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);
  
      // Camera position
      camera.position.z = 5;
  
      // Skybox transition function
      const transitionToSkybox = (skyboxIndex) => {
        if (isTransitioning || skyboxIndex === currentSkybox) return;
        
        setIsTransitioning(true);
        const newConfig = skyboxConfigs[skyboxIndex];
        
        // Create fade effect
        const fadeOut = () => {
          const fadeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0
          });
          const fadeGeometry = new THREE.PlaneGeometry(2, 2);
          const fadeMesh = new THREE.Mesh(fadeGeometry, fadeMaterial);
          scene.add(fadeMesh);
          
          const fadeIn = () => {
            const fadeInterval = setInterval(() => {
              fadeMaterial.opacity += 0.05;
              if (fadeMaterial.opacity >= 1) {
                clearInterval(fadeInterval);
                // Load new skybox
                const newTexture = loadSkybox(newConfig);
                scene.background = newTexture;
                currentTexture = newTexture;
                setCurrentSkybox(skyboxIndex);
                
                // Fade back in
                const fadeOutInterval = setInterval(() => {
                  fadeMaterial.opacity -= 0.05;
                  if (fadeMaterial.opacity <= 0) {
                    clearInterval(fadeOutInterval);
                    scene.remove(fadeMesh);
                    setIsTransitioning(false);
                  }
                }, 50);
              }
            }, 50);
          };
          
          setTimeout(fadeIn, 100);
        };
        
        fadeOut();
      };
  
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
  
      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);
  
      // Expose transition function globally
      window.transitionToSkybox = transitionToSkybox;
      window.getCurrentSkybox = () => currentSkybox;
      window.getSkyboxConfigs = () => skyboxConfigs;
  
      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        mountRef.current?.removeChild(renderer.domElement);
      };
    }, [currentSkybox, isTransitioning]);
  
    return <div ref={mountRef} className="absolute inset-0" />;
  }
  
  // Main App Component
  function App() {
    const [currentSkybox, setCurrentSkybox] = React.useState(0);
    const [isTransitioning, setIsTransitioning] = React.useState(false);
    
    // Skybox configurations
    const skyboxConfigs = [
      { name: "Truman Campus" },
      { name: "Football Field" }
    ];
    
    const handlePreviousSkybox = () => {
      if (isTransitioning) return;
      const prevIndex = currentSkybox > 0 ? currentSkybox - 1 : skyboxConfigs.length - 1;
      setCurrentSkybox(prevIndex);
      setIsTransitioning(true);
      if (window.transitionToSkybox) {
        window.transitionToSkybox(prevIndex);
      }
    };
    
    const handleNextSkybox = () => {
      if (isTransitioning) return;
      const nextIndex = currentSkybox < skyboxConfigs.length - 1 ? currentSkybox + 1 : 0;
      setCurrentSkybox(nextIndex);
      setIsTransitioning(true);
      if (window.transitionToSkybox) {
        window.transitionToSkybox(nextIndex);
      }
    };
    
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Truman Virtual Tour</h1>
        </div>
        <SkyboxScene />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <button 
            onClick={() => window.location.href = 'welcome.html'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Welcome
          </button>
        </div>
        
        {/* Skybox Navigation Controls - Media Player Style */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black bg-opacity-70 rounded-lg p-4 flex items-center space-x-4">
            {/* Previous Button */}
            <button 
              onClick={handlePreviousSkybox}
              disabled={isTransitioning}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              <i className="fas fa-step-backward text-lg"></i>
            </button>
            
            {/* Current Skybox Info */}
            <div className="text-white text-center min-w-[120px]">
              <p className="text-sm font-semibold">{skyboxConfigs[currentSkybox]?.name}</p>
              <p className="text-xs text-gray-300">
                {currentSkybox + 1} of {skyboxConfigs.length}
              </p>
            </div>
            
            {/* Next Button */}
            <button 
              onClick={handleNextSkybox}
              disabled={isTransitioning}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              <i className="fas fa-step-forward text-lg"></i>
            </button>
          </div>
        </div>
        
        {/* Navigation Instructions */}
        <div className="absolute bottom-4 left-4 bg-purple-800 bg-opacity-80 p-4 rounded-lg text-white">
          <p className="text-sm font-semibold">🖱️ Mouse Controls:</p>
          <p className="text-xs mt-1">• Click & drag to look around</p>
          <p className="text-xs">• Scroll to zoom in/out</p>
          <p className="text-xs">• Right-click & drag to pan</p>
        </div>
        
        {/* Truman Branding */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
            <img src="../public/logo/logo.svg" alt="Truman State University" className="h-8 w-auto" />
          </div>
        </div>
        
        {/* Loading Indicator */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white bg-opacity-90 p-6 rounded-lg text-center">
              <div className="pixelated-rotate mb-4"></div>
              <p className="text-purple-600 font-semibold">Loading Skybox...</p>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render App
  const rootElement = document.getElementById("root");
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  