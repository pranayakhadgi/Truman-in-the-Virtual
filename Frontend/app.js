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
          "../public/field-skyboxes 2/Footballfield2/posx.jpg", "../public/field-skyboxes 2/Footballfield2/negx.jpg",
          "../public/field-skyboxes 2/Footballfield2/posy.jpg", "../public/field-skyboxes 2/Footballfield2/negy.jpg",
          "../public/field-skyboxes 2/Footballfield2/posz.jpg", "../public/field-skyboxes 2/Footballfield2/negz.jpg"
        ]
      }
    ];
  
    React.useEffect(() => {
      // WebGL Detection and Error Handling
      if (!window.WebGLRenderingContext) {
        console.error('WebGL not supported');
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 10000;"><h2>WebGL Not Supported</h2><p>Your browser does not support WebGL. Please use a modern browser.</p></div>';
        document.body.appendChild(errorDiv);
        return;
      }

      try {
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
  
      // Hide global loading indicator if present
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
  
      // Orbit controls
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
  
      // Load initial skybox with improved error handling
      const loader = new THREE.CubeTextureLoader();
      const loadSkybox = (config, onLoad, onError) => {
        console.log('Loading skybox:', config.name, 'with images:', config.images);
        return loader.load(config.images, onLoad, undefined, onError);
      };
      
      let currentTexture = loadSkybox(
        skyboxConfigs[currentSkybox],
        (texture) => {
          console.log('Successfully loaded initial skybox:', skyboxConfigs[currentSkybox].name);
          scene.background = texture;
          currentTexture = texture;
        },
        (error) => {
          console.error('Failed to load initial skybox:', skyboxConfigs[currentSkybox].name, error);
          // Fallback to a simple color background
          scene.background = new THREE.Color(0x87CEEB);
        }
      );
  
      // Basic lighting
      const light = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(light);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);
  
      // Camera position
      camera.position.z = 5;
      
      // ---------------- Annotation System ----------------
      let annotationSprites = [];
      let raycaster;
      let mouse;
      let isHovering = false;
      let hoveredAnnotation = null;
      
      const annotations = [
        {
          position: new THREE.Vector3(0, 0, -50), // Front face (stuck to cube interior)
          title: "Front Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(0, 0, -50),
          cameraPosition: new THREE.Vector3(0, 0, -20),
          fov: 60
        },
        {
          position: new THREE.Vector3(0, 0, 50), // Back face (stuck to cube interior)
          title: "Back Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(0, 0, 50),
          cameraPosition: new THREE.Vector3(0, 0, 20),
          fov: 60
        },
        {
          position: new THREE.Vector3(-50, 0, 0), // Left face (stuck to cube interior)
          title: "Left Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(-50, 0, 0),
          cameraPosition: new THREE.Vector3(-20, 0, 0),
          fov: 60
        },
        {
          position: new THREE.Vector3(50, 0, 0), // Right face (stuck to cube interior)
          title: "Right Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(50, 0, 0),
          cameraPosition: new THREE.Vector3(20, 0, 0),
          fov: 60
        },
        {
          position: new THREE.Vector3(0, 50, 0), // Top face (stuck to cube interior)
          title: "Top Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(0, 50, 0),
          cameraPosition: new THREE.Vector3(0, 20, 0),
          fov: 60
        },
        {
          position: new THREE.Vector3(0, -50, 0), // Bottom face (stuck to cube interior)
          title: "Bottom Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(0, -50, 0),
          cameraPosition: new THREE.Vector3(0, -20, 0),
          fov: 60
        }
      ];
      
      const createAnnotationMarkers = () => {
        // Create a canvas-based circular sprite (white dot)
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const radius = 10;
        ctx.clearRect(0, 0, size, size);
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create sprites for each annotation
        annotations.forEach((annotation, index) => {
          const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true, 
            depthTest: false,
            depthWrite: false,
            alphaTest: 0.1
          });
          const sprite = new THREE.Sprite(material);
          sprite.position.copy(annotation.position);
          sprite.scale.set(2, 2, 1); // Small as a pea
          sprite.renderOrder = 999; // Render on top
          sprite.userData = { annotationIndex: index, annotation: annotation };
          scene.add(sprite);
          annotationSprites.push(sprite);
        });
      };
      
      const onAnnotationHover = (sprite, hovering) => {
        if (!sprite) return;
        isHovering = hovering;
        if (hovering) {
          sprite.scale.set(3, 3, 1); // Slightly larger on hover
          renderer.domElement.style.cursor = 'pointer';
          hoveredAnnotation = sprite;
        } else {
          sprite.scale.set(2, 2, 1); // Match the new base scale
          renderer.domElement.style.cursor = 'default';
          hoveredAnnotation = null;
        }
      };
      
      const onAnnotationClick = (sprite) => {
        // Animate camera to annotation instead of showing dialog
        animateCameraToAnnotation(sprite.userData.annotation);
        
        // Simple click bounce animation
        if (!sprite) return;
        const originalScale = 2; // Match the new base scale
        const startTime = Date.now();
        const duration = 500;
        const animateClick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const bounce = Math.sin(progress * Math.PI);
          const scale = originalScale + bounce * 10;
          sprite.scale.set(scale, scale, 1);
          if (progress < 1) requestAnimationFrame(animateClick);
          else sprite.scale.set(originalScale, originalScale, 1);
        };
        requestAnimationFrame(animateClick);
      };
      
      const onMouseMove = (event) => {
        if (!raycaster || !mouse || annotationSprites.length === 0) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(annotationSprites, true);
        
        if (intersects.length > 0) {
          const intersectedSprite = intersects[0].object;
          if (hoveredAnnotation !== intersectedSprite) {
            // Reset previous hovered annotation
            if (hoveredAnnotation) {
              onAnnotationHover(hoveredAnnotation, false);
            }
            // Set new hovered annotation
            onAnnotationHover(intersectedSprite, true);
          }
        } else if (hoveredAnnotation) {
          // No intersection, reset hover
          onAnnotationHover(hoveredAnnotation, false);
        }
      };
      
      const onMouseClick = () => {
        if (isHovering && hoveredAnnotation) onAnnotationClick(hoveredAnnotation);
      };
      
      // Smooth camera animation function
      const animateCameraToAnnotation = (annotation, duration = 1500) => {
        const startPosition = camera.position.clone();
        const startTarget = controls.target.clone();
        const startFOV = camera.fov;
        
        const endPosition = annotation.cameraPosition;
        const endTarget = annotation.cameraTarget;
        const endFOV = annotation.fov;
        
        const startTime = Date.now();
        
        function animate() {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (ease-in-out)
          const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          
          // Interpolate camera position
          camera.position.lerpVectors(startPosition, endPosition, eased);
          
          // Interpolate camera target
          controls.target.lerpVectors(startTarget, endTarget, eased);
          
          // Interpolate FOV
          camera.fov = startFOV + (endFOV - startFOV) * eased;
          camera.updateProjectionMatrix();
          
          controls.update();
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            showAnnotationDetails(annotation);
          }
        }
        
        animate();
      };
      
      // Show annotation details with return button
      const showAnnotationDetails = (annotation) => {
        // Remove existing detail panel
        const existingPanel = document.getElementById('annotationDetailPanel');
        if (existingPanel) {
          existingPanel.remove();
        }
        
        // Create detail panel
        const panel = document.createElement('div');
        panel.id = 'annotationDetailPanel';
        panel.innerHTML = `
          <div class="annotation-detail-content">
            <h2>${annotation.title}</h2>
            <p>You've focused on the ${annotation.title.toLowerCase()} area of the Truman campus.</p>
            <p>This is where the smooth camera transition brings you for a closer look at specific campus features.</p>
            <button class="return-btn" onclick="returnToOverview()">🔙 Return to Overview</button>
          </div>
        `;
        document.body.appendChild(panel);
        
        // Show with animation
        setTimeout(() => panel.classList.add('show'), 10);
        
        // Add return to overview function to global scope
        window.returnToOverview = () => {
          // Animate back to original position
          const startPosition = camera.position.clone();
          const startTarget = controls.target.clone();
          const startFOV = camera.fov;
          
          const endPosition = new THREE.Vector3(0, 0, 5); // Original camera position
          const endTarget = new THREE.Vector3(0, 0, 0); // Original target
          const endFOV = 75; // Original FOV
          
          const startTime = Date.now();
          const duration = 1500;
          
          function animateReturn() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-in-out)
            const eased = progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Interpolate camera position
            camera.position.lerpVectors(startPosition, endPosition, eased);
            
            // Interpolate camera target
            controls.target.lerpVectors(startTarget, endTarget, eased);
            
            // Interpolate FOV
            camera.fov = startFOV + (endFOV - startFOV) * eased;
            camera.updateProjectionMatrix();
            
            controls.update();
            
            if (progress < 1) {
              requestAnimationFrame(animateReturn);
            } else {
              // Remove detail panel
              const panel = document.getElementById('annotationDetailPanel');
              if (panel) {
                panel.remove();
              }
            }
          }
          
          animateReturn();
        };
      };
      
      
      // Initialize raycaster, mouse, and create markers
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      createAnnotationMarkers();
      
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onMouseClick);
  
      // Skybox transition function
      const transitionToSkybox = (skyboxIndex) => {
        if (isTransitioning || skyboxIndex === currentSkybox) return;
        
        console.log(`Transitioning to skybox ${skyboxIndex}: ${skyboxConfigs[skyboxIndex].name}`);
        setIsTransitioning(true);
        const newConfig = skyboxConfigs[skyboxIndex];
        
        // Create fade effect with improved timing
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
              fadeMaterial.opacity += 0.08;
              if (fadeMaterial.opacity >= 1) {
                clearInterval(fadeInterval);
                
                // Load new skybox with error handling
                try {
                  loadSkybox(
                    newConfig,
                    (newTexture) => {
                      console.log(`Successfully loaded skybox: ${newConfig.name}`);
                      scene.background = newTexture;
                      currentTexture = newTexture;
                      // Fade back in
                      const fadeOutInterval = setInterval(() => {
                        fadeMaterial.opacity -= 0.08;
                        if (fadeMaterial.opacity <= 0) {
                          clearInterval(fadeOutInterval);
                          scene.remove(fadeMesh);
                          setIsTransitioning(false);
                          console.log(`Transition completed to: ${newConfig.name}`);
                        }
                      }, 30);
                    },
                    (error) => {
                      console.error(`Failed to load skybox: ${newConfig.name}`, error);
                      setIsTransitioning(false);
                      scene.remove(fadeMesh);
                    }
                  );
                } catch (error) {
                  console.error(`Error loading skybox: ${newConfig.name}`, error);
                  setIsTransitioning(false);
                  scene.remove(fadeMesh);
                }
              }
            }, 30);
          };
          
          setTimeout(fadeIn, 50);
        };
        
        fadeOut();
      };
  
      // Animation loop with performance optimization
      let animationId;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();
        
        // Make annotations always face camera (billboard behavior)
        annotationSprites.forEach(sprite => {
          sprite.lookAt(camera.position);
        });
        
        // Pulse animation while hovering over annotation (throttled)
        if (hoveredAnnotation && isHovering) {
          const scale = 2 + Math.sin(Date.now() * 0.005) * 0.5; // Match new base scale with subtle pulse
          hoveredAnnotation.scale.set(scale, scale, 1);
        }
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
  
        // Cleanup with proper resource disposal
        return () => {
          // Cancel animation loop
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          
          // Remove event listeners
          window.removeEventListener("resize", handleResize);
          if (renderer && renderer.domElement) {
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('click', onMouseClick);
          }
          
          // Dispose of Three.js resources
          if (renderer) {
            renderer.dispose();
          }
          if (currentTexture) {
            currentTexture.dispose();
          }
          annotationSprites.forEach(sprite => {
            if (sprite && sprite.material) {
              sprite.material.map?.dispose();
              sprite.material.dispose();
            }
          });
          
          // Remove renderer from DOM
          if (mountRef.current && renderer && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
          }
        };
      } catch (error) {
        console.error('Error initializing Three.js scene:', error);
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 10000;"><h2>3D Scene Error</h2><p>Failed to initialize 3D environment. Please refresh the page.</p></div>';
        document.body.appendChild(errorDiv);
      }
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
      console.log('Previous button clicked!', { isTransitioning, currentSkybox });
      if (isTransitioning) {
        console.log('Transition in progress, ignoring click');
        return;
      }
      const prevIndex = currentSkybox > 0 ? currentSkybox - 1 : skyboxConfigs.length - 1;
      console.log(`Previous button clicked: ${currentSkybox} -> ${prevIndex}`);
      
      // Update local state first
      setCurrentSkybox(prevIndex);
      setIsTransitioning(true);
      
      // Call transition function
      if (window.transitionToSkybox) {
        window.transitionToSkybox(prevIndex);
      } else {
        console.error('transitionToSkybox function not available');
        setIsTransitioning(false);
      }
    };
    
    const handleNextSkybox = () => {
      console.log('Next button clicked!', { isTransitioning, currentSkybox });
      if (isTransitioning) {
        console.log('Transition in progress, ignoring click');
        return;
      }
      const nextIndex = currentSkybox < skyboxConfigs.length - 1 ? currentSkybox + 1 : 0;
      console.log(`Next button clicked: ${currentSkybox} -> ${nextIndex}`);
      
      // Update local state first
      setCurrentSkybox(nextIndex);
      setIsTransitioning(true);
      
      // Call transition function
      if (window.transitionToSkybox) {
        window.transitionToSkybox(nextIndex);
      } else {
        console.error('transitionToSkybox function not available');
        setIsTransitioning(false);
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
              onClick={(e) => {
                e.preventDefault();
                console.log('Previous button onClick triggered');
                handlePreviousSkybox();
              }}
              disabled={isTransitioning}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
              style={{ cursor: isTransitioning ? 'not-allowed' : 'pointer' }}
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
              onClick={(e) => {
                e.preventDefault();
                console.log('Next button onClick triggered');
                handleNextSkybox();
              }}
              disabled={isTransitioning}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
              style={{ cursor: isTransitioning ? 'not-allowed' : 'pointer' }}
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