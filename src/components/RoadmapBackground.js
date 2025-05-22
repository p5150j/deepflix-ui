import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import styled from 'styled-components';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const BGWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
`;

const BRAND_COLORS = [0x00ff9d, 0x00bfff, 0xa259ff, 0xff61d3, 0xffffff];
const NEON_LINE_COLOR = 0x00ffea;
const HDRI_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr';
const NETFLIX_GREEN = 0x00ff9d;

function getMetatronPoints() {
  const points = [];
  const C = new THREE.Vector3(0, 0, 0);
  points.push(C); // center
  const R1 = 0.7;
  const R2 = R1 * Math.sin(Math.PI / 3) / Math.sin(Math.PI / 6);
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 2 + i * Math.PI / 3;
    points.push(new THREE.Vector3(Math.cos(angle) * R1, Math.sin(angle) * R1, 0));
  }
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 2 + Math.PI / 6 + i * Math.PI / 3;
    points.push(new THREE.Vector3(Math.cos(angle) * R2, Math.sin(angle) * R2, 0));
  }
  return points;
}

function createGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(0,255,234,1)');
  gradient.addColorStop(0.5, 'rgba(0,255,234,0.4)');
  gradient.addColorStop(1, 'rgba(0,255,234,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.Texture(canvas);
}

const MetatronBackground = () => {
  const mountRef = useRef(null);
  const animationRef = useRef();
  const linesRef = useRef([]);
  const pointsObjRef = useRef();

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 2.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 10);
    scene.add(dirLight);
    const movingPoint = new THREE.PointLight(0xffffff, 1.5, 0);
    movingPoint.position.set(-5, -5, 10);
    scene.add(movingPoint);

    // Metatron's Cube geometry
    const points = getMetatronPoints();
    const N = points.length;

    // Draw all 13 circles (chrome torus meshes)
    const torusMaterial = new THREE.MeshPhysicalMaterial({
      color: NETFLIX_GREEN,
      metalness: 1,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      reflectivity: 1,
      transmission: 0.1,
      transparent: true,
      opacity: 0.95,
      envMapIntensity: 1.2,
      emissive: 0x111111,
      emissiveIntensity: 0.2,
    });
    for (let i = 0; i < N; i++) {
      let d = Infinity;
      for (let j = 0; j < N; j++) {
        if (i !== j) {
          const dist = points[i].distanceTo(points[j]);
          if (dist > 0.1 && dist < d) d = dist;
        }
      }
      const mat = torusMaterial.clone();
      mat.color.set(NETFLIX_GREEN);
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(d, 0.02, 32, 128),
        mat
      );
      torus.position.copy(points[i]);
      torus.renderOrder = 1;
      scene.add(torus);
    }

    // Draw all lines between points (on top, much thicker)
    const lines = [];
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const positions = [
          points[i].x, points[i].y, points[i].z,
          points[j].x, points[j].y, points[j].z
        ];
        const geometry = new LineGeometry();
        geometry.setPositions(positions);
        const material = new LineMaterial({
          color: NETFLIX_GREEN, // Netflix green
          linewidth: 0.7, // ultra thick
          transparent: true,
          opacity: 1.0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
        });
        material.resolution.set(window.innerWidth, window.innerHeight);
        const line = new Line2(geometry, material);
        line.computeLineDistances();
        line.renderOrder = 2;
        scene.add(line);
        lines.push(line);
      }
    }
    linesRef.current = lines;

    // Load HDRI environment map for chrome reflections
    new RGBELoader().setDataType(THREE.FloatType).load(HDRI_URL, (hdrEquirect) => {
      hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = hdrEquirect;
      scene.background = null;
    });

    // Animation loop: slow rotation, dramatic moving light
    let t = 0;
    function animate() {
      t += 0.008;
      scene.rotation.z = Math.sin(t / 2) * 0.08;
      scene.rotation.x = Math.cos(t / 3) * 0.07;
      scene.rotation.y = Math.sin(t / 4) * 0.09;
      movingPoint.position.x = Math.sin(t) * 8;
      movingPoint.position.y = Math.cos(t / 2) * 8;
      movingPoint.position.z = 10 + Math.sin(t / 3) * 2;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    }
    animate();

    // Responsive resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      linesRef.current.forEach(line => {
        if (line.material && line.material.resolution) {
          line.material.resolution.set(window.innerWidth, window.innerHeight);
        }
      });
    };
    window.addEventListener('resize', handleResize);
    lines.forEach(line => {
      if (line.material && line.material.resolution) {
        line.material.resolution.set(window.innerWidth, window.innerHeight);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
    };
  }, []);

  return <BGWrapper ref={mountRef} />;
};

export default MetatronBackground; 