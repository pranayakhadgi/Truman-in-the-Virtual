// Skybox Component with Multi-Skybox Support
function SkyboxScene() {
    const mountRef = React.useRef(null);
    const [currentSkybox, setCurrentSkybox] = React.useState(0);
    const [isTransitioning, setIsTransitioning] = React.useState(false);
  
    // Skybox configurations
    const skyboxConfigs = [
      {
        name: "Thousand Hills in Truman",
        images: [
          "/public/field-skyboxes 2/FishPond/posx.jpg", "/public/field-skyboxes 2/FishPond/negx.jpg",
          "/public/field-skyboxes 2/FishPond/posy.jpg", "/public/field-skyboxes 2/FishPond/negy.jpg",
          "/public/field-skyboxes 2/FishPond/posz.jpg", "/public/field-skyboxes 2/FishPond/negz.jpg"
        ]
      },
      {
        name: "The Quad",
        images: [
          "/public/field-skyboxes 2/Sorsele3/posx.jpg", "/public/field-skyboxes 2/Sorsele3/negx.jpg",
          "/public/field-skyboxes 2/Sorsele3/posy.jpg", "/public/field-skyboxes 2/Sorsele3/negy.jpg",
          "/public/field-skyboxes 2/Sorsele3/posz.jpg", "/public/field-skyboxes 2/Sorsele3/negz.jpg"
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
      controls.autoRotate = true; // Enable auto rotation
      controls.autoRotateSpeed = 1.0; // Rotation speed (1.0 = moderate speed)
  
      // Skybox configuration
      const SKYBOX_RADIUS = 500;
      let skyboxMesh = null;
      let skyboxMaterial = null;
      
      // Create skybox geometry and material
      const skyboxGeometry = new THREE.SphereGeometry(SKYBOX_RADIUS, 64, 64);
      skyboxMaterial = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        depthWrite: false
      });
      skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      scene.add(skyboxMesh);
      
      // Load skybox textures
      const loader = new THREE.CubeTextureLoader();
      const loadSkybox = (config, onLoad, onError) => {
        console.log('Loading skybox:', config.name, 'with images:', config.images);
        return loader.load(config.images, onLoad, undefined, onError);
      };
      
      let currentTexture = loadSkybox(
        skyboxConfigs[currentSkybox],
        (texture) => {
          console.log('Successfully loaded initial skybox:', skyboxConfigs[currentSkybox].name);
          // Apply cube texture to skybox material using custom shader
          const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `;
          
          const fragmentShader = `
            uniform samplerCube tCube;
            varying vec3 vWorldPosition;
            void main() {
              vec3 direction = normalize(vWorldPosition - cameraPosition);
              gl_FragColor = textureCube(tCube, direction);
            }
          `;
          
          const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
              tCube: { value: texture }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide,
            depthWrite: false
          });
          
          skyboxMesh.material.dispose();
          skyboxMesh.material = shaderMaterial;
          skyboxMaterial = shaderMaterial;
          currentTexture = texture;
        },
        (error) => {
          console.error('Failed to load initial skybox:', skyboxConfigs[currentSkybox].name, error);
          // Fallback to a simple color
          skyboxMaterial.color = new THREE.Color(0x87CEEB);
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
      //this is where I implemented the camera directional vector fix code
      // ---------------- Helper Functions ----------------
      // Get a point along the camera's forward direction using unprojection
      // This ensures annotations align with the camera's actual viewing direction
      function getCameraDirectionPoint(camera, distance = 100) {
        const vector = new THREE.Vector3(0, 0, -1); // Center of screen in NDC (Normalized Device Coordinates)
        vector.unproject(camera);                   // Convert to world coordinates
        const dir = vector.sub(camera.position).normalize(); // Forward direction vector
        return camera.position.clone().add(dir.multiplyScalar(distance));
      }
      
      // ---------------- Annotation System ----------------
      let annotationSprites = [];
      let raycaster;
      let mouse;
      let isHovering = false;
      let hoveredAnnotation = null;
      
      // Annotations: Store original positions, convert to direction vectors for skybox placement
      // Positions are at various distances from origin - we'll normalize them to get directions
      const annotations = [
        {
          // Original position was (1.27, 0.53, -4.81) - convert to direction
          originalPosition: new THREE.Vector3(1.27, 0.53, -4.81),
          title: "The Blue House",
          description: "A charming blue house located in the Truman campus area. This building represents the residential life at Truman State University.",
          visible: true,
          cameraTarget: new THREE.Vector3(1.99, 0.43, -4.57).normalize().multiplyScalar(SKYBOX_RADIUS),
          cameraPosition: new THREE.Vector3(1.99, 0.43, -2.57), // Keep camera close
          fov: 60,
          color: "#3b82f6"
        },
        {
          // Original position was (-4.56 * 10, -0.43 * 10, 2.05 * 10) = (-45.6, -4.3, 20.5)
          originalPosition: new THREE.Vector3(-45.6, -4.3, 20.5),
          title: "The Red House",
          description: "A beautiful red house that adds character to the campus landscape. This building showcases Truman's diverse architectural styles.",
          visible: true,
          cameraTarget: new THREE.Vector3(-45.6, -4.3, 20.5).normalize().multiplyScalar(SKYBOX_RADIUS),
          cameraPosition: new THREE.Vector3(-4.56, -0.43, 0.05), // Keep camera close
          fov: 60,
          color: "#ef4444"
        },
        {
          // Original position was (0.73 * 10, 0.16 * 10, -4.94 * 10) = (7.3, 1.6, -49.4)
          originalPosition: new THREE.Vector3(7.3, 1.6, -49.4),
          title: "The Right Goal Post",
          description: "Part of Truman's athletic facilities, this goal post represents the university's commitment to sports and student activities.",
          visible: true,
          cameraTarget: new THREE.Vector3(7.3, 1.6, -49.4).normalize().multiplyScalar(SKYBOX_RADIUS),
          cameraPosition: new THREE.Vector3(0.73, 0.16, -2.94), // Keep camera close
          fov: 60,
          color: "#f59e0b"
        },
        {
          // Original position was (4.99 * 10, -0.10 * 10, 0.24 * 10) = (49.9, -1.0, 2.4)
          originalPosition: new THREE.Vector3(49.9, -1.0, 2.4),
          title: "The Red Barn",
          description: "A historic red barn that adds rustic charm to the campus. This structure represents Truman's connection to its agricultural heritage.",
          visible: true,
          cameraTarget: new THREE.Vector3(49.9, -1.0, 2.4).normalize().multiplyScalar(SKYBOX_RADIUS),
          cameraPosition: new THREE.Vector3(2.99, -0.10, 0.24), // Keep camera close
          fov: 60,
          color: "#dc2626"
        },
        {
          // Original position was (0.27 * 10, -0.13 * 10, 4.99 * 10) = (2.7, -1.3, 49.9)
          originalPosition: new THREE.Vector3(2.7, -1.3, 49.9),
          title: "The Left Goal Post",
          description: "The left goal post of Truman's football field, symbolizing the university's athletic spirit and school pride.",
          visible: true,
          cameraTarget: new THREE.Vector3(2.7, -1.3, 49.9).normalize().multiplyScalar(SKYBOX_RADIUS),
          cameraPosition: new THREE.Vector3(0.27, -0.13, 2.99), // Keep camera close
          fov: 60,
          color: "#f59e0b"
        },
        {
          // Original position was (-4.65 * 10, 1.78 * 10, -0.49 * 10) = (-46.5, 17.8, -4.9)
          originalPosition: new THREE.Vector3(-46.5, 17.8, -4.9),
          title: "The Football Field",
          description: "Truman's main football field where Bulldogs play. This is the heart of Truman's athletic program and school spirit.",
          visible: true,
          cameraTarget: new THREE.Vector3(-46.5, 17.8, -4.9).normalize().multiplyScalar(SKYBOX_RADIUS),
          cameraPosition: new THREE.Vector3(-2.65, 1.78, -0.49), // Keep camera close
          fov: 60,
          color: "#10b981"
        }
      ];
      
      // Project annotations onto the sphere boundary (skybox surface)
      // Camera is at (0,0,0) inside the sphere, so annotations must be on the interior surface
      // Place them slightly inside the sphere boundary to ensure visibility
      const ANNOTATION_OFFSET = 2; // Slightly inside sphere to avoid z-fighting
      annotations.forEach(annotation => {
        if (annotation.originalPosition) {
          // Get direction vector from original position
          annotation.direction = annotation.originalPosition.clone().normalize();
          // Project onto sphere interior surface (slightly inside boundary for visibility)
          annotation.position = annotation.direction.clone().multiplyScalar(SKYBOX_RADIUS - ANNOTATION_OFFSET);
        }
        });
        
      // Dialog box function to show annotation details
      const showDialogBox = (annotation) => {
        // Get or create dialog box element
        let dialogBox = document.getElementById('dialogBox');
        if (!dialogBox) {
          dialogBox = document.createElement('div');
          dialogBox.id = 'dialogBox';
          document.body.appendChild(dialogBox);
      }
      
        // Create dialog content with audio button
        const audioButtonId = `audio-btn-${Date.now()}`;
        dialogBox.innerHTML = `
          <div class="dialog-content">
            <div class="dialog-image">
              <div style="color: white; font-size: 48px; opacity: 0.8;">📍</div>
            </div>
            <div class="dialog-text">
              <button class="close-btn" onclick="closeDialogBox()">×</button>
              <h2 style="color: ${annotation.color};">${annotation.title}</h2>
              <p>${annotation.description}</p>
              <button id="${audioButtonId}" class="audio-btn" style="margin-top: 15px; background: ${annotation.color}; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                <i class="fas fa-volume-up"></i> Listen
              </button>
            </div>
          </div>
        `;
        
        // Show dialog with animation
        setTimeout(() => {
          dialogBox.classList.add('show');
          
          // Add audio functionality to the button
          const audioBtn = document.getElementById(audioButtonId);
          if (audioBtn && 'speechSynthesis' in window) {
            let isPlaying = false;
            audioBtn.addEventListener('click', () => {
              if (isPlaying) {
                window.speechSynthesis.cancel();
                audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> Listen';
                isPlaying = false;
              } else {
                const textToSpeak = `${annotation.title}. ${annotation.description}`;
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                
                utterance.onstart = () => {
                  audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Stop';
                  isPlaying = true;
                };
                
                utterance.onend = () => {
                  audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> Listen';
                  isPlaying = false;
                };
                
                utterance.onerror = () => {
                  audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> Listen';
                  isPlaying = false;
                };
                
                window.speechSynthesis.speak(utterance);
              }
            });
          }
        }, 10);
        
        // Add close function to global scope
        window.closeDialogBox = () => {
          // Stop any ongoing speech when closing dialog
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          dialogBox.classList.remove('show');
          setTimeout(() => {
            dialogBox.innerHTML = '';
          }, 300);
        };
        
        // Close on background click
        dialogBox.addEventListener('click', (e) => {
          if (e.target === dialogBox) {
            window.closeDialogBox();
          }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
          if (e.key === 'Escape') {
            window.closeDialogBox();
            document.removeEventListener('keydown', escapeHandler);
          }
        };
        document.addEventListener('keydown', escapeHandler);
      };
      
      const createAnnotationMarkers = () => {
        // Create sprites for each annotation with unique colors
        annotations.forEach((annotation, index) => {
          // Place annotation on sphere boundary (skybox surface)
          const position = annotation.position; // Already projected to SKYBOX_RADIUS
          
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
            depthTest: true, // Enable depth test for proper rendering
            depthWrite: false,
            alphaTest: 0.1
          });
          const sprite = new THREE.Sprite(material);
          sprite.position.copy(position);
          sprite.scale.set(3.0, 3.0, 1); // Larger scale for better visibility
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
          sprite.scale.set(3.5, 3.5, 1); // Expand on hover
          renderer.domElement.style.cursor = 'pointer';
          hoveredAnnotation = sprite;
          
          const annotation = sprite.userData.annotation;
          
          // Show tooltip (follows mouse)
          showTooltip(annotation.title);
          
          // Show location label in annotation overlay (bottom center)
          const annotationOverlay = document.getElementById('annotationMessage');
          if (annotationOverlay) {
            annotationOverlay.textContent = annotation.title;
            annotationOverlay.classList.add('show');
          }
        } else {
          sprite.scale.set(2.5, 2.5, 1); // Return to base scale
          renderer.domElement.style.cursor = 'default';
          hoveredAnnotation = null;
          
          // Hide tooltip
          hideTooltip();
          
          // Hide location label
          const annotationOverlay = document.getElementById('annotationMessage');
          if (annotationOverlay) {
            annotationOverlay.classList.remove('show');
          }
        }
      };
      
      const onAnnotationClick = (sprite) => {
        // Show dialog box with annotation details
        showDialogBox(sprite.userData.annotation);
        
        // Simple click bounce animation
        if (!sprite) return;
        const originalScale = 2.5;
        const startTime = Date.now();
        const duration = 500;
        const animateClick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const bounce = Math.sin(progress * Math.PI);
          const scale = originalScale + bounce * 0.5;
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
        if (!raycaster || !mouse) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        let hovering = false;
        
        // Check for annotation sprite intersections
        if (annotationSprites.length > 0) {
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
            hovering = true;
          }
        }
        
        // Reset hover state if nothing is hovered
        if (!hovering && hoveredAnnotation) {
            // It's a sprite annotation
            onAnnotationHover(hoveredAnnotation, false);
            renderer.domElement.style.cursor = 'default';
            hideTooltip();
            hoveredAnnotation = null;
        }
        
        // Calculate target coordinates using raycasting against skybox mesh
        try {
          if (skyboxMesh) {
            // Raycast against the actual skybox mesh
            const skyboxIntersects = raycaster.intersectObject(skyboxMesh);
            
            if (skyboxIntersects.length > 0) {
              // Get exact point on skybox surface
              const intersectionPoint = skyboxIntersects[0].point;
              window.lastTargetPosition = intersectionPoint;
            } else {
              // Fallback: use unprojection if raycast fails
              const ndc = new THREE.Vector3(mouse.x, mouse.y, -1);
              ndc.unproject(camera);
              const dir = ndc.sub(camera.position).normalize();
              const targetPoint = camera.position.clone().add(dir.multiplyScalar(SKYBOX_RADIUS));
              window.lastTargetPosition = targetPoint;
            }
          }
        } catch (error) {
          console.warn('Target coordinate calculation error:', error);
        }
      };
      
      const onMouseClick = (event) => {
        if (hoveredAnnotation && hoveredAnnotation.scale) {
            // It's a sprite annotation
            if (isHovering) onAnnotationClick(hoveredAnnotation);
          }
      };
      
      // Initialize raycaster, mouse, and create markers
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      createAnnotationMarkers();
      
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onMouseClick);
  
      // Skybox transition function
      const transitionToSkybox = (skyboxIndex) => {
        // Allow transition even if already transitioning (force transition)
        console.log(`Transitioning to skybox ${skyboxIndex}: ${skyboxConfigs[skyboxIndex].name}`);
        setIsTransitioning(true);
        setCurrentSkybox(skyboxIndex); // Update state to match the transition
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
              fadeMaterial.opacity += 0.08;
              if (fadeMaterial.opacity >= 1) {
                clearInterval(fadeInterval);
                
                // Load new skybox
                try {
                  loadSkybox(
                    newConfig,
                    (newTexture) => {
                      console.log(`Successfully loaded skybox: ${newConfig.name}`);
                      // Update skybox mesh material with new cube texture
                      if (skyboxMesh && skyboxMaterial) {
                        // Update shader material uniforms
                        if (skyboxMaterial.uniforms && skyboxMaterial.uniforms.tCube) {
                          skyboxMaterial.uniforms.tCube.value = newTexture;
                        } else {
                          // Create new shader material if needed
                          const vertexShader = `
                            varying vec3 vWorldPosition;
                            void main() {
                              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                              vWorldPosition = worldPosition.xyz;
                              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                            }
                          `;
                          
                          const fragmentShader = `
                            uniform samplerCube tCube;
                            varying vec3 vWorldPosition;
                            void main() {
                              vec3 direction = normalize(vWorldPosition - cameraPosition);
                              gl_FragColor = textureCube(tCube, direction);
                            }
                          `;
                          
                          const newMaterial = new THREE.ShaderMaterial({
                            uniforms: {
                              tCube: { value: newTexture }
                            },
                            vertexShader: vertexShader,
                            fragmentShader: fragmentShader,
                            side: THREE.BackSide,
                            depthWrite: false
                          });
                          skyboxMesh.material.dispose();
                          skyboxMesh.material = newMaterial;
                          skyboxMaterial = newMaterial;
                        }
                      }
                      currentTexture = newTexture;
                      // Fade back in
                      const fadeOutInterval = setInterval(() => {
                        fadeMaterial.opacity -= 0.08;
                        if (fadeMaterial.opacity <= 0) {
                          clearInterval(fadeOutInterval);
                          scene.remove(fadeMesh);
                          fadeGeometry.dispose();
                          fadeMaterial.dispose();
                          setIsTransitioning(false);
                          console.log(`Transition completed to: ${newConfig.name}`);
                        }
                      }, 30);
                    },
                    (error) => {
                      console.error(`Failed to load skybox: ${newConfig.name}`, error);
                      setIsTransitioning(false);
                      scene.remove(fadeMesh);
                      fadeGeometry.dispose();
                      fadeMaterial.dispose();
                    }
                  );
                } catch (error) {
                  console.error(`Error loading skybox: ${newConfig.name}`, error);
                  setIsTransitioning(false);
                  scene.remove(fadeMesh);
                  fadeGeometry.dispose();
                  fadeMaterial.dispose();
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
        
        // cameraPosition is automatically provided by Three.js, no need to update manually
        
        // Make annotations always face camera (billboard behavior)
        annotationSprites.forEach(sprite => {
          sprite.lookAt(camera.position);
        });
        
        // Pulse animation while hovering over annotation (throttled)
        if (hoveredAnnotation && isHovering) {
          const scale = 2.5 + Math.sin(Date.now() * 0.005) * 0.5; // Match new base scale with subtle pulse
          hoveredAnnotation.scale.set(scale, scale, 1);
        }
        
        // Coordinate displays removed
        
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
          if (skyboxMesh) {
            skyboxMesh.material.dispose();
            skyboxMesh.geometry.dispose();
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
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    const [speechSynthesis, setSpeechSynthesis] = React.useState(null);
    
    // Initialize text-to-speech
    React.useEffect(() => {
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        setSpeechSynthesis(synth);
        
        // Ensure voices are loaded (some browsers need this)
        const loadVoices = () => {
          const voices = synth.getVoices();
          if (voices.length > 0) {
            console.log('Voices loaded:', voices.length);
          }
        };
        
        // Load voices immediately if available
        loadVoices();
        
        // Some browsers load voices asynchronously
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
      
      // Try to find a female voice (common patterns: female, woman, or specific names)
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('zira') || // Windows female voice
        voice.name.toLowerCase().includes('samantha') || // macOS female voice
        voice.name.toLowerCase().includes('karen') || // macOS female voice
        voice.name.toLowerCase().includes('victoria') || // macOS female voice
        voice.name.toLowerCase().includes('susan') || // macOS female voice
        (voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('female')) ||
        (voice.name.toLowerCase().includes('microsoft') && voice.name.toLowerCase().includes('female'))
      );
      
      // If no specific female voice found, try to find any non-male voice
      if (!femaleVoice) {
        const nonMaleVoice = voices.find(voice => 
          !voice.name.toLowerCase().includes('male') &&
          !voice.name.toLowerCase().includes('man') &&
          !voice.name.toLowerCase().includes('david') &&
          !voice.name.toLowerCase().includes('mark') &&
          !voice.name.toLowerCase().includes('alex')
        );
        return nonMaleVoice || voices[0]; // Fallback to first available voice
      }
      
      return femaleVoice;
    };
    
    // Text-to-speech function with female voice
    const speakText = (text, onEnd) => {
      if (!speechSynthesis) {
        console.warn('Speech synthesis not available');
        return;
      }
      
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 1.0; // Full volume
      
      // Set female voice
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
    const sceneScripts = {
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
    
    // Skybox configurations
    const skyboxConfigs = [
      { name: "Thousand Hills in Truman" },
      { name: "The Quad" }
    ];
    
    const handlePreviousSkybox = () => {
      console.log('Previous button clicked!', { isTransitioning, currentSkybox });
      // Allow transition even if one is in progress (force transition)
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
      // Allow transition even if one is in progress (force transition)
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
        <SkyboxScene />
        
        {/* Top Left - Controls Menu */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-purple-400 bg-opacity-80 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3 shadow-lg">
            {/* Search */}
            <button className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-purple-500 hover:bg-opacity-50">
              <i className="fas fa-search text-lg"></i>
            </button>
            {/* Audio - Text to Speech */}
            <button 
              onClick={toggleSceneSpeech}
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
        
        {/* Top Right - Action Buttons */}
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
        
        {/* Bottom Left - Scene Label and Logo */}
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
        
        {/* Bottom Center - Skybox Navigation Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black bg-opacity-70 rounded-lg p-4 flex items-center space-x-4">
            {/* Previous Button */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                console.log('Previous button onClick triggered');
                handlePreviousSkybox();
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
                handleNextSkybox();
              }}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
            >
              <i className="fas fa-step-forward text-lg"></i>
            </button>
          </div>
        </div>
        
        {/* Camera, Mouse Target, and Crosshair Indicators - Removed */}
        
        {/* Loading Indicator - Removed to prevent blocking interactions */}
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
    // Wait a bit for scene to initialize, then fade out
    setTimeout(() => {
      transitionOverlay.style.opacity = '0';
      setTimeout(() => {
        transitionOverlay.remove();
      }, 1000); // Remove after fade-out completes
    }, 2000); // Give 3D scene 2 seconds to start loading
  }