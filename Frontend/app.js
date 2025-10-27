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
          position: new THREE.Vector3(-1.99 * 10, -0.43 * 10, 4.57 * 10), // Scaled to skybox edge
          title: "The Blue House",
          description: "A charming blue house located in the Truman campus area. This building represents the residential life at Truman State University.",
          visible: true,
          cameraTarget: new THREE.Vector3(-1.99 * 10, -0.43 * 10, 4.57 * 10),
          cameraPosition: new THREE.Vector3(-1.99, -0.43, 2.57), // Keep camera close
          fov: 60,
          color: "#3b82f6"
        },
        {
          position: new THREE.Vector3(-4.56 * 10, -0.43 * 10, 2.05 * 10), // Scaled to skybox edge
          title: "The Red House",
          description: "A beautiful red house that adds character to the campus landscape. This building showcases Truman's diverse architectural styles.",
          visible: true,
          cameraTarget: new THREE.Vector3(-4.56 * 10, -0.43 * 10, 2.05 * 10),
          cameraPosition: new THREE.Vector3(-4.56, -0.43, 0.05), // Keep camera close
          fov: 60,
          color: "#ef4444"
        },
        {
          position: new THREE.Vector3(0.73 * 10, 0.16 * 10, -4.94 * 10), // Scaled to skybox edge
          title: "The Right Goal Post",
          description: "Part of Truman's athletic facilities, this goal post represents the university's commitment to sports and student activities.",
          visible: true,
          cameraTarget: new THREE.Vector3(0.73 * 10, 0.16 * 10, -4.94 * 10),
          cameraPosition: new THREE.Vector3(0.73, 0.16, -2.94), // Keep camera close
          fov: 60,
          color: "#f59e0b"
        },
        {
          position: new THREE.Vector3(4.99 * 10, -0.10 * 10, 0.24 * 10), // Scaled to skybox edge
          title: "The Red Barn",
          description: "A historic red barn that adds rustic charm to the campus. This structure represents Truman's connection to its agricultural heritage.",
          visible: true,
          cameraTarget: new THREE.Vector3(4.99 * 10, -0.10 * 10, 0.24 * 10),
          cameraPosition: new THREE.Vector3(2.99, -0.10, 0.24), // Keep camera close
          fov: 60,
          color: "#dc2626"
        },
        {
          position: new THREE.Vector3(0.27 * 10, -0.13 * 10, 4.99 * 10), // Scaled to skybox edge
          title: "The Left Goal Post",
          description: "The left goal post of Truman's football field, symbolizing the university's athletic spirit and school pride.",
          visible: true,
          cameraTarget: new THREE.Vector3(0.27 * 10, -0.13 * 10, 4.99 * 10),
          cameraPosition: new THREE.Vector3(0.27, -0.13, 2.99), // Keep camera close
          fov: 60,
          color: "#f59e0b"
        },
        {
          position: new THREE.Vector3(-4.65 * 10, 1.78 * 10, -0.49 * 10), // Scaled to skybox edge
          title: "The Football Field",
          description: "Truman's main football field where Bulldogs play. This is the heart of Truman's athletic program and school spirit.",
          visible: true,
          cameraTarget: new THREE.Vector3(-4.65 * 10, 1.78 * 10, -0.49 * 10),
          cameraPosition: new THREE.Vector3(-2.65, 1.78, -0.49), // Keep camera close
          fov: 60,
          color: "#10b981"
        }
      ];
      
      const createAnnotationMarkers = () => {
        // Create sprites for each annotation with unique colors
        annotations.forEach((annotation, index) => {
          // Create a canvas-based circular sprite with annotation-specific color
          const size = 64;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const radius = 12;
          
          // Clear canvas
          ctx.clearRect(0, 0, size, size);
          
          // Draw outer ring
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          
          // Draw inner circle with annotation color
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, radius - 3, 0, Math.PI * 2);
          ctx.fillStyle = annotation.color;
          ctx.fill();
          
          // Draw center dot
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          
          const texture = new THREE.CanvasTexture(canvas);
          
          const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true, 
            depthTest: false,
            depthWrite: false,
            alphaTest: 0.1
          });
          const sprite = new THREE.Sprite(material);
          sprite.position.copy(annotation.position);
          sprite.scale.set(2.5, 2.5, 1); // Slightly larger for better visibility
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
          sprite.scale.set(3.5, 3.5, 1); // Slightly larger on hover
          renderer.domElement.style.cursor = 'pointer';
          hoveredAnnotation = sprite;
          
          // Show tooltip
          showTooltip(sprite.userData.annotation.title);
        } else {
          sprite.scale.set(2.5, 2.5, 1); // Match the new base scale
          renderer.domElement.style.cursor = 'default';
          hoveredAnnotation = null;
          
          // Hide tooltip
          hideTooltip();
        }
      };
      
      const onAnnotationClick = (sprite) => {
        // Animate camera to annotation instead of showing dialog
        animateCameraToAnnotation(sprite.userData.annotation);
        
        // Simple click bounce animation
        if (!sprite) return;
        const originalScale = 2.5; // Match the new base scale
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
      
      // Tooltip functions
      const showTooltip = (title) => {
        // Remove existing tooltip
        hideTooltip();
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.id = 'annotation-tooltip';
        tooltip.innerHTML = title;
        tooltip.style.cssText = `
          position: fixed;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          z-index: 10000;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip near mouse
        const updateTooltipPosition = (event) => {
          tooltip.style.left = (event.clientX + 15) + 'px';
          tooltip.style.top = (event.clientY - 30) + 'px';
        };
        
        // Add mouse move listener for tooltip positioning
        document.addEventListener('mousemove', updateTooltipPosition);
        tooltip.updatePosition = updateTooltipPosition;
        
        // Show tooltip with fade in
        setTimeout(() => {
          tooltip.style.opacity = '1';
        }, 10);
      };
      
      const hideTooltip = () => {
        const tooltip = document.getElementById('annotation-tooltip');
        if (tooltip) {
          // Remove mouse move listener
          if (tooltip.updatePosition) {
            document.removeEventListener('mousemove', tooltip.updatePosition);
          }
          tooltip.remove();
        }
      };
      
      const onMouseMove = (event) => {
        if (!raycaster || !mouse || annotationSprites.length === 0) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        // Check for annotation intersections
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
        
        // Raycast to skybox for target coordinates
        try {
          // Create a large sphere for skybox intersection
          const skyboxGeometry = new THREE.SphereGeometry(1000, 32, 32);
          const skyboxMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000, 
            transparent: true, 
            opacity: 0,
            side: THREE.BackSide
          });
          const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
          
          raycaster.setFromCamera(mouse, camera);
          const skyboxIntersects = raycaster.intersectObject(skyboxMesh);
          
          if (skyboxIntersects.length > 0) {
            const intersectionPoint = skyboxIntersects[0].point;
            window.lastTargetPosition = intersectionPoint;
          }
          
          // Clean up temporary mesh
          skyboxGeometry.dispose();
          skyboxMaterial.dispose();
          
        } catch (error) {
          console.warn('Raycasting error:', error);
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
            <h2 style="color: ${annotation.color};">${annotation.title}</h2>
            <p>${annotation.description}</p>
            <div style="margin: 15px 0; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 8px;">
              <strong>Coordinates:</strong><br>
              X: ${annotation.position.x.toFixed(2)}<br>
              Y: ${annotation.position.y.toFixed(2)}<br>
              Z: ${annotation.position.z.toFixed(2)}
            </div>
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
          const scale = 2.5 + Math.sin(Date.now() * 0.005) * 0.5; // Match new base scale with subtle pulse
          hoveredAnnotation.scale.set(scale, scale, 1);
        }
        
        // Update coordinate displays
        try {
          // Update camera coordinates
          const cameraX = document.getElementById('camera-x');
          const cameraY = document.getElementById('camera-y');
          const cameraZ = document.getElementById('camera-z');
          
          if (cameraX && cameraY && cameraZ && camera) {
            const x = camera.position.x.toFixed(2);
            const y = camera.position.y.toFixed(2);
            const z = camera.position.z.toFixed(2);
            
            cameraX.textContent = `(${x})`;
            cameraY.textContent = `(${y})`;
            cameraZ.textContent = `(${z})`;
          }
          
          // Update target coordinates (will be updated by mouse move)
          const targetX = document.getElementById('target-x');
          const targetY = document.getElementById('target-y');
          const targetZ = document.getElementById('target-z');
          
          if (targetX && targetY && targetZ && window.lastTargetPosition) {
            const x = window.lastTargetPosition.x.toFixed(2);
            const y = window.lastTargetPosition.y.toFixed(2);
            const z = window.lastTargetPosition.z.toFixed(2);
            
            targetX.textContent = `(${x})`;
            targetY.textContent = `(${y})`;
            targetZ.textContent = `(${z})`;
          }
          
        } catch (error) {
          console.warn('Coordinate display update error:', error);
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
          
          // Hide tooltip
          hideTooltip();
          
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
        <div className="absolute bottom-20 left-4 bg-purple-800 bg-opacity-80 p-4 rounded-lg text-white">
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
        
        {/* Camera Position Indicator */}
        <div className="absolute bottom-4 right-4 z-50" style={{zIndex: 9999}}>
          <div className="bg-black bg-opacity-90 p-3 rounded-lg shadow-lg text-white font-mono text-sm border border-gray-600 mb-2">
            <div className="text-xs text-gray-300 mb-1">Camera Position</div>
            <div id="camera-coordinate-display" className="space-y-1">
              <div>X: <span id="camera-x" style={{color: '#10b981', fontWeight: 'bold'}}>(0.00)</span></div>
              <div>Y: <span id="camera-y" style={{color: '#10b981', fontWeight: 'bold'}}>(0.00)</span></div>
              <div>Z: <span id="camera-z" style={{color: '#10b981', fontWeight: 'bold'}}>(0.00)</span></div>
            </div>
          </div>
        </div>
        
        {/* Mouse Target Indicator */}
        <div className="absolute bottom-32 right-4 z-50" style={{zIndex: 9999}}>
          <div className="bg-black bg-opacity-90 p-3 rounded-lg shadow-lg text-white font-mono text-sm border border-gray-600">
            <div className="text-xs text-gray-300 mb-1">Mouse Target</div>
            <div id="target-coordinate-display" className="space-y-1">
              <div>X: <span id="target-x" style={{color: '#f59e0b', fontWeight: 'bold'}}>(0.00)</span></div>
              <div>Y: <span id="target-y" style={{color: '#f59e0b', fontWeight: 'bold'}}>(0.00)</span></div>
              <div>Z: <span id="target-z" style={{color: '#f59e0b', fontWeight: 'bold'}}>(0.00)</span></div>
            </div>
          </div>
        </div>
        
        {/* Crosshair Indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none" style={{zIndex: 9999}}>
          <div className="w-6 h-6 border-2 border-white border-opacity-60 rounded-full">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full opacity-80"></div>
            </div>
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