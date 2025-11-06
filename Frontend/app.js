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
          "/public/images/posx.jpg", "/public/images/negx.jpg",
          "/public/images/posy.jpg", "/public/images/negy.jpg",
          "/public/images/posz.jpg", "/public/images/negz.jpg"
        ]
      },
      {
        name: "Football Field",
        images: [
          "/public/field-skyboxes 2/Footballfield2/posx.jpg", "/public/field-skyboxes 2/Footballfield2/negx.jpg",
          "/public/field-skyboxes 2/Footballfield2/posy.jpg", "/public/field-skyboxes 2/Footballfield2/negy.jpg",
          "/public/field-skyboxes 2/Footballfield2/posz.jpg", "/public/field-skyboxes 2/Footballfield2/negz.jpg"
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
  
      // Skybox configuration - using actual mesh geometry instead of scene.background
      const SKYBOX_RADIUS = 500;
      let skyboxMesh = null;
      let skyboxMaterial = null;
      
      // Create skybox geometry and material (will be updated with texture)
      const skyboxGeometry = new THREE.SphereGeometry(SKYBOX_RADIUS, 64, 64);
      skyboxMaterial = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        depthWrite: false
      });
      skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      scene.add(skyboxMesh);
      
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
          // Apply cube texture to skybox material using custom shader
          // Cube textures need proper sampling - use ShaderMaterial for direct display
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
              tCube: { value: texture },
              cameraPosition: { value: camera.position }
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
      let interactivePolygons = [];
      let cameraMarkers = [];
      
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
          color: "#3b82f6",
          createPolygon: true, // Auto-generate polygon for this annotation
          polygonSize: 2.5 // Size of the auto-generated polygon
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
      
      // Convert original positions to direction vectors for skybox placement
      annotations.forEach(annotation => {
        if (annotation.originalPosition) {
          // Normalize the original position to get direction, then scale to skybox radius
          annotation.direction = annotation.originalPosition.clone().normalize();
        }
      });
      
      // =============================================================
      // 3D POLYGON EXPERIMENT: RIGHT GOAL POST ANNOTATION TEST
      // =============================================================
      
      // Utility: Create 2D Polygon Geometry on Spherical Surface
      // Projects 3D points onto a sphere surface, creates 2D shape, then maps back to sphere
      function createAnnotationPolygon(points3D, color = 0xff8800, name = 'Zone', annotationData = null) {
        // Step 1: Find centroid of points and normalize to sphere surface
        const centroid = new THREE.Vector3();
        points3D.forEach(p => centroid.add(p));
        centroid.divideScalar(points3D.length);
        centroid.normalize().multiplyScalar(SKYBOX_RADIUS);
        
        // Step 2: Create tangent plane coordinate system at centroid
        const normal = centroid.clone().normalize();
        const tangent1 = new THREE.Vector3();
        const tangent2 = new THREE.Vector3();
        
        // Choose perpendicular vector for tangent1
        if (Math.abs(normal.x) > 0.9) {
          tangent1.set(0, 1, 0);
        } else {
          tangent1.set(1, 0, 0);
        }
        
        // Create orthogonal tangent vectors
        tangent1.cross(normal).normalize();
        tangent2.crossVectors(normal, tangent1).normalize();
        
        // Step 3: Project 3D points onto tangent plane (2D coordinates)
        const projectedPoints = points3D.map(point => {
          const localPoint = point.clone().sub(centroid);
          return new THREE.Vector2(
            localPoint.dot(tangent1),
            localPoint.dot(tangent2)
          );
        });
        
        // Step 4: Create 2D shape
        const shape = new THREE.Shape();
        if (projectedPoints.length > 0) {
          shape.moveTo(projectedPoints[0].x, projectedPoints[0].y);
          for (let i = 1; i < projectedPoints.length; i++) {
            shape.lineTo(projectedPoints[i].x, projectedPoints[i].y);
          }
          shape.lineTo(projectedPoints[0].x, projectedPoints[0].y); // Close the shape
        }
        
        // Step 5: Generate geometry from shape
        const geometry = new THREE.ShapeGeometry(shape);
        
        // Step 6: Transform vertices back to sphere surface
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          
          // Convert from 2D plane coordinates back to 3D
          const worldPos = centroid.clone()
            .add(tangent1.clone().multiplyScalar(x))
            .add(tangent2.clone().multiplyScalar(y));
          
          // Project onto sphere surface (slightly inside to avoid z-fighting)
          worldPos.normalize().multiplyScalar(SKYBOX_RADIUS - 0.5);
          
          positions.setXYZ(i, worldPos.x, worldPos.y, worldPos.z);
        }
        
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Step 7: Create material
        const material = new THREE.MeshBasicMaterial({
          color: color,
          opacity: 0.25,
          transparent: true,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: false
        });
        
        // Step 8: Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        mesh.renderOrder = 997; // Render before sprites but after skybox
        mesh.userData.defaultOpacity = 0.25;
        mesh.userData.hoverOpacity = 0.7;
        if (annotationData) {
          mesh.userData.annotation = annotationData;
        }
        
        scene.add(mesh);
        interactivePolygons.push(mesh);
        return mesh;
      }
      
      // Create camera position markers with labels
      function createCameraMarkers(positions, color = 0xff0000) {
        const markers = [];
        positions.forEach((pos, i) => {
          // Create sphere marker
          const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
          const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.9
          });
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.copy(pos);
          marker.renderOrder = 998;
          scene.add(marker);
          
          // Create label element
          const label = document.createElement('div');
          label.textContent = `Cam ${i + 1}`;
          label.style.position = 'absolute';
          label.style.color = '#ff4444';
          label.style.fontSize = '12px';
          label.style.fontWeight = 'bold';
          label.style.fontFamily = 'monospace';
          label.style.background = 'rgba(0, 0, 0, 0.7)';
          label.style.padding = '2px 6px';
          label.style.borderRadius = '4px';
          label.style.pointerEvents = 'none';
          label.style.zIndex = '10000';
          label.style.display = 'none';
          document.body.appendChild(label);
          
          marker.userData.label = label;
          markers.push(marker);
        });
        return markers;
      }
      
      // Helper: Create polygon corners around an annotation point
      // Creates a square polygon centered on the annotation direction
      function createPolygonCornersFromAnnotation(annotation, size = 2.0) {
        // Get the annotation position on skybox
        const center = annotation.direction.clone().multiplyScalar(SKYBOX_RADIUS);
        const normal = annotation.direction.clone().normalize();
        
        // Create tangent plane coordinate system
        const tangent1 = new THREE.Vector3();
        const tangent2 = new THREE.Vector3();
        
        // Choose perpendicular vector for tangent1
        if (Math.abs(normal.x) > 0.9) {
          tangent1.set(0, 1, 0);
        } else {
          tangent1.set(1, 0, 0);
        }
        
        // Create orthogonal tangent vectors
        tangent1.cross(normal).normalize();
        tangent2.crossVectors(normal, tangent1).normalize();
        
        // Create 4 corners of a square polygon
        const halfSize = size / 2;
        const corners = [
          center.clone().add(tangent1.clone().multiplyScalar(-halfSize))
                .add(tangent2.clone().multiplyScalar(-halfSize)),
          center.clone().add(tangent1.clone().multiplyScalar(halfSize))
                .add(tangent2.clone().multiplyScalar(-halfSize)),
          center.clone().add(tangent1.clone().multiplyScalar(halfSize))
                .add(tangent2.clone().multiplyScalar(halfSize)),
          center.clone().add(tangent1.clone().multiplyScalar(-halfSize))
                .add(tangent2.clone().multiplyScalar(halfSize))
        ];
        
        // Project corners back onto sphere surface
        return corners.map(corner => {
          return corner.normalize().multiplyScalar(SKYBOX_RADIUS);
        });
      }
      
      // Initialize annotation polygons for all annotations that have polygon data
      function initializeAnnotationPolygons() {
        annotations.forEach((annotation, index) => {
          // Check if annotation has polygon corners defined
          if (annotation.polygonCorners && annotation.polygonCorners.length > 0) {
            // Use provided polygon corners
            const corners = annotation.polygonCorners.map(corner => {
              if (corner instanceof THREE.Vector3) {
                // If already a Vector3, normalize and scale to skybox radius
                return corner.clone().normalize().multiplyScalar(SKYBOX_RADIUS);
              } else if (Array.isArray(corner) && corner.length === 3) {
                // If array of coordinates, convert to Vector3
                return new THREE.Vector3(corner[0], corner[1], corner[2])
                  .normalize().multiplyScalar(SKYBOX_RADIUS);
              }
              return null;
            }).filter(corner => corner !== null);
            
            if (corners.length >= 3) {
              const polygonColor = parseInt(annotation.color.replace('#', ''), 16);
              createAnnotationPolygon(
                corners,
                polygonColor,
                `${annotation.title} Zone`,
                annotation
              );
            }
          } else if (annotation.createPolygon !== false) {
            // Auto-generate polygon for annotations (default: enabled for first annotation)
            // Can be disabled by setting createPolygon: false
            if (index === 0 || annotation.createPolygon === true) {
              const polygonSize = annotation.polygonSize || 2.0;
              const corners = createPolygonCornersFromAnnotation(annotation, polygonSize);
              const polygonColor = parseInt(annotation.color.replace('#', ''), 16);
              createAnnotationPolygon(
                corners,
                polygonColor,
                `${annotation.title} Zone`,
                annotation
              );
            }
          }
        });
      }
      
      // Initialize Right Goal Post Polygon (Experimental - with specific corners)
      function initializeRightGoalPostPolygon() {
        // Goal Post Polygon: 4 Corners (Mouse Target Coordinates)
        // These are raw world coordinates - convert to direction vectors, then scale to SKYBOX_RADIUS
        const rawCorners = [
          new THREE.Vector3(480.32, 400.77, -775.46),
          new THREE.Vector3(426.38, -6.41, -900.07),
          new THREE.Vector3(431.15, 14.92, -897.73),
          new THREE.Vector3(524, -13.42, -846.56),
        ];
        
        // Convert raw coordinates to direction vectors, then scale to skybox radius
        const goalPostCorners = rawCorners.map(corner => {
          return corner.clone().normalize().multiplyScalar(SKYBOX_RADIUS);
        });
        
        // Find existing Right Goal Post annotation
        const rightGoalPostAnnotation = annotations.find(ann => ann.title === "The Right Goal Post");
        if (rightGoalPostAnnotation) {
          // Store polygon corners in annotation for reference
          rightGoalPostAnnotation.polygonCorners = goalPostCorners;
          
          const polygonColor = parseInt(rightGoalPostAnnotation.color.replace('#', ''), 16);
          createAnnotationPolygon(
            goalPostCorners, 
            polygonColor, 
            'Right Goal Post Zone',
            rightGoalPostAnnotation
          );
        }
        
        // Camera positions for recorded viewpoints
        const cameraPositions = [
          new THREE.Vector3(0.42, 0.02, 4.98),
          new THREE.Vector3(0.97, -0.03, 4.91),
          new THREE.Vector3(0.97, 0.30, 4.90),
          new THREE.Vector3(0.42, 0.28, 4.97),
        ];
        
        // Create camera markers
        cameraMarkers = createCameraMarkers(cameraPositions, 0xff0000);
        
        return { markers: cameraMarkers };
      }
      
      const createAnnotationMarkers = () => {
        // Create sprites for each annotation with unique colors
        annotations.forEach((annotation, index) => {
          // Convert direction vector to position on skybox surface
          const position = annotation.direction.clone().multiplyScalar(SKYBOX_RADIUS);
          
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
          sprite.position.copy(position);
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
        
        // Check for polygon intersections
        if (interactivePolygons.length > 0 && !hovering) {
          const polygonIntersects = raycaster.intersectObjects(interactivePolygons, true);
          
          if (polygonIntersects.length > 0) {
            const intersectedPolygon = polygonIntersects[0].object;
            const material = intersectedPolygon.material;
            
            // Only update if it's a different polygon or not already highlighted
            if (hoveredAnnotation !== intersectedPolygon || material.opacity !== intersectedPolygon.userData.hoverOpacity) {
              // Reset previously hovered polygon if different
              if (hoveredAnnotation && hoveredAnnotation !== intersectedPolygon && 
                  hoveredAnnotation.material && hoveredAnnotation.userData.defaultOpacity !== undefined) {
                hoveredAnnotation.material.opacity = hoveredAnnotation.userData.defaultOpacity;
              }
              
              // Highlight polygon on hover
              material.opacity = intersectedPolygon.userData.hoverOpacity;
              renderer.domElement.style.cursor = 'pointer';
              
              // Show tooltip if polygon has annotation data
              if (intersectedPolygon.userData.annotation) {
                showTooltip(intersectedPolygon.userData.annotation.title);
              } else {
                showTooltip(intersectedPolygon.name);
              }
              
              hoveredAnnotation = intersectedPolygon;
              hovering = true;
            }
          } else {
            // Only reset polygons if we're not hovering over one (avoid clearing on click)
            if (!hoveredAnnotation || !(hoveredAnnotation.material && hoveredAnnotation.userData.defaultOpacity !== undefined)) {
              // Reset all polygons to default opacity
              interactivePolygons.forEach(polygon => {
                if (polygon.material.opacity !== polygon.userData.defaultOpacity) {
                  polygon.material.opacity = polygon.userData.defaultOpacity;
                }
              });
            }
          }
        }
        
        // Reset hover state if nothing is hovered (but preserve polygon state during clicks)
        if (!hovering && hoveredAnnotation) {
          // Check if it's a polygon - only reset if mouse truly moved away
          if (hoveredAnnotation.material && hoveredAnnotation.userData.defaultOpacity !== undefined) {
            // It's a polygon - check if we're still intersecting
            const polygonIntersects = raycaster.intersectObjects([hoveredAnnotation], true);
            if (polygonIntersects.length === 0) {
              // Only reset if we're not intersecting anymore
              hoveredAnnotation.material.opacity = hoveredAnnotation.userData.defaultOpacity;
              renderer.domElement.style.cursor = 'default';
              hideTooltip();
              hoveredAnnotation = null;
            }
          } else if (hoveredAnnotation.scale) {
            // It's a sprite annotation
            onAnnotationHover(hoveredAnnotation, false);
            renderer.domElement.style.cursor = 'default';
            hideTooltip();
            hoveredAnnotation = null;
          }
        }
        
        // Calculate target coordinates using raycasting against actual skybox mesh
        // This ensures accurate positioning based on camera's viewing direction
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
        if (hoveredAnnotation) {
          // Check if it's a polygon with annotation data
          if (hoveredAnnotation.userData && hoveredAnnotation.userData.annotation) {
            // Keep polygon highlighted during animation
            const polygon = hoveredAnnotation;
            // Animate camera to annotation
            animateCameraToAnnotation(hoveredAnnotation.userData.annotation);
            // Ensure polygon stays highlighted (mouse might have moved slightly during click)
            if (polygon.material && polygon.userData.hoverOpacity !== undefined) {
              polygon.material.opacity = polygon.userData.hoverOpacity;
            }
          } else if (hoveredAnnotation.scale) {
            // It's a sprite annotation
            if (isHovering) onAnnotationClick(hoveredAnnotation);
          }
        }
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
              ${annotation.originalPosition ? `
                <strong>Original Position:</strong><br>
                X: ${annotation.originalPosition.x.toFixed(2)}<br>
                Y: ${annotation.originalPosition.y.toFixed(2)}<br>
                Z: ${annotation.originalPosition.z.toFixed(2)}<br>
              ` : ''}
              <strong>Direction Vector:</strong><br>
              X: ${annotation.direction.x.toFixed(3)}<br>
              Y: ${annotation.direction.y.toFixed(3)}<br>
              Z: ${annotation.direction.z.toFixed(3)}<br>
              <strong>Position (on skybox):</strong><br>
              X: ${(annotation.direction.x * SKYBOX_RADIUS).toFixed(2)}<br>
              Y: ${(annotation.direction.y * SKYBOX_RADIUS).toFixed(2)}<br>
              Z: ${(annotation.direction.z * SKYBOX_RADIUS).toFixed(2)}
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
      
      // Initialize annotation polygons (including auto-generated ones)
      initializeAnnotationPolygons();
      
      // Initialize Right Goal Post Polygon (with specific corners from mouse targets)
      initializeRightGoalPostPolygon();
      
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
                              tCube: { value: newTexture },
                              cameraPosition: { value: camera.position }
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
        
        // Update shader material camera position uniform for proper cube texture sampling
        if (skyboxMaterial && skyboxMaterial.uniforms && skyboxMaterial.uniforms.cameraPosition) {
          skyboxMaterial.uniforms.cameraPosition.value.copy(camera.position);
        }
        
        // Make annotations always face camera (billboard behavior)
        annotationSprites.forEach(sprite => {
          sprite.lookAt(camera.position);
        });
        
        // Pulse animation while hovering over annotation (throttled)
        if (hoveredAnnotation && isHovering) {
          const scale = 2.5 + Math.sin(Date.now() * 0.005) * 0.5; // Match new base scale with subtle pulse
          hoveredAnnotation.scale.set(scale, scale, 1);
        }
        
        // Update camera marker label positions
        cameraMarkers.forEach(marker => {
          if (marker && marker.userData && marker.userData.label) {
            const vector = marker.position.clone().project(camera);
            // Check if marker is in front of camera
            if (vector.z < 1) {
              const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
              const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
              marker.userData.label.style.left = `${x}px`;
              marker.userData.label.style.top = `${y}px`;
              marker.userData.label.style.display = 'block';
            } else {
              marker.userData.label.style.display = 'none';
            }
          }
        });
        
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
          
          // Dispose of interactive polygons
          interactivePolygons.forEach(polygon => {
            if (polygon && polygon.geometry) {
              polygon.geometry.dispose();
            }
            if (polygon && polygon.material) {
              polygon.material.dispose();
            }
          });
          
          // Dispose of camera markers and their labels
          cameraMarkers.forEach(marker => {
            if (marker && marker.geometry) {
              marker.geometry.dispose();
            }
            if (marker && marker.material) {
              marker.material.dispose();
            }
            if (marker && marker.userData && marker.userData.label) {
              marker.userData.label.remove();
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
            <img src="/public/logo/logo.svg" alt="Truman State University" className="h-8 w-auto" />
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