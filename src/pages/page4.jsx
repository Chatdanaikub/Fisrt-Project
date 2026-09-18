import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

// Color finishes available for the 3D model
const COLOR_FINISHES = [
  {
    id: 'natural',
    name: 'Natural Titanium',
    thName: 'ไทเทเนียมธรรมชาติ',
    chassis: 0x8a8a8e,
    back: 0x6e6e73,
    ring: 0x9e9ea3,
    accent: '#9e9ea3',
    bgBadge: 'from-gray-400 to-slate-600',
  },
  {
    id: 'black',
    name: 'Obsidian Black',
    thName: 'ดำออบซิเดียน',
    chassis: 0x242426,
    back: 0x161617,
    ring: 0x3a3a3c,
    accent: '#48484a',
    bgBadge: 'from-gray-800 to-black',
  },
  {
    id: 'blue',
    name: 'Deep Ocean Blue',
    thName: 'น้ำเงินดีพโอเชียน',
    chassis: 0x1e3a5f,
    back: 0x132742,
    ring: 0x255085,
    accent: '#38bdf8',
    bgBadge: 'from-blue-600 to-indigo-900',
  },
  {
    id: 'violet',
    name: 'Cosmic Violet',
    thName: 'ม่วงคอสมิก',
    chassis: 0x4c2882,
    back: 0x301953,
    ring: 0x6b3bb8,
    accent: '#c084fc',
    bgBadge: 'from-purple-600 to-fuchsia-900',
  },
];

// Helper: Create rounded rectangle shape for smartphone body
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

// Helper: Generate dynamic OLED Screen canvas texture
function createScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // Background Cyber Nebula Gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 2048);
  grad.addColorStop(0, '#0a0a14');
  grad.addColorStop(0.35, '#1e1035');
  grad.addColorStop(0.7, '#0b2038');
  grad.addColorStop(1, '#05050a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 2048);

  // Glowing Nebula Orbs
  const drawGlow = (cx, cy, r, color, alpha) => {
    const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    radial.addColorStop(0, color);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  };

  drawGlow(350, 700, 450, '#818cf8', 0.4);
  drawGlow(750, 1100, 500, '#38bdf8', 0.35);
  drawGlow(250, 1400, 400, '#c084fc', 0.3);

  // Glass Ribbon Wave
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(100, 600);
  ctx.bezierCurveTo(400, 900, 200, 1300, 900, 1500);
  ctx.stroke();
  ctx.restore();

  // Top Status Bar
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.fillText('09:41', 120, 120);

  // 5G and Battery Icons on Right
  ctx.fillText('5G', 820, 120);
  ctx.strokeRect(880, 92, 54, 30);
  ctx.fillRect(884, 96, 42, 22);
  ctx.fillRect(934, 101, 4, 12);

  // Lockscreen Clock (Center Big)
  ctx.textAlign = 'center';
  ctx.font = '300 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('วันศุกร์ที่ 18 กันยายน', 512, 380);

  ctx.font = '800 190px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
  ctx.shadowBlur = 30;
  ctx.fillText('09:41', 512, 580);
  ctx.shadowBlur = 0;

  // Widget: Dynamic Quantum Weather & Battery
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.roundRect(140, 660, 744, 130, 32);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '600 34px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'left';
  ctx.fillText('⚡ TITANIUM AI CORE', 180, 725);
  ctx.font = '400 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('ระบบพร้อมทำงาน • ประสิทธิภาพ 100% • 5000 mAh', 180, 765);

  // Notifications Card (Glassmorphism)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.roundRect(140, 1200, 744, 160, 36);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.stroke();

  ctx.font = '700 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#a855f7';
  ctx.fillText('🚀 IG342 SHOWCASE 3D', 180, 1265);
  ctx.font = '400 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('เลื่อนหน้าจอลงเพื่อสำรวจชิ้นส่วน 3D ทุกองศา', 180, 1315);

  // Bottom Flash & Camera Icons
  const drawCircleIcon = (x, y, icon) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(icon, x, y);
  };
  drawCircleIcon(220, 1850, '🔦');
  drawCircleIcon(804, 1850, '📷');

  // Home Bar
  ctx.fillStyle = '#ffffff';
  ctx.roundRect(362, 1980, 300, 10, 5);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

