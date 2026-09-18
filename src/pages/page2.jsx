import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

// Web Audio API Synthesizer for 100% standalone sound effects
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playShoot() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.11);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.11);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {}
  }
  playHit(isHeadshot = false) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isHeadshot ? 1500 : 900, now);
      osc.frequency.setValueAtTime(isHeadshot ? 2200 : 1200, now + 0.04);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }
  playReload() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(700, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
  playExplosion() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }
  playHurt() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }
}

const sfx = new SoundFX();

export default function Page2() {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState(30);
  const [isReloading, setIsReloading] = useState(false);
  const [wave, setWave] = useState(1);
  const [kills, setKills] = useState(0);
  const [killFeed, setKillFeed] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(null); // null = auto (only mobile), true = force show, false = force hide

  // References for game loop & Three.js objects
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    gunGroup: null,
    muzzleLight: null,
    holoRing: null,
    bots: [],
    botProjectiles: [],
    particles: [],
    obstacles: [],
    keys: { w: false, a: false, s: false, d: false, space: false, shift: false },
    yaw: 0,
    pitch: 0,
    recoil: 0,
    playerPos: new THREE.Vector3(0, 1.6, 18),
    playerVelocityY: 0,
    isGrounded: true,
    waveBotsSpawned: 0,
    waveBotsTotal: 4,
    nextSpawnTime: 0,
    animationFrameId: null,
  });

  // Mobile Touch Aiming Ref
  const touchLook = useRef({
    touchId: null,
    lastX: 0,
    lastY: 0,
  });

  const onTouchStartAim = (e) => {
    if (!isPlaying || gameOver) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (touchLook.current.touchId === null) {
        touchLook.current.touchId = t.identifier;
        touchLook.current.lastX = t.clientX;
        touchLook.current.lastY = t.clientY;
        break;
      }
    }
  };

  const onTouchMoveAim = (e) => {
    if (!isPlaying || gameOver || touchLook.current.touchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === touchLook.current.touchId) {
        const dx = t.clientX - touchLook.current.lastX;
        const dy = t.clientY - touchLook.current.lastY;
        const sensitivity = 0.0055;
        const g = gameRef.current;
        g.yaw -= dx * sensitivity;
        g.pitch -= dy * sensitivity;
        g.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, g.pitch));
        touchLook.current.lastX = t.clientX;
        touchLook.current.lastY = t.clientY;
        break;
      }
    }
  };

  const onTouchEndAim = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === touchLook.current.touchId) {
        touchLook.current.touchId = null;
        break;
      }
    }
  };

  const botNames = ['Cyber-Viper', 'Neon-Ghost', 'Mecha-Titan', 'Apex-Sentinel', 'Nexus-Unit', 'Spectre-99'];

  // Start / Restart Game
  const startGame = () => {
    sfx.init();
    setHealth(100);
    setScore(0);
    setAmmo(30);
    setIsReloading(false);
    setWave(1);
    setKills(0);
    setGameOver(false);
    setKillFeed(['ภารกิจ CYBER STRIKE เริ่มต้น: กำจัดบอท AI ทั้งหมด!']);

    const g = gameRef.current;
    g.playerPos.set(0, 1.6, 20);
    g.yaw = 0;
    g.pitch = 0;
    g.waveBotsSpawned = 0;
    g.waveBotsTotal = 4;
    g.nextSpawnTime = Date.now() + 500;

    // Clear old bots & projectiles
    g.bots.forEach((b) => {
      if (b.mesh) g.scene.remove(b.mesh);
    });
    g.bots = [];
    g.botProjectiles.forEach((p) => {
      if (p.mesh) g.scene.remove(p.mesh);
    });
    g.botProjectiles = [];

    setIsPlaying(true);

    if (containerRef.current) {
      containerRef.current.requestPointerLock();
    }
  };

  const handleReload = () => {
    if (isReloading || ammo === 30) return;
    setIsReloading(true);
    sfx.playReload();
    setTimeout(() => {
      setAmmo(30);
      setIsReloading(false);
    }, 1100);
  };

  const handleShoot = () => {
    if (!isPlaying || gameOver || isReloading) return;
    if (ammo <= 0) {
      handleReload();
      return;
    }

    sfx.playShoot();
    setAmmo((a) => a - 1);
    const g = gameRef.current;
    g.recoil = 1.0;
    if (g.muzzleLight) g.muzzleLight.intensity = 4.0;

    // Raycast from camera forward
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), g.camera);

    const hitTargets = [];
    g.bots.forEach((b) => {
      if (b.hp > 0 && b.mesh) {
        b.mesh.traverse((child) => {
          if (child.isMesh) {
            child.userData = { botId: b.id, isHead: child.name === 'head' };
            hitTargets.push(child);
          }
        });
      }
    });

    const intersects = raycaster.intersectObjects(hitTargets, false);

    if (intersects.length > 0) {
      const firstHit = intersects[0];
      const botId = firstHit.object.userData?.botId;
      const isHead = firstHit.object.userData?.isHead;
      const bot = g.bots.find((b) => b.id === botId);

      if (bot && bot.hp > 0) {
        const damage = isHead ? 100 : 45;
        bot.hp -= damage;
        sfx.playHit(isHead);

        // Safe visual hit reaction: temporarily brighten material without touching non-existent emissive
        bot.mesh.traverse((child) => {
          if (child.isMesh && child.material) {
            const origColor = child.material.color.getHex();
            child.material.color.setHex(isHead ? 0xff0044 : 0xffffff);
            setTimeout(() => {
              if (child && child.material) {
                child.material.color.setHex(origColor);
              }
            }, 80);
          }
        });

        // Spawn 3D spark particles
        for (let i = 0; i < 8; i++) {
          const sparkGeo = new THREE.SphereGeometry(0.05, 4, 4);
          const sparkMat = new THREE.MeshBasicMaterial({ color: isHead ? 0xff0055 : 0x00ffff });
          const spark = new THREE.Mesh(sparkGeo, sparkMat);
          spark.position.copy(firstHit.point);
          spark.userData = {
            vel: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4 + 2, (Math.random() - 0.5) * 4),
            life: 14,
          };
          g.scene.add(spark);
          g.particles.push(spark);
        }

        // Check if bot killed
        if (bot.hp <= 0) {
          sfx.playExplosion();
          const pts = isHead ? 250 : 100;
          setScore((s) => s + pts);
          setKills((k) => k + 1);

          const msg = isHead
            ? `💥 CRITICAL HEADSHOT! [${bot.name}] +${pts}`
            : `🎯 กำจัด [${bot.name}] +${pts}`;
          setKillFeed((kf) => [msg, ...kf.slice(0, 4)]);

          // Remove bot mesh from scene and remove from bots list
          if (bot.mesh) g.scene.remove(bot.mesh);
          g.bots = g.bots.filter((b) => b.id !== bot.id);
        } else {
          setScore((s) => s + 20);
        }
      }
    }
  };

  // Helper to create Cyber Bot Mesh with Neon Glow
  const createBotMesh = (name, primaryColor, neonAccent) => {
    const group = new THREE.Group();

    // Torso (Cyber Mech)
    const torsoGeo = new THREE.BoxGeometry(0.75, 0.95, 0.5);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.3,
      metalness: 0.8,
      emissive: neonAccent,
      emissiveIntensity: 0.25,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.95;
    group.add(torso);

    // Cyber Chest Arc Reactor
    const arcGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8);
    const arcMat = new THREE.MeshBasicMaterial({ color: neonAccent });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.rotation.x = Math.PI / 2;
    arc.position.set(0, 1.0, -0.26);
    group.add(arc);

    // Head (Critical Box)
    const headGeo = new THREE.BoxGeometry(0.44, 0.44, 0.44);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.name = 'head';
    head.position.y = 1.65;
    group.add(head);

    // Glowing Neon Visor
    const visorGeo = new THREE.BoxGeometry(0.36, 0.12, 0.08);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.65, -0.23);
    group.add(visor);

    // Left & Right Shoulder Armor Pads
    const padGeo = new THREE.BoxGeometry(0.25, 0.3, 0.4);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const leftPad = new THREE.Mesh(padGeo, padMat);
    leftPad.position.set(-0.52, 1.25, 0);
    const rightPad = new THREE.Mesh(padGeo, padMat);
    rightPad.position.set(0.52, 1.25, 0);
    group.add(leftPad);
    group.add(rightPad);

    // Plasma Cannon Arm
    const cannonGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.7, 8);
    const cannonMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9 });
    const cannon = new THREE.Mesh(cannonGeo, cannonMat);
    cannon.rotation.x = Math.PI / 2;
    cannon.position.set(0.52, 0.8, -0.35);
    group.add(cannon);

    // Hover Thruster base
    const thrusterGeo = new THREE.CylinderGeometry(0.38, 0.18, 0.55, 8);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.position.y = 0.28;
    group.add(thruster);

    // Glowing Neon Thruster Ring
    const ringGeo = new THREE.TorusGeometry(0.32, 0.04, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: neonAccent });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    group.add(ring);

    return group;
  };

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060d);
    scene.fog = new THREE.FogExp2(0x04060d, 0.022);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.rotation.order = 'YXZ';

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Cyber Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambientLight);

    const cyanSpot = new THREE.DirectionalLight(0x06b6d4, 1.8);
    cyanSpot.position.set(25, 35, 20);
    scene.add(cyanSpot);

    const magentaSpot = new THREE.DirectionalLight(0xd946ef, 1.4);
    magentaSpot.position.set(-25, 35, -20);
    scene.add(magentaSpot);

    // Cyber Arena Floor
    const floorGeo = new THREE.PlaneGeometry(90, 90, 45, 45);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.2,
      metalness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Glowing Cyber Neon Floor Grid
    const cyanGrid = new THREE.GridHelper(90, 45, 0x00ffff, 0x1e293b);
    cyanGrid.position.y = 0.02;
    scene.add(cyanGrid);

    // Arena Outer Cyber Wall Barrier with Neon Strips
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.4 });
    const wallPositions = [
      { x: 0, z: -45, w: 90, d: 2 },
      { x: 0, z: 45, w: 90, d: 2 },
      { x: -45, z: 0, w: 2, d: 90 },
      { x: 45, z: 0, w: 2, d: 90 },
    ];
    wallPositions.forEach((wp) => {
      const wallGeo = new THREE.BoxGeometry(wp.w, 7, wp.d);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(wp.x, 3.5, wp.z);
      scene.add(wall);

      // Neon Top Border Strip
      const stripGeo = new THREE.BoxGeometry(wp.w, 0.2, wp.d);
      const stripMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(wp.x, 7.05, wp.z);
      scene.add(strip);
    });

    // Cyber Monoliths & Sci-Fi Towers for Cover
    const obstacles = [];
    const cyberTowers = [
      { x: -12, z: 6, w: 4, h: 6, d: 4, color: 0x06b6d4 },
      { x: 12, z: 6, w: 4, h: 6, d: 4, color: 0xd946ef },
      { x: -18, z: -12, w: 5, h: 7, d: 5, color: 0x3b82f6 },
      { x: 18, z: -12, w: 5, h: 7, d: 5, color: 0x10b981 },
      { x: 0, z: -10, w: 4, h: 5, d: 4, color: 0xf59e0b },
      { x: -8, z: -25, w: 4.5, h: 6.5, d: 4.5, color: 0xec4899 },
      { x: 8, z: -25, w: 4.5, h: 6.5, d: 4.5, color: 0x8b5cf6 },
    ];

    cyberTowers.forEach((ct) => {
      // Tower Body
      const towerGeo = new THREE.BoxGeometry(ct.w, ct.h, ct.d);
      const towerMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.85,
        roughness: 0.25,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(ct.x, ct.h / 2, ct.z);
      scene.add(tower);

      // Neon Wireframe Edges on Tower
      const edges = new THREE.EdgesGeometry(towerGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: ct.color, linewidth: 2 });
      const edgeLines = new THREE.LineSegments(edges, edgeMat);
      edgeLines.position.copy(tower.position);
      scene.add(edgeLines);

      // Glowing Core Line
      const coreGeo = new THREE.BoxGeometry(0.15, ct.h * 0.75, ct.d + 0.05);
      const coreMat = new THREE.MeshBasicMaterial({ color: ct.color });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(ct.x, ct.h / 2, ct.z);
      scene.add(core);

      obstacles.push({ x: ct.x, z: ct.z, radius: Math.max(ct.w, ct.d) * 0.65 });
    });

    // Giant Holographic Cyber Sky Ring (Hovering above Arena)
    const holoRingGeo = new THREE.TorusGeometry(26, 0.4, 8, 36);
    const holoRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing.rotation.x = Math.PI / 2.3;
    holoRing.position.set(0, 18, -8);
    scene.add(holoRing);

    // Inner Ring
    const innerRingGeo = new THREE.TorusGeometry(18, 0.3, 8, 28);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, wireframe: true });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2.1;
    innerRing.position.set(0, 19, -8);
    scene.add(innerRing);

    // 3D Cyber Weapon Model Attached to Camera
    const gunGroup = new THREE.Group();
    // Gun Body
    const gunBodyGeo = new THREE.BoxGeometry(0.13, 0.17, 0.55);
    const gunBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const gunBody = new THREE.Mesh(gunBodyGeo, gunBodyMat);
    gunGroup.add(gunBody);

    // Glowing Neon Plasma Energy Core
    const cellGeo = new THREE.BoxGeometry(0.05, 0.06, 0.38);
    const cellMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const cell = new THREE.Mesh(cellGeo, cellMat);
    cell.position.set(0, 0.07, -0.04);
    gunGroup.add(cell);

    // Gun Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8);
    const barrel = new THREE.Mesh(barrelGeo, gunBodyMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.42);
    gunGroup.add(barrel);

    // Gun Neon Sights
    const sightGeo = new THREE.BoxGeometry(0.02, 0.04, 0.04);
    const sightMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const sight = new THREE.Mesh(sightGeo, sightMat);
    sight.position.set(0, 0.11, -0.2);
    gunGroup.add(sight);

    // Muzzle Flash PointLight
    const muzzleLight = new THREE.PointLight(0x00ffff, 0, 10);
    muzzleLight.position.set(0, 0.02, -0.6);
    gunGroup.add(muzzleLight);

    gunGroup.position.set(0.24, -0.22, -0.45);
    camera.add(gunGroup);
    scene.add(camera);

    const g = gameRef.current;
    g.scene = scene;
    g.camera = camera;
    g.renderer = renderer;
    g.gunGroup = gunGroup;
    g.muzzleLight = muzzleLight;
    g.holoRing = holoRing;
    g.obstacles = obstacles;

    // Pointer Lock Listener
    const onPointerLockChange = () => {
      const isLockedNow = document.pointerLockElement === container;
      setIsLocked(isLockedNow);
    };
    document.addEventListener('pointerlockchange', onPointerLockChange);

    // Mouse Look Aiming
    const onMouseMove = (e) => {
      if (document.pointerLockElement !== container) return;
      const sensitivity = 0.0022;
      g.yaw -= e.movementX * sensitivity;
      g.pitch -= e.movementY * sensitivity;
      g.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, g.pitch));
    };
    document.addEventListener('mousemove', onMouseMove);

    // Keyboard Controls
    const onKeyDown = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') g.keys.w = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') g.keys.s = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') g.keys.a = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') g.keys.d = true;
      if (e.code === 'Space') g.keys.space = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') g.keys.shift = true;
      if (e.code === 'KeyR') handleReload();
    };
    const onKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') g.keys.w = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') g.keys.s = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') g.keys.a = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') g.keys.d = false;
      if (e.code === 'Space') g.keys.space = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') g.keys.shift = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Game Loop
    let lastTime = performance.now();
    const animate = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Rotate Cyber Sky Rings
      if (g.holoRing) g.holoRing.rotation.z += delta * 0.2;
      if (innerRing) innerRing.rotation.z -= delta * 0.35;

      // 1. Player Movement & Physics
      if (isPlaying && !gameOver) {
        const speedMultiplier = g.keys.shift ? 1.6 : 1.0;
        const moveSpeed = 11 * speedMultiplier * delta;
        const forward = new THREE.Vector3(-Math.sin(g.yaw), 0, -Math.cos(g.yaw));
        const right = new THREE.Vector3(Math.cos(g.yaw), 0, -Math.sin(g.yaw));

        const moveDir = new THREE.Vector3();
        if (g.keys.w) moveDir.add(forward);
        if (g.keys.s) moveDir.sub(forward);
        if (g.keys.d) moveDir.add(right);
        if (g.keys.a) moveDir.sub(right);

        if (moveDir.lengthSq() > 0) {
          moveDir.normalize().multiplyScalar(moveSpeed);
          const nextX = g.playerPos.x + moveDir.x;
          const nextZ = g.playerPos.z + moveDir.z;

          // Arena boundary wall check
          const bound = 42;
          let canMoveX = Math.abs(nextX) < bound;
          let canMoveZ = Math.abs(nextZ) < bound;

          // Obstacle collisions
          obstacles.forEach((obs) => {
            const dist = Math.hypot(nextX - obs.x, nextZ - obs.z);
            if (dist < obs.radius + 0.65) {
              canMoveX = false;
              canMoveZ = false;
            }
          });

          if (canMoveX) g.playerPos.x = nextX;
          if (canMoveZ) g.playerPos.z = nextZ;

          // Walking bobbing effect
          if (g.isGrounded) {
            g.playerPos.y = 1.6 + Math.sin(time * 0.014 * speedMultiplier) * 0.05;
          }
        } else if (g.isGrounded) {
          g.playerPos.y = 1.6;
        }

        // Jump physics
        if (g.keys.space && g.isGrounded) {
          g.playerVelocityY = 6.5;
          g.isGrounded = false;
        }
        if (!g.isGrounded) {
          g.playerVelocityY -= 18 * delta;
          g.playerPos.y += g.playerVelocityY * delta;
          if (g.playerPos.y <= 1.6) {
            g.playerPos.y = 1.6;
            g.playerVelocityY = 0;
            g.isGrounded = true;
          }
        }

        // Camera Update
        camera.position.copy(g.playerPos);
        camera.rotation.y = g.yaw;
        camera.rotation.x = g.pitch;

        // Gun Recoil recovery
        if (g.recoil > 0) g.recoil -= delta * 5.5;
        if (g.recoil < 0) g.recoil = 0;
        gunGroup.position.z = -0.45 + g.recoil * 0.08;
        gunGroup.rotation.x = g.recoil * 0.16;
        if (g.muzzleLight && g.muzzleLight.intensity > 0) {
          g.muzzleLight.intensity -= delta * 30;
        }

        // 2. Spawn AI Bots
        const now = Date.now();
        if (g.waveBotsSpawned < g.waveBotsTotal && now > g.nextSpawnTime) {
          const name = botNames[g.waveBotsSpawned % botNames.length];
          const primaryColor = g.waveBotsSpawned % 2 === 0 ? 0xef4444 : 0x8b5cf6;
          const neonAccent = g.waveBotsSpawned % 2 === 0 ? 0xff0055 : 0x00ffff;
          const mesh = createBotMesh(name, primaryColor, neonAccent);

          const angle = Math.random() * Math.PI * 2;
          const dist = 24 + Math.random() * 12;
          const spawnX = Math.cos(angle) * dist;
          const spawnZ = Math.sin(angle) * dist;
          mesh.position.set(spawnX, 0, spawnZ);

          scene.add(mesh);
          g.bots.push({
            id: Date.now() + Math.random(),
            name,
            mesh,
            hp: 100,
            speed: 3.8 + Math.random() * 2,
            shootTimer: 1.5 + Math.random() * 1.8,
          });

          g.waveBotsSpawned++;
          g.nextSpawnTime = now + 1500;
        }

        // Wave Completion Check
        if (g.waveBotsSpawned >= g.waveBotsTotal && g.bots.length === 0) {
          setWave((wv) => {
            const nextWv = wv + 1;
            g.waveBotsTotal = 4 + nextWv * 2;
            g.waveBotsSpawned = 0;
            g.nextSpawnTime = Date.now() + 2000;
            setKillFeed((kf) => [`🏆 ผ่านรอบที่ ${wv}! เตรียมพร้อมรอบที่ ${nextWv}`, ...kf]);
            return nextWv;
          });
        }

        // 3. Update AI Bots Behavior
        g.bots.forEach((bot) => {
          if (bot.hp <= 0 || !bot.mesh) return;

          // Turn toward player
          bot.mesh.lookAt(g.playerPos.x, bot.mesh.position.y, g.playerPos.z);

          // Move toward player
          const distToPlayer = bot.mesh.position.distanceTo(g.playerPos);
          if (distToPlayer > 9) {
            const dir = new THREE.Vector3().subVectors(g.playerPos, bot.mesh.position).normalize();
            bot.mesh.position.addScaledVector(dir, bot.speed * delta);
          } else {
            // Strafe around player
            const tangent = new THREE.Vector3(-Math.sin(bot.mesh.rotation.y), 0, -Math.cos(bot.mesh.rotation.y)).cross(new THREE.Vector3(0, 1, 0));
            bot.mesh.position.addScaledVector(tangent, bot.speed * 0.45 * delta);
          }

          // Bot Shooting
          bot.shootTimer -= delta;
          if (bot.shootTimer <= 0) {
            bot.shootTimer = 2.2 + Math.random() * 1.5;

            const laserGeo = new THREE.SphereGeometry(0.14, 8, 8);
            const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
            const laser = new THREE.Mesh(laserGeo, laserMat);
            laser.position.copy(bot.mesh.position).add(new THREE.Vector3(0, 1.2, 0));

            const dirToPlayer = new THREE.Vector3().subVectors(g.playerPos, laser.position).normalize();
            dirToPlayer.x += (Math.random() - 0.5) * 0.12;
            dirToPlayer.y += (Math.random() - 0.5) * 0.12;
            dirToPlayer.z += (Math.random() - 0.5) * 0.12;

            scene.add(laser);
            g.botProjectiles.push({
              mesh: laser,
              dir: dirToPlayer.normalize(),
              speed: 25,
              life: 3.5,
            });
          }
        });

        // 4. Update Bot Projectiles
        for (let i = g.botProjectiles.length - 1; i >= 0; i--) {
          const p = g.botProjectiles[i];
          p.mesh.position.addScaledVector(p.dir, p.speed * delta);
          p.life -= delta;

          if (p.mesh.position.distanceTo(g.playerPos) < 1.1) {
            sfx.playHurt();
            setHitFlash(true);
            setTimeout(() => setHitFlash(false), 120);

            setHealth((hp) => {
              const nextHp = Math.max(0, hp - (10 + Math.floor(Math.random() * 10)));
              if (nextHp <= 0) {
                setGameOver(true);
                setIsPlaying(false);
                if (document.exitPointerLock) document.exitPointerLock();
              }
              return nextHp;
            });

            scene.remove(p.mesh);
            g.botProjectiles.splice(i, 1);
            continue;
          }

          if (p.life <= 0) {
            scene.remove(p.mesh);
            g.botProjectiles.splice(i, 1);
          }
        }

        // 5. Update Particles
        for (let i = g.particles.length - 1; i >= 0; i--) {
          const sp = g.particles[i];
          sp.position.addScaledVector(sp.userData.vel, delta);
          sp.userData.vel.y -= 9.8 * delta;
          sp.userData.life -= 1;
          if (sp.userData.life <= 0) {
            scene.remove(sp);
            g.particles.splice(i, 1);
          }
        }
      }

      renderer.render(scene, camera);
      g.animationFrameId = requestAnimationFrame(animate);
    };

    g.animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(g.animationFrameId);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPlaying, gameOver]);

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs border border-red-200">
              Page 2
            </span>
            <span className="text-xs text-slate-500 font-medium">🎮 Cyberpunk 3D FPS (WASD + Mouse Look)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Page 2: Cyber Strike (3D FPS Arena)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            สนามรบนีออนไซเบอร์ 3D เต็มรูปแบบ เดินสำรวจด้วย WASD กระโดด Space หมุนกล้อง 360 องศาด้วยเมาส์
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            ← หน้าหลัก Home
          </Link>
          <Link
            to="/page3"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-sm"
          >
            ไป Page 3 (Racing) →
          </Link>
        </div>
      </div>

      {/* 3D Game Viewport Container */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStartAim}
        onTouchMove={onTouchMoveAim}
        onTouchEnd={onTouchEndAim}
        onTouchCancel={onTouchEndAim}
        onClick={() => {
          const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
          if (!isTouch && isPlaying && !isLocked && containerRef.current) {
            containerRef.current.requestPointerLock();
          }
          if (!isTouch) {
            handleShoot();
          }
        }}
        className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-black cursor-crosshair h-[480px] sm:h-[600px] w-full touch-none select-none"
      >
        {/* Hurt Screen Flash */}
        {hitFlash && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-red-600/35 border-8 border-red-500 animate-pulse"></div>
        )}

        {/* Top HUD Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-3.5 sm:p-5 flex items-center justify-between pointer-events-none">
          {/* Health Bar */}
          <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2.5 sm:gap-3 shadow-lg">
            <span className="text-red-500 font-black text-xs sm:text-sm">❤️ HP</span>
            <div className="w-20 sm:w-36 h-2.5 sm:h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  health > 50 ? 'bg-emerald-500' : health > 25 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
            <span className="text-[11px] sm:text-xs font-mono font-bold text-white">{health}%</span>
          </div>

          {/* Wave & Score */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-800 text-center shadow-lg">
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Wave</div>
              <div className="text-sm sm:text-base font-black text-indigo-400 leading-tight">{wave}</div>
            </div>
            <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-800 text-center shadow-lg">
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Score</div>
              <div className="text-sm sm:text-base font-black text-amber-400 leading-tight">{score}</div>
            </div>
          </div>

          {/* Controls Toggle & Ammo Counter */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTouchControls((prev) => (prev === true ? false : true));
              }}
              className="pointer-events-auto px-2.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 shadow-lg backdrop-blur-md transition-colors"
              title="สลับการแสดงปุ่มควบคุมเสมือน"
            >
              <span>🎮</span>
              <span className="hidden sm:inline">
                {showTouchControls === true ? 'ซ่อนปุ่มจอย' : 'ปุ่มมือถือ'}
              </span>
            </button>

            <div className="bg-slate-950/85 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-lg">
              <span className="text-cyan-400 font-bold text-[11px] sm:text-xs">⚡ AMMO</span>
              <span className={`font-mono text-xs sm:text-base font-black ${ammo < 8 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {isReloading ? 'RELOAD...' : `${ammo} / 30`}
              </span>
            </div>
          </div>
        </div>

        {/* Kill Feed Notification on Top-Left */}
        <div className="absolute top-16 left-3 z-20 space-y-1 pointer-events-none hidden sm:block max-w-xs">
          {killFeed.map((msg, idx) => (
            <div
              key={idx}
              className="text-[10px] sm:text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-900/85 text-white border border-slate-800/80 backdrop-blur-sm shadow"
            >
              {msg}
            </div>
          ))}
        </div>

        {/* Center Crosshair */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 rounded-full border border-cyan-400/80 shadow-cyan-400 shadow-sm"></div>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute"></div>
              <div className="w-3 h-[1.5px] bg-cyan-400 absolute -left-4"></div>
              <div className="w-3 h-[1.5px] bg-cyan-400 absolute -right-4"></div>
              <div className="h-3 w-[1.5px] bg-cyan-400 absolute -top-4"></div>
              <div className="h-3 w-[1.5px] bg-cyan-400 absolute -bottom-4"></div>
            </div>
          </div>
        )}

        {/* Desktop Pointer Lock Aim Notice */}
        {isPlaying && !isLocked && (
          <div className={`${showTouchControls === true ? 'hidden' : 'hidden lg:block'} absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 text-cyan-300 border border-cyan-500/40 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-xl animate-bounce pointer-events-none`}>
            🖱️ คลิกบนหน้าจอเพื่อล็อคเมาส์เล็งปืน 3D (กด ESC เพื่อปลดล็อคเมาส์)
          </div>
        )}

        {/* Mobile On-Screen Controls HUD */}
        {isPlaying && !gameOver && (
          <>
            {/* Mobile Drag Look Hint */}
            <div className={`${showTouchControls === false ? 'hidden' : showTouchControls === true ? 'block' : 'lg:hidden'} absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-slate-950/85 text-cyan-300 border border-cyan-500/30 px-3.5 py-1 rounded-full text-[10px] font-semibold tracking-wide shadow-lg pointer-events-none backdrop-blur-sm`}>
              📱 ลากนิ้วบนจอเพื่อหันกล้อง • ซ้ายเดิน • ขวายิง
            </div>

            {/* Left Side: Cyber D-Pad Movement */}
            <div className={`absolute bottom-3 left-3 z-30 flex-col items-center gap-1.5 pointer-events-auto select-none touch-none ${
              showTouchControls === false
                ? 'hidden'
                : showTouchControls === true
                ? 'flex'
                : 'flex lg:hidden'
            }`}>
              {/* Forward Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); gameRef.current.keys.w = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); gameRef.current.keys.w = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); gameRef.current.keys.w = false; }}
                onMouseDown={() => (gameRef.current.keys.w = true)}
                onMouseUp={() => (gameRef.current.keys.w = false)}
                className="w-12 h-12 rounded-2xl bg-slate-900/90 active:bg-cyan-600 border border-slate-700/80 text-white font-black text-lg flex items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition-transform"
                aria-label="Walk Forward"
              >
                ▲
              </button>
              <div className="flex gap-1.5">
                {/* Strafe Left Button */}
                <button
                  onTouchStart={(e) => { e.stopPropagation(); gameRef.current.keys.a = true; }}
                  onTouchEnd={(e) => { e.stopPropagation(); gameRef.current.keys.a = false; }}
                  onTouchCancel={(e) => { e.stopPropagation(); gameRef.current.keys.a = false; }}
                  onMouseDown={() => (gameRef.current.keys.a = true)}
                  onMouseUp={() => (gameRef.current.keys.a = false)}
                  className="w-12 h-12 rounded-2xl bg-slate-900/90 active:bg-cyan-600 border border-slate-700/80 text-white font-black text-lg flex items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition-transform"
                  aria-label="Strafe Left"
                >
                  ◀
                </button>
                {/* Backward Button */}
                <button
                  onTouchStart={(e) => { e.stopPropagation(); gameRef.current.keys.s = true; }}
                  onTouchEnd={(e) => { e.stopPropagation(); gameRef.current.keys.s = false; }}
                  onTouchCancel={(e) => { e.stopPropagation(); gameRef.current.keys.s = false; }}
                  onMouseDown={() => (gameRef.current.keys.s = true)}
                  onMouseUp={() => (gameRef.current.keys.s = false)}
                  className="w-12 h-12 rounded-2xl bg-slate-900/90 active:bg-cyan-600 border border-slate-700/80 text-white font-black text-lg flex items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition-transform"
                  aria-label="Walk Backward"
                >
                  ▼
                </button>
                {/* Strafe Right Button */}
                <button
                  onTouchStart={(e) => { e.stopPropagation(); gameRef.current.keys.d = true; }}
                  onTouchEnd={(e) => { e.stopPropagation(); gameRef.current.keys.d = false; }}
                  onTouchCancel={(e) => { e.stopPropagation(); gameRef.current.keys.d = false; }}
                  onMouseDown={() => (gameRef.current.keys.d = true)}
                  onMouseUp={() => (gameRef.current.keys.d = false)}
                  className="w-12 h-12 rounded-2xl bg-slate-900/90 active:bg-cyan-600 border border-slate-700/80 text-white font-black text-lg flex items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition-transform"
                  aria-label="Strafe Right"
                >
                  ▶
                </button>
              </div>
              {/* Sprint Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); gameRef.current.keys.shift = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); gameRef.current.keys.shift = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); gameRef.current.keys.shift = false; }}
                className="w-26 py-1 rounded-xl bg-indigo-950/85 active:bg-indigo-600 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1"
              >
                🏃 SPRINT
              </button>
            </div>

            {/* Right Side: Action Buttons (Fire, Jump, Reload) */}
            <div className={`absolute bottom-3 right-3 z-30 flex-col items-end gap-2.5 pointer-events-auto select-none touch-none ${
              showTouchControls === false
                ? 'hidden'
                : showTouchControls === true
                ? 'flex'
                : 'flex lg:hidden'
            }`}>
              <div className="flex gap-2">
                {/* Reload Button */}
                <button
                  onTouchStart={(e) => { e.stopPropagation(); handleReload(); }}
                  onClick={(e) => { e.stopPropagation(); handleReload(); }}
                  className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 active:bg-slate-700 text-cyan-400 font-black text-xs flex flex-col items-center justify-center shadow-lg backdrop-blur-md active:scale-95"
                  aria-label="Reload Ammo"
                >
                  <span className="text-base">🔄</span>
                  <span className="text-[8px] font-bold">RELOAD</span>
                </button>

                {/* Jump Button */}
                <button
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    gameRef.current.keys.space = true;
                    setTimeout(() => (gameRef.current.keys.space = false), 150);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    gameRef.current.keys.space = true;
                    setTimeout(() => (gameRef.current.keys.space = false), 150);
                  }}
                  className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 active:bg-indigo-600 text-white font-black text-xs flex flex-col items-center justify-center shadow-lg backdrop-blur-md active:scale-95"
                  aria-label="Jump"
                >
                  <span className="text-base">⬆️</span>
                  <span className="text-[8px] font-bold">JUMP</span>
                </button>
              </div>

              {/* Big Primary Fire Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); handleShoot(); }}
                onClick={(e) => { e.stopPropagation(); handleShoot(); }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white font-black text-base border-2 border-red-400/60 shadow-[0_0_25px_rgba(239,68,68,0.6)] active:scale-90 flex flex-col items-center justify-center transition-transform"
                aria-label="Fire Gun"
              >
                <span className="text-2xl">🔥</span>
                <span className="text-[11px] uppercase tracking-wider font-extrabold">FIRE</span>
              </button>
            </div>
          </>
        )}

        {/* Start Game / Game Over Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-cyan-500/20">
              ⚡
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              {gameOver ? 'CYBER SYSTEM SHUTDOWN' : 'CYBER STRIKE: 3D FPS ARENA'}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              {gameOver
                ? `คุณถูกกำจัดในรอบที่ ${wave} ด้วยคะแนน ${score} แต้ม! เริ่มต้นใหม่เพื่อทำลายสถิติ`
                : 'สมรภูมินีออนไซเบอร์ 3D เต็มรูปแบบ รองรับทั้งคอมพิวเตอร์ (WASD+เมาส์) และมือถือ (ปุ่มทัชสกรีน+ลากเล็ง 360°)'}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 text-white font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-cyan-500/30 active:scale-95"
            >
              {gameOver ? '🔄 เล่นใหม่อีกครั้ง' : '🚀 เข้าสู่สมรภูมิไซเบอร์ 3D (Start Game)'}
            </button>

            {/* Controls Guide */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-6 max-w-lg text-center sm:text-left">
              <div>
                <span className="font-bold text-white block">[W][A][S][D] / ปุ่มทัชจอยสติ๊ก</span>
                เดินรอบทิศทาง / กระโดด
              </div>
              <div>
                <span className="font-bold text-white block">ลากนิ้วบนจอ / เมาส์</span>
                หันมุมกล้องมองรอบทิศ 360°
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="font-bold text-white block">ปุ่ม 🔥 / คลิกซ้าย</span>
                ยิงกระสุน / รีโหลด [R]
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Stats & Features Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">บอทที่กำจัดได้</div>
          <div className="text-2xl font-black text-slate-800 mt-0.5">{kills} ตัว</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">สภาพแวดล้อม 3D</div>
          <div className="text-xs font-bold text-cyan-600 mt-1.5">Neon Cyber Arena & Rings</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">ระบบฟิสิกส์</div>
          <div className="text-xs font-bold text-emerald-600 mt-1.5">Safe Particle & Damage FX</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">การควบคุม</div>
          <div className="text-xs font-bold text-indigo-600 mt-1.5">Pointer Lock 360° + Jump</div>
        </div>
      </div>
    </div>
  );
}
