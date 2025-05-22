import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// eslint-disable-next-line no-unused-vars
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
// eslint-disable-next-line no-unused-vars
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ThreeJSAnimation = () => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // DEEPFLIX green - original vibrant color
    const DEEPFLIX_GREEN = 0x00ff9d;
    
    // Configurable material options for brain model
    const brainConfig = {
      useOriginalMaterial: true,  // Keep original material but tint it
      // Custom material settings - only used when useOriginalMaterial is false
      color: DEEPFLIX_GREEN,    // Match DEEPFLIX green branding
      emissiveColor: new THREE.Color(DEEPFLIX_GREEN).multiplyScalar(0.8), // Slight glow color
      emissiveIntensity: 0.5,
      roughness: 0.9,
      metalness: 0.3,
      opacity: 0.9,
      transparent: true,
      wireframe: false,     // Set to true for wireframe visualization
      // Tint settings - applied to original material when useOriginalMaterial is true
      tintColor: DEEPFLIX_GREEN,  // DEEPFLIX green tint
      tintIntensity: 0.7    // Stronger intensity to match branding better
    };
    
    // Scene - completely transparent
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      60, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 20;
    
    // Renderer with transparency
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      premultipliedAlpha: false
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Completely transparent
    
    // Important for modern Three.js
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    const rendererDomElement = renderer.domElement;
    mountRef.current.appendChild(rendererDomElement);
    
    // Create particles that will emanate from the brain
    const createBrainParticles = () => {
      const particleCount = 500; // Increased particle count
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);
      const particleVelocities = []; // Store velocity for each particle
      
      // Create particles in a brain-shaped distribution
      // (they'll initially be in a sphere around the brain's position)
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random position in a sphere, closer to the brain
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 2 + Math.random() * 1.5; // Smaller radius to start from brain
        
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = radius * Math.cos(phi);
        
        // Varied sizes - smaller for better effect
        particleSizes[i] = 0.05 + Math.random() * 0.15;
        
        // Store velocity for each particle - direction outward from center
        particleVelocities.push({
          x: particlePositions[i3] * (0.003 + Math.random() * 0.005),
          y: particlePositions[i3 + 1] * (0.003 + Math.random() * 0.005),
          z: particlePositions[i3 + 2] * (0.003 + Math.random() * 0.005)
        });
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
      
      // Simple point material with texture
      const particleTexture = new THREE.TextureLoader().load(
        (() => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 64;
          canvas.width = size;
          canvas.height = size;
          
          // Create a simple gradient for particles
          const gradient = ctx.createRadialGradient(
            size/2, size/2, 0,
            size/2, size/2, size/2
          );
          
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, size, size);
          
          return canvas.toDataURL();
        })()
      );
      
      // Create particles with the same color as the brain for consistency
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.3,
        map: particleTexture,
        transparent: true,
        color: brainConfig.color, // Match brain color
        alphaTest: 0.01,
        depthWrite: false
      });
      
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.userData = { 
        originalPositions: particlePositions.slice(),
        sizes: particleSizes.slice(),
        velocities: particleVelocities
      };
      
      return particles;
    };
    