// Helper: Generate Internal Neural Chip Canvas Texture
function createChipTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Carbon Motherboard Base
  ctx.fillStyle = '#0f1016';
  ctx.fillRect(0, 0, 1024, 1024);

  // Grid Circuit Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 1024; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // Golden Edge Connectors
  ctx.fillStyle = '#f59e0b';
  for (let i = 100; i < 924; i += 24) {
    ctx.fillRect(i, 20, 12, 40);
    ctx.fillRect(i, 964, 12, 40);
    ctx.fillRect(20, i, 40, 12);
    ctx.fillRect(964, i, 40, 12);
  }

  // Central Chip Die
  ctx.fillStyle = '#1e1b4b';
  ctx.roundRect(262, 262, 500, 500, 48);
  ctx.fill();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Chip Gold Text and Hologram
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '800 68px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('QUANTUM X1', 512, 470);

  ctx.fillStyle = '#e0e7ff';
  ctx.font = '600 36px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('3nm BIONIC NEURAL ENGINE', 512, 540);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '500 30px monospace';
  ctx.fillText('128-CORE APU • 120 TOPS', 512, 600);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function Page4() {
  const mountRef = useRef(null);
  const phoneGroupRef = useRef(null);
  const [modelScale, setModelScale] = useState(0.58);
  const [selectedColor, setSelectedColor] = useState(COLOR_FINISHES[0]);
  const [currentSection, setCurrentSection] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);

  // Audio Context for Sci-Fi Click SFX
  const audioCtxRef = useRef(null);
  const playSound = (type = 'click') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const now = audioCtxRef.current.currentTime;
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'whoosh') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(540, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      }
    } catch (e) {
      console.warn('Audio failed', e);
    }
  };

  // References for three.js objects to update on color change or scroll
  const materialsRef = useRef({
    chassis: null,
    backGlass: null,
    rings: [],
  });

  // Keep state refs for render loop
  const stateRef = useRef({
    scrollProgress: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragRotation: { x: 0, y: 0 },
  });

  // Update 3D materials when color changes
  useEffect(() => {
    if (materialsRef.current.chassis) {
      materialsRef.current.chassis.color.setHex(selectedColor.chassis);
    }
    if (materialsRef.current.backGlass) {
      materialsRef.current.backGlass.color.setHex(selectedColor.back);
    }
    materialsRef.current.rings.forEach((ringMat) => {
      ringMat.color.setHex(selectedColor.ring);
    });
    playSound('click');
  }, [selectedColor]);

  // Update scale whenever modelScale changes
  useEffect(() => {
    if (phoneGroupRef.current) {
      phoneGroupRef.current.scale.set(modelScale, modelScale, modelScale);
    }
  }, [modelScale]);

  // Main Three.js Scene Setup and Scroll Handler
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Setup for Ultra-Realistic Metallic Highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Light (Warm soft studio)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.8);
    keyLight.position.set(5, 7, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Cyan Rim Light (Cyber edge glint)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.2);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // Violet Bottom Up-light (Deep ambient luxury contrast)
    const bottomLight = new THREE.PointLight(0xa855f7, 2.5, 20);
    bottomLight.position.set(0, -5, 2);
    scene.add(bottomLight);

    // Top Overhead Light (Gleaming titanium rail)
    const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
    topLight.position.set(0, 8, 0);
    scene.add(topLight);

    // 3. Ground Soft Shadow Disc
    const groundGeo = new THREE.PlaneGeometry(12, 12);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // 4. Build The Smartphone Model (with scale applied)
    const phoneGroup = new THREE.Group();
    phoneGroupRef.current = phoneGroup;
    phoneGroup.scale.set(modelScale, modelScale, modelScale);
    scene.add(phoneGroup);

    // Dimensions
    const phoneW = 2.9;
    const phoneH = 5.9;
    const phoneD = 0.28;
    const cornerR = 0.46;

    // Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: selectedColor.chassis,
      metalness: 0.94,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });
    materialsRef.current.chassis = chassisMat;

    const backGlassMat = new THREE.MeshPhysicalMaterial({
      color: selectedColor.back,
      metalness: 0.1,
      roughness: 0.3,
      transmission: 0.2,
      thickness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.98,
    });
    materialsRef.current.backGlass = backGlassMat;

    const screenTexture = createScreenTexture();
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.12,
      metalness: 0.05,
      emissive: 0xffffff,
      emissiveMap: screenTexture,
      emissiveIntensity: 0.45,
    });

    // --- Part A: Titanium Outer Chassis with Curved Rounded Edges ---
    const phoneShape = createRoundedRectShape(phoneW, phoneH, cornerR);
    const extrudeSettings = {
      depth: phoneD,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.04,
    };
    const chassisGeo = new THREE.ExtrudeGeometry(phoneShape, extrudeSettings);
    chassisGeo.center();
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    phoneGroup.add(chassisMesh);

    // --- Part B: Front Ceramic Shield OLED Screen ---
    const screenShape = createRoundedRectShape(phoneW - 0.12, phoneH - 0.12, cornerR - 0.06);
    const screenGeo = new THREE.ShapeGeometry(screenShape);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = phoneD / 2 + 0.042;
    phoneGroup.add(screenMesh);

    // Dynamic Island Pill Cutout
    const pillShape = createRoundedRectShape(0.68, 0.2, 0.1);
    const pillGeo = new THREE.ShapeGeometry(pillShape);
    const pillMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const pillMesh = new THREE.Mesh(pillGeo, pillMat);
    pillMesh.position.set(0, phoneH / 2 - 0.45, phoneD / 2 + 0.045);
    phoneGroup.add(pillMesh);

    // Camera dot inside Dynamic Island
    const dotGeo = new THREE.CircleGeometry(0.04, 32);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x0c1e33 });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.position.set(0.18, phoneH / 2 - 0.45, phoneD / 2 + 0.046);
    phoneGroup.add(dotMesh);

    // --- Part C: Frosted Back Glass (Supports Exploded View) ---
    const backGroup = new THREE.Group();
    phoneGroup.add(backGroup);

    const backGeo = new THREE.ShapeGeometry(screenShape);
    const backMesh = new THREE.Mesh(backGeo, backGlassMat);
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -(phoneD / 2 + 0.041);
    backGroup.add(backMesh);

    // Metallic Center Emblem
    const emblemGeo = new THREE.RingGeometry(0.18, 0.25, 32);
    const emblemMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.1,
    });
    const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
    emblemMesh.rotation.y = Math.PI;
    emblemMesh.position.z = -(phoneD / 2 + 0.043);
    backGroup.add(emblemMesh);

    // --- Part D: Raised Sapphire Camera Plateau ---
    const cameraPlateauShape = createRoundedRectShape(1.28, 1.28, 0.3);
    const cameraPlateauGeo = new THREE.ExtrudeGeometry(cameraPlateauShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.02,
    });
    const plateauMat = new THREE.MeshPhysicalMaterial({
      color: selectedColor.back,
      metalness: 0.4,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const plateauMesh = new THREE.Mesh(cameraPlateauGeo, plateauMat);
    plateauMesh.rotation.y = Math.PI;
    plateauMesh.position.set(-0.64, phoneH / 2 - 0.95, -(phoneD / 2 + 0.041));
    backGroup.add(plateauMesh);

    // --- Part E: Triple Cinematic Camera Lenses ---
    const lensRingMat = new THREE.MeshStandardMaterial({
      color: selectedColor.ring,
      metalness: 0.96,
      roughness: 0.18,
    });
    materialsRef.current.rings = [lensRingMat];

    const lensGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050c18,
      metalness: 0.2,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.8,
      clearcoat: 1.0,
      ior: 1.65,
    });

    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x111e38,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
    });

    const createCameraLens = (x, y) => {
      const lensGroup = new THREE.Group();

      // Outer Knurled Metallic Ring
      const ringGeo = new THREE.CylinderGeometry(0.24, 0.25, 0.09, 48);
      const ringMesh = new THREE.Mesh(ringGeo, lensRingMat);
      ringMesh.rotation.x = Math.PI / 2;
      lensGroup.add(ringMesh);

      // Deep Beveled Inner Lens
      const irisGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.08, 32);
      const irisMesh = new THREE.Mesh(irisGeo, irisMat);
      irisMesh.rotation.x = Math.PI / 2;
      irisMesh.position.z = 0.01;
      lensGroup.add(irisMesh);

      // Optical Glass Sapphire Convex Element
      const glassGeo = new THREE.SphereGeometry(0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
      const glassMesh = new THREE.Mesh(glassGeo, lensGlassMat);
      glassMesh.position.z = 0.04;
      lensGroup.add(glassMesh);

      lensGroup.position.set(x, y, -(phoneD / 2 + 0.14));
      return lensGroup;
    };

    // Add 3 Pro Lenses
    backGroup.add(createCameraLens(-0.9, phoneH / 2 - 0.7)); // Top Left
    backGroup.add(createCameraLens(-0.9, phoneH / 2 - 1.25)); // Bottom Left
    backGroup.add(createCameraLens(-0.4, phoneH / 2 - 0.98)); // Right Center

    // LiDAR Scanner Sensor
    const lidarGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24);
    const lidarMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.1, metalness: 0.9 });
    const lidarMesh = new THREE.Mesh(lidarGeo, lidarMat);
    lidarMesh.rotation.x = Math.PI / 2;
    lidarMesh.position.set(-0.4, phoneH / 2 - 1.32, -(phoneD / 2 + 0.13));
    backGroup.add(lidarMesh);

    // True Tone Flash with Frosted Glass
    const flashGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 24);
    const flashMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfde047,
      emissiveIntensity: 0.5,
      roughness: 0.4,
    });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.rotation.x = Math.PI / 2;
    flashMesh.position.set(-0.4, phoneH / 2 - 0.65, -(phoneD / 2 + 0.13));
    backGroup.add(flashMesh);

    // --- Part F: Buttons and Side Rails ---
    const buttonMat = chassisMat;
    // Action Button (Left rail top)
    const actionBtnGeo = new THREE.BoxGeometry(0.04, 0.28, 0.08);
    const actionBtn = new THREE.Mesh(actionBtnGeo, buttonMat);
    actionBtn.position.set(-(phoneW / 2 + 0.05), phoneH / 2 - 1.2, 0);
    phoneGroup.add(actionBtn);

    // Volume Up & Down Buttons
    const volUpBtn = new THREE.Mesh(actionBtnGeo, buttonMat);
    volUpBtn.position.set(-(phoneW / 2 + 0.05), phoneH / 2 - 1.7, 0);
    phoneGroup.add(volUpBtn);

    const volDownBtn = new THREE.Mesh(actionBtnGeo, buttonMat);
    volDownBtn.position.set(-(phoneW / 2 + 0.05), phoneH / 2 - 2.1, 0);
    phoneGroup.add(volDownBtn);

    // Power / Siri Button (Right rail)
    const powerBtnGeo = new THREE.BoxGeometry(0.04, 0.55, 0.08);
    const powerBtn = new THREE.Mesh(powerBtnGeo, buttonMat);
    powerBtn.position.set(phoneW / 2 + 0.05, phoneH / 2 - 1.6, 0);
    phoneGroup.add(powerBtn);

    // USB-C Port Cutout (Bottom rail)
    const portGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.32, 16);
    const portMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const portMesh = new THREE.Mesh(portGeo, portMat);
    portMesh.rotation.z = Math.PI / 2;
    portMesh.position.set(0, -(phoneH / 2 + 0.04), 0);
    phoneGroup.add(portMesh);

    // --- Part G: Exploded Internals (A18 Quantum Neural Chip & MagSafe) ---
    const internalGroup = new THREE.Group();
    phoneGroup.add(internalGroup);

    // Quantum Chip Box with Glowing Circuit Texture
    const chipTexture = createChipTexture();
    const chipGeo = new THREE.BoxGeometry(1.2, 1.2, 0.06);
    const chipMat = new THREE.MeshStandardMaterial({
      map: chipTexture,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
    });
    const chipMesh = new THREE.Mesh(chipGeo, chipMat);
    chipMesh.position.set(0, 0.5, 0);
    internalGroup.add(chipMesh);

    // MagSafe Wireless Charging Copper Ring
    const magSafeGeo = new THREE.TorusGeometry(0.85, 0.04, 16, 64);
    const magSafeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xb45309,
      emissiveIntensity: 0.3,
    });
    const magSafeMesh = new THREE.Mesh(magSafeGeo, magSafeMat);
    magSafeMesh.position.set(0, -0.6, -0.01);
    internalGroup.add(magSafeMesh);

    // Pulsing Light inside the Chip
    const chipGlowLight = new THREE.PointLight(0x38bdf8, 0, 4);
    chipGlowLight.position.set(0, 0.5, 0.5);
    internalGroup.add(chipGlowLight);

    // 5. Scroll Event Listener & Calculation
    let lastSection = 0;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrollY / (maxScroll || 1)));
      stateRef.current.scrollProgress = progress;

      // Section calculation (0 to 4)
      const sec = Math.min(4, Math.floor(progress * 5));
      if (sec !== lastSection) {
        lastSection = sec;
        setCurrentSection(sec);
        playSound('whoosh');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 6. Mouse Interaction for Parallax and Drag Orbiting
    const handleMouseMove = (e) => {
      stateRef.current.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      stateRef.current.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (stateRef.current.isDragging) {
        const deltaX = e.clientX - stateRef.current.dragStart.x;
        const deltaY = e.clientY - stateRef.current.dragStart.y;
        stateRef.current.dragRotation.y += deltaX * 0.008;
        stateRef.current.dragRotation.x += deltaY * 0.008;
        stateRef.current.dragStart = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e) => {
      if (e.target.closest('.interactive-control')) return;
      stateRef.current.isDragging = true;
      stateRef.current.dragStart = { x: e.clientX, y: e.clientY };
      setIsOrbiting(true);
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
      setIsOrbiting(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // 7. Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. Cinematic Animation Loop with Smooth Interpolation (Lerp)
    let animationFrameId;
    let clock = new THREE.Clock();

    // Keyframes configuration across scroll progress [0.0 - 1.0]
    const keyframes = [
      // 0%: Hero Front View (Balanced and comfortable)
      { p: 0.0, rotX: 0.08, rotY: -0.22, rotZ: 0.02, camZ: 7.8, camY: 0.0, camX: 0.5, explode: 0.0 },
      // 25%: Side Profile (Grade 5 Titanium - sits on left, text on right)
      { p: 0.25, rotX: 0.04, rotY: Math.PI * 0.48, rotZ: 0.0, camZ: 6.6, camY: 0.1, camX: -0.8, explode: 0.0 },
      // 50%: Rear Triple-Lens Camera System (sits on right, text on left)
      { p: 0.5, rotX: -0.08, rotY: Math.PI * 0.98, rotZ: -0.06, camZ: 6.2, camY: 0.5, camX: 0.7, explode: 0.0 },
      // 75%: Exploded Internal View (Quantum Chip - sits on left, text on right)
      { p: 0.75, rotX: 0.24, rotY: Math.PI * 1.35, rotZ: 0.12, camZ: 7.0, camY: 0.0, camX: -0.6, explode: 1.0 },
      // 100%: 360 Finale Interactive Showcase (centered)
      { p: 1.0, rotX: 0.1, rotY: Math.PI * 2.1, rotZ: 0.0, camZ: 7.6, camY: 0.3, camX: 0.0, explode: 0.0 },
    ];

    // Helper: Interpolate between keyframes based on scroll progress
    const getTargetTransform = (p) => {
      let i = 0;
      while (i < keyframes.length - 1 && keyframes[i + 1].p < p) i++;
      if (i >= keyframes.length - 1) return keyframes[keyframes.length - 1];

      const k1 = keyframes[i];
      const k2 = keyframes[i + 1];
      const localT = (p - k1.p) / (k2.p - k1.p);
      // Smooth step easing
      const ease = localT * localT * (3 - 2 * localT);

      return {
        rotX: THREE.MathUtils.lerp(k1.rotX, k2.rotX, ease),
        rotY: THREE.MathUtils.lerp(k1.rotY, k2.rotY, ease),
        rotZ: THREE.MathUtils.lerp(k1.rotZ, k2.rotZ, ease),
        camZ: THREE.MathUtils.lerp(k1.camZ, k2.camZ, ease),
        camY: THREE.MathUtils.lerp(k1.camY, k2.camY, ease),
        camX: THREE.MathUtils.lerp(k1.camX, k2.camX, ease),
        explode: THREE.MathUtils.lerp(k1.explode, k2.explode, ease),
      };
    };

    let curRotX = keyframes[0].rotX;
    let curRotY = keyframes[0].rotY;
    let curRotZ = keyframes[0].rotZ;
    let curCamZ = keyframes[0].camZ;
    let curCamY = keyframes[0].camY;
    let curCamX = keyframes[0].camX;
    let curExplode = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax lerp
      stateRef.current.mouse.x += (stateRef.current.mouse.targetX - stateRef.current.mouse.x) * 0.06;
      stateRef.current.mouse.y += (stateRef.current.mouse.targetY - stateRef.current.mouse.y) * 0.06;

      const progress = stateRef.current.scrollProgress;
      const target = getTargetTransform(progress);

      // Smooth camera and rotation transition
      curRotX += (target.rotX - curRotX) * 0.08;
      curRotY += (target.rotY - curRotY) * 0.08;
      curRotZ += (target.rotZ - curRotZ) * 0.08;
      curCamZ += (target.camZ - curCamZ) * 0.08;
      curCamY += (target.camY - curCamY) * 0.08;
      curCamX += (target.camX - curCamX) * 0.08;
      curExplode += (target.explode - curExplode) * 0.08;

      // Idle floating levitation
      const floatY = Math.sin(elapsedTime * 1.5) * 0.06;

      // Apply to phone group with mouse tilt & drag rotation
      phoneGroup.rotation.x = curRotX + stateRef.current.dragRotation.x - stateRef.current.mouse.y * 0.12;
      phoneGroup.rotation.y = curRotY + stateRef.current.dragRotation.y + stateRef.current.mouse.x * 0.18;
      phoneGroup.rotation.z = curRotZ;
      phoneGroup.position.y = floatY;

      // Camera position
      camera.position.x = curCamX;
      camera.position.y = curCamY;
      camera.position.z = curCamZ;

      // Exploded View: Back Glass separates outward
      backGroup.position.z = -curExplode;
      backGlassMat.opacity = THREE.MathUtils.lerp(0.98, 0.45, Math.min(1, curExplode));

      // Chip Pulse Light
      chipGlowLight.intensity = curExplode > 0.3 ? 2.0 + Math.sin(elapsedTime * 8) * 1.2 : 0;

      // Render scene
      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative min-h-[500vh] bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* 1. Fixed 3D WebGL Canvas Layer */}
      <div
        ref={mountRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${
          isOrbiting ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      />

      {/* 2. Top Interactive HUD & Color Switcher */}
      <header className="fixed top-20 left-0 right-0 z-30 px-4 sm:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                TITANIUM CYBER 16 PRO
              </h1>
              <p className="text-xs text-slate-400">3D Interactive Scroll Showcase • Three.js WebGL</p>
            </div>
          </div>

          {/* Color Selector Pills */}
          <div className="flex items-center gap-2 interactive-control">
            <span className="hidden sm:inline text-xs font-medium text-slate-400 mr-1">สีตัวเครื่อง:</span>
            {COLOR_FINISHES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c)}
                title={c.thName}
                className={`relative group w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  selectedColor.id === c.id
                    ? 'border-white scale-110 shadow-lg shadow-cyan-500/30'
                    : 'border-white/20 hover:border-white/60 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.accent }}
              >
                {selectedColor.id === c.id && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                )}
              </button>
            ))}

            {/* Size / Scale Adjuster */}
            <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-xl px-2 py-1 text-xs">
              <span className="text-slate-400 mr-1 hidden sm:inline">ขนาด:</span>
              <button
                onClick={() => {
                  setModelScale((s) => Math.max(0.35, parseFloat((s - 0.06).toFixed(2))));
                  playSound('click');
                }}
                className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition"
                title="ย่อขนาดโมเดล"
              >
                -
              </button>
              <span className="px-1 font-mono text-cyan-400 font-bold text-[11px]">
                {Math.round((modelScale / 0.58) * 100)}%
              </span>
              <button
                onClick={() => {
                  setModelScale((s) => Math.min(0.9, parseFloat((s + 0.06).toFixed(2))));
                  playSound('click');
                }}
                className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition"
                title="ขยายขนาดโมเดล"
              >
                +
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playSound('click');
              }}
              className="ml-1 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition border border-white/10 text-xs flex items-center gap-1.5"
              title="เปิด/ปิดเสียงเอฟเฟกต์"
            >
              <span>{soundEnabled ? '🔊 เสียงเปิด' : '🔇 เสียงปิด'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Scroll Progress Indicator Dots on Right */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3 pointer-events-none">
        {[0, 1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className={`w-2.5 transition-all duration-500 rounded-full ${
              currentSection === idx
                ? 'h-8 bg-cyan-400 shadow-lg shadow-cyan-400/50'
                : 'h-2.5 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* 4. Storytelling Narrative Sections (Scroll Driven) */}
      <div className="relative z-10">
        {/* Section 1: Hero Reveal (0% Scroll) */}
        <section className="min-h-screen flex flex-col justify-end sm:justify-center p-6 sm:p-16 max-w-4xl pointer-events-none">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-xl pointer-events-auto animate-fadeIn">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-block mb-3">
              ✦ ก้าวสู่อนาคตแห่งสมาร์ตโฟน
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              TITANIUM <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                ULTRA PRO
              </span>
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              สัมผัสมิติใหม่ของงานดีไซน์ไทเทเนียมเกรด 5 พร้อมการเรนเดอร์ 3D แบบเรียลไทม์
              ที่หมุนปรับมุมมองและแยกชิ้นส่วนตามการเลื่อนเมาส์ของคุณ
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3.5 py-2 rounded-xl animate-pulse">
                <span>👇</span>
                <span>เลื่อนหน้าจอลง (Scroll Down) เพื่อสำรวจ</span>
              </div>
              <span className="text-xs text-slate-400">หรือคลิกลากเพื่อหมุนอิสระ 🔄</span>
            </div>
          </div>
        </section>

        {/* Section 2: Aerospace-Grade Titanium (25% Scroll) */}
        <section className="min-h-screen flex items-center justify-end p-6 sm:p-16 pointer-events-none">
          <div className="bg-slate-900/75 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md pointer-events-auto text-right">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block mb-3">
              📐 PRECISION ENGINEERING
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              บอดี้ไทเทเนียม <br />
              <span className="text-indigo-400">เกรด 5 แข็งแกร่ง</span>
            </h2>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              ขอบเครื่องขัดลายซาตินประณีต โค้งมนไร้รอยต่อ ลดน้ำหนักลง 15% พร้อมปุ่ม Action Button
              ที่ตั้งค่าคำสั่งด่วนได้ตามใจ และพอร์ตชาร์จ USB-C ความเร็วสูงสุด 10Gbps
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-2xl font-black text-cyan-400">187g</div>
                <div className="text-xs text-slate-400">น้ำหนักเบาเป็นพิเศษ</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-2xl font-black text-indigo-400">IP68</div>
                <div className="text-xs text-slate-400">กันน้ำลึก 6 เมตร</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: 48MP Pro Triple Camera System (50% Scroll) */}
        <section className="min-h-screen flex items-center justify-start p-6 sm:p-16 pointer-events-none">
          <div className="bg-slate-900/75 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md pointer-events-auto">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block mb-3">
              📸 CINEMATIC OPTICS
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              ระบบกล้องโปร <br />
              <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
                48MP Tri-Lens
              </span>
            </h2>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              เลนส์กระจกแซฟไฟร์เคลือบสารป้องกันแสงสะท้อน Multi-Coating ซูม Optical สูงถึง 10 เท่า
              พร้อมเซนเซอร์ LiDAR Scanner สแกนมิติวัตถุแบบ 3D และแฟลช True Tone สองสี
            </p>

            <ul className="mt-6 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>กล้องหลัก 48MP เซนเซอร์ Quad-Pixel รุ่นล่าสุด</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>เลนส์ซูม Periscope Telephoto 120mm</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>บันทึกวิดีโอระดับ Spatial Video 4K 120fps</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Exploded View & Quantum Core (75% Scroll) */}
        <section className="min-h-screen flex items-center justify-end p-6 sm:p-16 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-lg pointer-events-auto text-right">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 inline-block mb-3">
              ⚡ X-RAY EXPLODED ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              โครงสร้างภายใน <br />
              <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                QUANTUM X1 CHIP
              </span>
            </h2>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              ชิ้นส่วนฝาหลังแยกตัวออกเพื่อเผยให้เห็นขุมพลังชิป 3 นาโนเมตรระดับควอนตัม
              พร้อมขดลวดแม่เหล็ก MagSafe ชาร์จไว 30W และระบบระบายความร้อนกราฟีนไอระเหย
            </p>

            <div className="mt-6 p-4 bg-slate-950/80 rounded-2xl border border-cyan-500/30 text-left">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
                <span>NEURAL ENGINE CORES</span>
                <span className="font-bold">128 CORES</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-full w-[92%]"></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                เร่งความเร็วโมเดล AI บนตัวเครื่องได้เร็วขึ้น 4.2 เท่า โดยไม่สูบพลังงานแบตเตอรี่
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Finale 360 Showcase (100% Scroll) */}
        <section className="min-h-screen flex items-center justify-center p-6 sm:p-12 pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 rounded-3xl shadow-2xl max-w-2xl text-center pointer-events-auto">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-block mb-4">
              🎉 สรุปการสั่งซื้อ & หมุนทดสอบ 360°
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              เลือกสีที่คุณชื่นชอบ
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-md mx-auto">
              คุณกำลังดูสี{' '}
              <span className="font-bold text-white underline decoration-cyan-400">
                {selectedColor.name} ({selectedColor.thName})
              </span>{' '}
              สามารถคลิกลากบนหน้าจอเพื่อหมุนโมเดล 3D ได้อย่างอิสระรอบทิศทาง
            </p>

            {/* Finish Palette Big Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {COLOR_FINISHES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                    selectedColor.id === c.id
                      ? 'bg-white text-slate-900 border-white shadow-lg scale-105'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.accent }} />
                  <span>{c.thName}</span>
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  playSound('whoosh');
                }}
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition active:scale-95"
              >
                ⬆️ กลับขึ้นด้านบนสุด
              </button>
              <Link
                to="/"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition active:scale-95 flex items-center gap-2"
              >
                <span>🏠</span>
                <span>กลับสู่หน้าแรก (Home)</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
