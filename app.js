// Skybox Component
function SkyboxScene() {
    const mountRef = React.useRef(null);
  
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
  
      // Skybox texture
      const loader = new THREE.CubeTextureLoader();
      const texture = loader.load([
        "posx.jpg", "negx.jpg",
        "posy.jpg", "negy.jpg",
        "posz.jpg", "negz.jpg"
      ]);
      scene.background = texture;
  
      // Basic lighting
      const light = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(light);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);
  
      // Camera position
      camera.position.z = 5;
  
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
  
      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        mountRef.current?.removeChild(renderer.domElement);
      };
    }, []);
  
    return <div ref={mountRef} className="absolute inset-0" />;
  }
  
  // Main App Component
  function App() {
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
            <img src="images/logo.svg" alt="Truman State University" className="h-8 w-auto" />
          </div>
        </div>
      </div>
    );
  }
  
  // Render App
  const rootElement = document.getElementById("root");
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  