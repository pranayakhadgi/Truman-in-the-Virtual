/**
 * SkyboxScene Component - Main 3D Scene Renderer
 * 
 * This React component manages the Three.js 3D environment including:
 * - WebGL renderer setup and canvas management
 * - Skybox texture loading and rendering
 * - Camera controls (OrbitControls for navigation)
 * - Scene transitions between different skybox environments
 * - Interactive annotations (clickable markers in 3D space)
 * - Auto-rotation functionality
 * - Window resize handling
 * 
 * The component uses Three.js for WebGL rendering and creates a 360-degree
 * immersive environment using cube texture mapping on a sphere geometry.
 */
function SkyboxScene() {
  const mountRef = React.useRef(null);
  const [currentSkybox, setCurrentSkybox] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Get skybox configs from constants (loaded globally from constants.js)
  const skyboxConfigs = window.skyboxConfigs;
  
  if (!skyboxConfigs) {
    console.error('skyboxConfigs not found! Make sure constants.js is loaded.');
  }

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
      // Ensure canvas receives pointer events for camera controls and annotations
      renderer.domElement.style.pointerEvents = 'auto';
      renderer.domElement.style.zIndex = '10';
      renderer.domElement.style.position = 'relative';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.touchAction = 'none'; // Prevent touch scrolling
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
      controls.autoRotate = false; // Disable auto rotation for better user control
      controls.autoRotateSpeed = 1.0;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
      
      // Ensure controls are active
      controls.update();
      
      // Log to verify controls are working
      console.log('✅ OrbitControls initialized and active');

      // Skybox configuration (from constants)
      const SKYBOX_RADIUS = window.SKYBOX_RADIUS || 500;
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
      
      // Load skybox textures - using JPG format for reliable loading
      const loader = new THREE.CubeTextureLoader();
      const loadSkybox = (config, onLoad, onError) => {
        console.log('Loading skybox:', config.name);
        console.log('Image paths:', config.images);
        
        // Use image paths as-is (should be JPG now)
        const imagePaths = config.images;
        
        console.log('Image paths to load:', imagePaths);
        
        return loader.load(
          imagePaths,
          (texture) => {
            console.log('✅ Skybox texture loaded successfully');
            if (onLoad) onLoad(texture);
          }, 
          (progress) => {
            if (progress && progress.total) {
              console.log('Loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
            }
          },
          (error) => {
            console.error('❌ Failed to load skybox images:', error);
            console.error('Failed paths:', imagePaths);
            if (onError) onError(error);
          }
        );
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
          
          // Create annotations after skybox loads
          createAnnotationMarkers();
        },
        (error) => {
          console.error('❌ Failed to load initial skybox:', skyboxConfigs[currentSkybox].name);
          console.error('Error details:', error);
          console.error('Image paths attempted:', skyboxConfigs[currentSkybox].images);
          
          // Fallback to a simple color
          if (skyboxMaterial) {
            skyboxMaterial.color = new THREE.Color(0x87CEEB);
          }
          
          // Show error message to user
          const errorMsg = document.createElement('div');
          errorMsg.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,0,0,0.9); color: white; padding: 15px; border-radius: 8px; z-index: 10001; max-width: 600px; text-align: center;';
          errorMsg.innerHTML = '<strong>⚠️ Skybox Images Failed to Load</strong><br>Check console for details. Using fallback color.';
          document.body.appendChild(errorMsg);
          setTimeout(() => errorMsg.remove(), 5000);
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
      
      // Helper Functions
      function getCameraDirectionPoint(camera, distance = 100) {
        const vector = new THREE.Vector3(0, 0, -1);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        return camera.position.clone().add(dir.multiplyScalar(distance));
      }
      
      // Annotation System
      let annotationSprites = [];
      let raycaster;
      let mouse;
      let isHovering = false;
      let hoveredAnnotation = null;
      
      // Annotations configuration - 6 directions (posx, negx, posy, negy, posz, negz)
      // Using normalized directions for all 6 cardinal directions
      const annotations = [
        {
          originalPosition: new THREE.Vector3(1, 0, 0), // +X (Right/East)
          title: "East View",
          description: "Looking east across the Truman State University campus. Explore the eastern side of campus with its beautiful architecture and green spaces.",
          visible: true,
          color: "#3b82f6"
        },
        {
          originalPosition: new THREE.Vector3(-1, 0, 0), // -X (Left/West)
          title: "West View",
          description: "Looking west across the Truman State University campus. Discover the western side of campus and its scenic views.",
          visible: true,
          color: "#ef4444"
        },
        {
          originalPosition: new THREE.Vector3(0, 1, 0), // +Y (Up)
          title: "Sky View",
          description: "Looking up at the sky above Truman State University. Enjoy the beautiful Missouri sky and campus atmosphere.",
          visible: true,
          color: "#10b981"
        },
        {
          originalPosition: new THREE.Vector3(0, -1, 0), // -Y (Down)
          title: "Ground View",
          description: "Looking down at the ground of Truman State University. Explore the campus grounds and pathways.",
          visible: true,
          color: "#f59e0b"
        },
        {
          originalPosition: new THREE.Vector3(0, 0, 1), // +Z (Forward/North)
          title: "North View",
          description: "Looking north across the Truman State University campus. Experience the northern side of campus with its historic buildings.",
          visible: true,
          color: "#8b5cf6"
        },
        {
          originalPosition: new THREE.Vector3(0, 0, -1), // -Z (Backward/South)
          title: "South View",
          description: "Looking south across the Truman State University campus. Discover the southern side of campus and its modern facilities.",
          visible: true,
          color: "#ec4899"
        }
      ];
      
      // Project annotations onto the sphere boundary (from constants)
      const ANNOTATION_OFFSET = window.ANNOTATION_OFFSET || 2;
      annotations.forEach(annotation => {
        if (annotation.originalPosition) {
          // Normalize the direction vector
          annotation.direction = annotation.originalPosition.clone().normalize();
          // Position on sphere surface (slightly inside to avoid z-fighting)
          annotation.position = annotation.direction.clone().multiplyScalar(SKYBOX_RADIUS - ANNOTATION_OFFSET);
          console.log(`Annotation "${annotation.title}" positioned at:`, annotation.position);
        }
      });
        
      // Dialog box function
      const showDialogBox = (annotation) => {
        let dialogBox = document.getElementById('dialogBox');
        if (!dialogBox) {
          dialogBox = document.createElement('div');
          dialogBox.id = 'dialogBox';
          document.body.appendChild(dialogBox);
        }
        
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
        
        setTimeout(() => {
          dialogBox.classList.add('show');
          
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
        
        window.closeDialogBox = () => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          dialogBox.classList.remove('show');
          setTimeout(() => {
            dialogBox.innerHTML = '';
          }, 300);
        };
        
        dialogBox.addEventListener('click', (e) => {
          if (e.target === dialogBox) {
            window.closeDialogBox();
          }
        });
        
        const escapeHandler = (e) => {
          if (e.key === 'Escape') {
            window.closeDialogBox();
            document.removeEventListener('keydown', escapeHandler);
          }
        };
        document.addEventListener('keydown', escapeHandler);
      };
      
      const createAnnotationMarkers = () => {
        // Clear any existing sprites
        annotationSprites.forEach(sprite => {
          scene.remove(sprite);
          if (sprite.material) {
            sprite.material.map?.dispose();
            sprite.material.dispose();
          }
        });
        annotationSprites = [];
        
        annotations.forEach((annotation, index) => {
          const position = annotation.position;
          
          // Create dotted marker (circle with dots pattern)
          const size = 128;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          ctx.clearRect(0, 0, size, size);
          
          // Outer ring (dotted pattern)
          const outerRadius = 20;
          const dotCount = 16;
          ctx.strokeStyle = annotation.color;
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]); // Dotted line
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, outerRadius, 0, Math.PI * 2);
          ctx.stroke();
          
          // Inner filled circle
          ctx.setLineDash([]); // Solid line
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, 12, 0, Math.PI * 2);
          ctx.fillStyle = annotation.color;
          ctx.fill();
          
          // Center dot
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          
          // Pulsing glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = annotation.color;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, 8, 0, Math.PI * 2);
          ctx.fillStyle = annotation.color;
          ctx.fill();
          
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          
          const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true, 
            depthTest: true,
            depthWrite: false,
            alphaTest: 0.1
          });
          const sprite = new THREE.Sprite(material);
          sprite.position.copy(position);
          sprite.scale.set(4.0, 4.0, 1); // Slightly larger for better visibility
          sprite.renderOrder = 999;
          sprite.userData = { annotationIndex: index, annotation: annotation };
          scene.add(sprite);
          annotationSprites.push(sprite);
        });
        
        console.log(`✅ Created ${annotationSprites.length} annotation markers in 6 directions`);
      };
      
      const onAnnotationHover = (sprite, hovering) => {
        if (!sprite) return;
        isHovering = hovering;
        if (hovering) {
          sprite.scale.set(3.5, 3.5, 1);
          renderer.domElement.style.cursor = 'pointer';
          hoveredAnnotation = sprite;
          
          const annotation = sprite.userData.annotation;
          showTooltip(annotation.title);
          
          const annotationOverlay = document.getElementById('annotationMessage');
          if (annotationOverlay) {
            annotationOverlay.textContent = annotation.title;
            annotationOverlay.style.display = 'block';
            annotationOverlay.style.opacity = '1';
            annotationOverlay.classList.add('show');
          }
        } else {
          sprite.scale.set(2.5, 2.5, 1);
          renderer.domElement.style.cursor = 'default';
          hoveredAnnotation = null;
          hideTooltip();
          
          const annotationOverlay = document.getElementById('annotationMessage');
          if (annotationOverlay) {
            annotationOverlay.style.opacity = '0';
            annotationOverlay.classList.remove('show');
            setTimeout(() => {
              if (annotationOverlay.style.opacity === '0') {
                annotationOverlay.style.display = 'none';
              }
            }, 300);
          }
        }
      };
      
      const onAnnotationClick = (sprite) => {
        const annotation = sprite.userData.annotation;
        console.log('✅ Annotation clicked:', annotation.title);
        showDialogBox(annotation);
        
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
        hideTooltip();
        
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
        
        const updateTooltipPosition = (event) => {
          tooltip.style.left = (event.clientX + 15) + 'px';
          tooltip.style.top = (event.clientY - 30) + 'px';
        };
        
        document.addEventListener('mousemove', updateTooltipPosition);
        tooltip.updatePosition = updateTooltipPosition;
        
        setTimeout(() => {
          tooltip.style.opacity = '1';
        }, 10);
      };
      
      const hideTooltip = () => {
        const tooltip = document.getElementById('annotation-tooltip');
        if (tooltip) {
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
        
        if (annotationSprites.length > 0) {
          const intersects = raycaster.intersectObjects(annotationSprites, true);
          
          if (intersects.length > 0) {
            const intersectedSprite = intersects[0].object;
            if (hoveredAnnotation !== intersectedSprite) {
              if (hoveredAnnotation) {
                onAnnotationHover(hoveredAnnotation, false);
              }
              onAnnotationHover(intersectedSprite, true);
            }
            hovering = true;
          }
        }
        
        if (!hovering && hoveredAnnotation) {
          onAnnotationHover(hoveredAnnotation, false);
          renderer.domElement.style.cursor = 'default';
          hideTooltip();
          hoveredAnnotation = null;
        }
        
        try {
          if (skyboxMesh) {
            const skyboxIntersects = raycaster.intersectObject(skyboxMesh);
            
            if (skyboxIntersects.length > 0) {
              const intersectionPoint = skyboxIntersects[0].point;
              window.lastTargetPosition = intersectionPoint;
            } else {
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
        if (!raycaster || !mouse) return;
        
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        if (annotationSprites.length > 0) {
          const intersects = raycaster.intersectObjects(annotationSprites, true);
          if (intersects.length > 0) {
            const clickedSprite = intersects[0].object;
            onAnnotationClick(clickedSprite);
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
        
        // If clicked on annotation that was hovered
        if (hoveredAnnotation) {
          onAnnotationClick(hoveredAnnotation);
          event.preventDefault();
          event.stopPropagation();
        }
      };
      
      // Initialize raycaster and mouse
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      
      // Annotations will be created after skybox loads (in loadSkybox callback)
      // But we can set up event listeners now
      renderer.domElement.addEventListener('mousemove', onMouseMove, { passive: false });
      renderer.domElement.addEventListener('click', onMouseClick, { passive: false });
      renderer.domElement.addEventListener('mousedown', (e) => {
        console.log('✅ Mouse down on canvas');
      }, { passive: false });
      
      // Ensure canvas is interactive
      renderer.domElement.setAttribute('tabindex', '0');
      renderer.domElement.style.outline = 'none';
      
      console.log('✅ Event listeners attached to renderer canvas');

      // Skybox transition function
      const transitionToSkybox = (skyboxIndex) => {
        console.log(`Transitioning to skybox ${skyboxIndex}: ${skyboxConfigs[skyboxIndex].name}`);
        setIsTransitioning(true);
        
        // Clear existing annotations during transition
        annotationSprites.forEach(sprite => {
          scene.remove(sprite);
          if (sprite.material) {
            sprite.material.map?.dispose();
            sprite.material.dispose();
          }
        });
        annotationSprites = [];
        setCurrentSkybox(skyboxIndex);
        const newConfig = skyboxConfigs[skyboxIndex];
        
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
                
                try {
                  loadSkybox(
                    newConfig,
                    (newTexture) => {
                      console.log(`Successfully loaded skybox: ${newConfig.name}`);
                      if (skyboxMesh && skyboxMaterial) {
                        if (skyboxMaterial.uniforms && skyboxMaterial.uniforms.tCube) {
                          skyboxMaterial.uniforms.tCube.value = newTexture;
                        } else {
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
                      
                      // Recreate annotations for new skybox
                      createAnnotationMarkers();
                      
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

      // Animation loop
      let animationId;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();
        
        annotationSprites.forEach(sprite => {
          sprite.lookAt(camera.position);
        });
        
        if (hoveredAnnotation && isHovering) {
          const scale = 2.5 + Math.sin(Date.now() * 0.005) * 0.5;
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

      // Cleanup
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        
        hideTooltip();
        
        window.removeEventListener("resize", handleResize);
        if (renderer && renderer.domElement) {
          renderer.domElement.removeEventListener('mousemove', onMouseMove);
          renderer.domElement.removeEventListener('click', onMouseClick);
        }
        
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

// Make available globally - ensure it's set immediately
if (typeof window !== 'undefined') {
  window.SkyboxScene = SkyboxScene;
  console.log('✅ SkyboxScene component registered globally');
}