// Remove the createElectricGlitches function completely
    
    // Create a brain model placeholder while we load the GLB
    const createEyeballModel = (position) => {
      const eyePlaceholder = new THREE.Group();
      
      // Create a placeholder for the eye while it loads
      const placeholderGeometry = new THREE.SphereGeometry(2, 16, 16);
      const placeholderMaterial = new THREE.MeshBasicMaterial({
        color: brainConfig.color,
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });
      const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
      eyePlaceholder.add(placeholder);
      
      // Position the eye holder at the specified position
      eyePlaceholder.position.copy(position);
      
      // Load the actual eye model
      const loader = new GLTFLoader();
      
      // Load the eye GLB model
      loader.load(
        'https://arusimagesforsite.s3.us-west-2.amazonaws.com/eye.glb', // Update this to your actual path
        (gltf) => {
          // Success callback
          const model = gltf.scene;
          
          // Scale and position the eyeball model
          model.scale.set(0.04, 0.04, 0.04); // Scale that works well for this model
          model.rotation.set(0, -Math.PI / 2, 0); 
          // No initial rotation set - will be controlled by mouse
          
          // Use original materials but tint them to maintain detail
          model.traverse((object) => {
            if (object.isMesh) {
              if (brainConfig.useOriginalMaterial) {
                // Use original material from GLB but apply tinting
                if (object.material) {
                  // Clone the original material to avoid modifying the cached material
                  const origMaterial = object.material.clone();
                  
                  // Store original color
                  const origColor = origMaterial.color ? origMaterial.color.clone() : new THREE.Color(0xcccccc);
                  
                  // Blend original color with tint color based on tintIntensity
                  const tintColor = new THREE.Color(brainConfig.tintColor);
                  const blendedColor = new THREE.Color().copy(origColor)
                    .lerp(tintColor, brainConfig.tintIntensity);
                  
                  // Apply blended color
                  origMaterial.color = blendedColor;
                  
                  // Add slight emissive glow of the tint color if it doesn't have one
                  if (!origMaterial.emissive) {
                    origMaterial.emissive = new THREE.Color(brainConfig.tintColor).multiplyScalar(0.2);
                  }
                  
                  // Apply the modified original material
                  object.material = origMaterial;
                }
              } else {
                // Apply custom material based on config
                object.material = new THREE.MeshStandardMaterial({
                  color: brainConfig.color,
                  transparent: brainConfig.transparent,
                  opacity: brainConfig.opacity,
                  emissive: brainConfig.emissiveColor,
                  emissiveIntensity: brainConfig.emissiveIntensity,
                  roughness: brainConfig.roughness,
                  metalness: brainConfig.metalness,
                  wireframe: brainConfig.wireframe
                });
              }
            }
          });
          
          // Remove placeholder and add the real model
          eyePlaceholder.remove(placeholder);
          eyePlaceholder.add(model);
        },
        (xhr) => {
          // Progress callback
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          // Error callback
          console.error('An error happened loading the brain model:', error);
        }
      );
      
      return eyePlaceholder;
    };

    


    
    
    // Initialize all scene components
    const brainParticles = createBrainParticles();
    
    // Create two eyes with proper spacing
    const leftEyePosition = new THREE.Vector3(-5, 0, 0);
    const rightEyePosition = new THREE.Vector3(5, 0, 0);
    
    const leftEye = createEyeballModel(leftEyePosition);
    const rightEye = createEyeballModel(rightEyePosition);
    
    // Create main group to hold everything
    const mainGroup = new THREE.Group();
    mainGroup.add(brainParticles);
    mainGroup.add(leftEye);
    mainGroup.add(rightEye);
    scene.add(mainGroup);
    
    // Add enhanced lighting setup to highlight brain details
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Reduced ambient to increase contrast
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increased intensity
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true; // Enable shadows if your renderer supports it
    scene.add(directionalLight);
    
    // Add rim lighting to highlight brain contours - match brain color
    const rimLight1 = new THREE.DirectionalLight(brainConfig.color, 0.6);
    rimLight1.position.set(-5, 2, -3);
    scene.add(rimLight1);
    
    const rimLight2 = new THREE.DirectionalLight(brainConfig.color, 0.6);
    rimLight2.position.set(5, -2, -3);
    scene.add(rimLight2);
    
    // Add enhanced point lights to highlight brain details
    const addEyeLights = (eyeModel) => {
      const colors = [
        new THREE.Color(brainConfig.color).multiplyScalar(1.8),
        new THREE.Color(brainConfig.color).multiplyScalar(1.0),
        new THREE.Color(brainConfig.color).multiplyScalar(1.4),
        new THREE.Color(0xffffff).multiplyScalar(0.6)  // Add white light for detail visibility
      ];
      
      colors.forEach((color, index) => {
        const pointLight = new THREE.PointLight(color, 1.2, 15);
        const angle = (index / colors.length) * Math.PI * 2;
        const radius = 4;
        
        // Vary height positions for better coverage
        const yPosition = (index % 2 === 0) ? 2 : -2;
        
        pointLight.position.set(
          Math.cos(angle) * radius,
          yPosition + Math.sin(angle) * (radius/2),
          Math.sin(angle) * radius
        );
        
        eyeModel.add(pointLight);
      });
      
      // Add a spotlight from the top to highlight brain crevices and folds
      const spotLight = new THREE.SpotLight(brainConfig.color, 2.0, 20, Math.PI / 6, 0.5, 1);
      spotLight.position.set(0, 8, 0);
      spotLight.target.position.set(0, 0, 0);
      eyeModel.add(spotLight);
      eyeModel.add(spotLight.target);
    };
    
    // Apply lights to each eye
    addEyeLights(leftEye);
    addEyeLights(rightEye);
    
    // Create mouse tracking variables
    const mouse = new THREE.Vector2();
    // eslint-disable-next-line no-unused-vars
    const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    
    // Mouse move event handler
    const handleMouseMove = (event) => {
      // Calculate normalized mouse position (-1 to 1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation
    const clock = new THREE.Clock();
    
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      // eslint-disable-next-line no-unused-vars
      const time = clock.getElapsedTime();
      
      // Animate particles - make them emanate from the brain
      const positions = brainParticles.geometry.attributes.position.array;
      const velocities = brainParticles.userData.velocities;
      
      for (let i = 0; i < positions.length/3; i++) {
        const i3 = i * 3;
        
        // Apply velocity to each particle
        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;
        
        // Distance from center
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        const dist = Math.sqrt(x*x + y*y + z*z);
        
        // Reset particles that drift too far
        if (dist > 15) {
          // Reset to random position close to brain surface
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = 2 + Math.random() * 0.5; // Start close to brain
          
          positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = radius * Math.cos(phi);
          
          // Give slight random variance to velocities when resetting
          velocities[i].x = positions[i3] * (0.003 + Math.random() * 0.005);
          velocities[i].y = positions[i3 + 1] * (0.003 + Math.random() * 0.005);
          velocities[i].z = positions[i3 + 2] * (0.003 + Math.random() * 0.005);
        }
        
        // Slightly fade particles further from brain by reducing their opacity
        if (brainParticles.geometry.attributes.size) {
          const sizes = brainParticles.geometry.attributes.size.array;
          // Gradually reduce size based on distance
          const normalizedDist = Math.min(dist / 15, 1);
          sizes[i] = 0.15 * (1 - (normalizedDist * 0.7));
        }
      }
      
      brainParticles.geometry.attributes.position.needsUpdate = true;
      if (brainParticles.geometry.attributes.size) {
        brainParticles.geometry.attributes.size.needsUpdate = true;
      }
      
      // No auto-rotation - use mouse position to rotate both eyes models
      // Apply smooth rotation based on mouse position
      const eyeModels = [leftEye, rightEye];
      
      eyeModels.forEach(eye => {
        if (eye) {
          // Target rotation based on mouse position - limited range of movement
          const targetRotationY = (mouse.x * 0.5); // Horizontal rotation based on mouse X
          const targetRotationX = -mouse.y * 0.3; // Inverted vertical rotation
          
          // Smooth interpolation to target rotation
          eye.rotation.y += (targetRotationY - eye.rotation.y) * 0.05;
          eye.rotation.x += (targetRotationX - eye.rotation.x) * 0.05;
        }
      });
      
      // No more scene rotation
      // mainGroup.rotation.y = Math.sin(time * 0.02) * 0.05; // Removed automatic rotation
      
      // Animate electric glitches/lightning
    //   electricGlitches.children.forEach(lightning => {
    //     const data = lightning.userData;
        
    //     // Determine if this lightning should be active
    //     if (Math.random() < 0.03) { // Increased chance (3%) for more frequent lightning
    //       data.active = true;
    //       data.timeActive = 0;
          
    //       // Randomize the path slightly each time it activates
    //       const lightningPoints = lightning.geometry.attributes.position;
    //       const originalPoints = data.startPoints;
          
    //       for (let i = 0; i < originalPoints.length; i++) {
    //         const idx = i * 3;
    //         const jitter = data.jitterAmount;
            
    //         // Apply jitter to all points except the first one (which stays anchored to brain)
    //         if (i > 0) {
    //           lightningPoints.array[idx] = originalPoints[i].x + (Math.random() - 0.5) * jitter;
    //           lightningPoints.array[idx + 1] = originalPoints[i].y + (Math.random() - 0.5) * jitter;
    //           lightningPoints.array[idx + 2] = originalPoints[i].z + (Math.random() - 0.5) * jitter;
    //         }
    //       }
          
    //       lightningPoints.needsUpdate = true;
    //     }
        
    //     // Handle active lightning
    //     if (data.active) {
    //       // Use frame delta time instead of clock.getDelta()
    //       const frameDelta = 1/60; // Approximate for consistent speed
    //       data.timeActive = (data.timeActive || 0) + frameDelta;
          
    //       // Fade out based on lifespan
    //       const fadeRatio = Math.min(data.timeActive / data.lifespan, 1);
    //       lightning.material.opacity = Math.max(0, 1 - fadeRatio);
          
    //       // Apply pulse effect by manipulating the color brightness
    //       const pulseIntensity = 1.2 + Math.sin(time * 20) * 0.7; // Increased intensity for brighter pulses
    //       lightning.material.color.copy(data.color).multiplyScalar(pulseIntensity);
          
    //       // Deactivate after lifespan is complete
    //       if (data.timeActive > data.lifespan) {
    //         data.active = false;
    //         lightning.material.opacity = 0;
    //       }
    //     } else {
    //       // Ensure inactive lightning is invisible
    //       lightning.material.opacity = 0;
    //     }
    //   });
      
      // Update for mouse-following (no more controls.update())
      
      // Render the scene directly
      renderer.render(scene, camera);
      
      return animationId;
    };
    
    const animationId = animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      
      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      // Dispose renderer
      renderer.dispose();
      
      // Remove canvas from DOM
      if (rendererDomElement.parentNode) {
        rendererDomElement.parentNode.removeChild(rendererDomElement);
      }
    };
  }, []);
  
  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2,
        pointerEvents: 'auto', // Allow interaction with the canvas
        backgroundColor: 'transparent'
      }} 
    />
  );
};

export default ThreeJSAnimation;