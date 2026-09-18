import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Web Audio API Synthesizer for Engine, Nitro, Crash, and Countdown FX
class RacingAudio {
  constructor() {
    this.ctx = null;
    this.engineOsc = null;
    this.engineGain = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.engineOsc) {
      try {
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
        this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start();
      } catch (e) {}
    }
  }
  playCountdownBeep(isGo = false) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isGo ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isGo ? 880 : 440, now);
      if (isGo) {
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // High D6 flare
      }
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.45 : 0.22));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isGo ? 0.46 : 0.23));
    } catch (e) {}
  }
  updateEngine(speed, isNitro, isRevving = false) {
    if (!this.ctx || !this.engineOsc) return;
    try {
      let targetFreq = 42 + speed * 1.05 + (isNitro ? 55 : 0);
      if (isRevving && speed === 0) targetFreq = 75 + Math.random() * 20;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      const targetGain = isRevving && speed === 0 ? 0.08 : 0.04 + (speed / 240) * 0.08;
      this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    } catch (e) {}
  }
  stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
    }
  }
  playNitro() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {}
  }
  playCrash() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }
  playLapChime() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }
}

const raceAudio = new RacingAudio();

export default function Page3() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [countdown, setCountdown] = useState(null); // null, 3, 2, 1, 'GO!'
  const [speed, setSpeed] = useState(0);
  const [position, setPosition] = useState(5);
  const [lap, setLap] = useState(1);
  const [nitro, setNitro] = useState(100);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [distance, setDistance] = useState(0);
  const [lapBanner, setLapBanner] = useState('');
  const [lapTimeStr, setLapTimeStr] = useState('00:00.0');
  const [totalTimeStr, setTotalTimeStr] = useState('00:00.0');
  const [bestLapStr, setBestLapStr] = useState('--:--.-');
  const [finalTimes, setFinalTimes] = useState(null);
  const [showTouchControls, setShowTouchControls] = useState(null); // null = auto (mobile only), true = force show, false = force hide

  const keys = useRef({ left: false, right: false, up: false, down: false, nitro: false });
  const countdownTimers = useRef([]);
  const lastTimeRef = useRef(0);

  // Track Length: 1,800 meters per lap x 3 Laps = 5,400 meters total
  // At ~180 km/h (50 m/s), each lap takes ~36-40s, entire race ~2 minutes of high octane action!
  const LAP_LENGTH = 1800;
  const TOTAL_LAPS = 3;
  const TOTAL_TRACK = LAP_LENGTH * TOTAL_LAPS;

  // Game internal physics & bot state
  const gameState = useRef({
    playerX: -0.22,
    playerSpeed: 0,
    maxSpeed: 215,
    nitroMaxSpeed: 270,
    cameraZ: 0,
    roadCurve: 0,
    targetCurve: 0,
    curveTimer: 0,
    nitroEnergy: 100,
    sparks: [],
    shake: 0,
    lastLapReported: 1,
    raceStarted: false,
    lapStartTime: 0,
    raceStartTime: 0,
    bestLapTimeMs: Infinity,
    // Bots start alongside the player at the starting grid!
    // Balanced AI speeds: Player max speed is 215 km/h (Nitro 270 km/h)
    bots: [
      { id: 1, name: 'Viper Gold', color: '#f59e0b', x: 0.24, z: 0, speed: 0, maxSpeed: 152, accel: 34 },
      { id: 2, name: 'Phantom Blue', color: '#3b82f6', x: -0.48, z: 12, speed: 0, maxSpeed: 165, accel: 38 },
      { id: 3, name: 'Venom Green', color: '#10b981', x: 0.48, z: 22, speed: 0, maxSpeed: 176, accel: 42 },
      { id: 4, name: 'Cyber Purple', color: '#a855f7', x: 0.0, z: 32, speed: 0, maxSpeed: 186, accel: 46 },
    ],
  });

  const clearAllTimers = () => {
    countdownTimers.current.forEach(clearTimeout);
    countdownTimers.current = [];
  };

  const startRace = () => {
    clearAllTimers();
    raceAudio.init();
    setIsPlaying(true);
    setRaceFinished(false);
    setLap(1);
    setDistance(0);
    setPosition(5);
    setLapBanner('');
    setFinalTimes(null);
    setLapTimeStr('00:00.0');
    setTotalTimeStr('00:00.0');

    const s = gameState.current;
    // Starting Grid: Staggered pole positions at z=0 (Start Line)
    s.playerX = -0.22;
    s.playerSpeed = 0;
    s.cameraZ = 0;
    s.nitroEnergy = 100;
    s.sparks = [];
    s.lastLapReported = 1;
    s.raceStarted = false;
    lastTimeRef.current = performance.now();

    // Reset bot positions on starting grid
    s.bots = [
      { id: 1, name: 'Viper Gold', color: '#f59e0b', x: 0.24, z: 0, speed: 0, maxSpeed: 152, accel: 34 },
      { id: 2, name: 'Phantom Blue', color: '#3b82f6', x: -0.48, z: 12, speed: 0, maxSpeed: 165, accel: 38 },
      { id: 3, name: 'Venom Green', color: '#10b981', x: 0.48, z: 22, speed: 0, maxSpeed: 176, accel: 42 },
      { id: 4, name: 'Cyber Purple', color: '#a855f7', x: 0.0, z: 32, speed: 0, maxSpeed: 186, accel: 46 },
    ];

    // Formula 1 Style Countdown Sequence: 3 ... 2 ... 1 ... GO!
    setCountdown(3);
    raceAudio.playCountdownBeep(false);

    const t1 = setTimeout(() => {
      setCountdown(2);
      raceAudio.playCountdownBeep(false);
    }, 1000);

    const t2 = setTimeout(() => {
      setCountdown(1);
      raceAudio.playCountdownBeep(false);
    }, 2000);

    const t3 = setTimeout(() => {
      setCountdown('GO!');
      raceAudio.playCountdownBeep(true);
      const now = performance.now();
      s.raceStarted = true;
      s.raceStartTime = now;
      s.lapStartTime = now;
      setLapBanner('🏁 GO! เริ่มการแข่งขัน รอบที่ 1 / 3!');
      const tBanner = setTimeout(() => setLapBanner(''), 2500);
      countdownTimers.current.push(tBanner);
    }, 3000);

    const t4 = setTimeout(() => {
      setCountdown(null);
    }, 3900);

    countdownTimers.current.push(t1, t2, t3, t4);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = true;
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) keys.current.nitro = true;
    };
    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = false;
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) keys.current.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearAllTimers();
      raceAudio.stopEngine();
    };
  }, []);

  // Format milliseconds to mm:ss.s
  const formatTime = (ms) => {
    const totalSec = Math.max(0, ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const d = Math.floor((totalSec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${d}`;
  };

  // Main Canvas Render Loop with Delta Time
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      const now = performance.now();
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min(0.08, (now - lastTimeRef.current) / 1000); // capped at 80ms
      lastTimeRef.current = now;

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h * 0.48;

      const state = gameState.current;

      // 1. Physics & Bot Movement (when playing)
      if (isPlaying && !raceFinished) {
        if (!state.raceStarted) {
          // During Countdown: cars stay locked on starting grid!
          state.playerSpeed = 0;
          state.bots.forEach((b) => (b.speed = 0));
          // If player revs engine with Gas [W], play revving sound
          raceAudio.updateEngine(0, false, keys.current.up);
        } else {
          // Race is ACTIVE!
          // Update Lap & Race timers
          const currentLapTime = now - state.lapStartTime;
          const currentTotalTime = now - state.raceStartTime;
          setLapTimeStr(formatTime(currentLapTime));
          setTotalTimeStr(formatTime(currentTotalTime));

          // Nitro handling
          const isBoosting = keys.current.nitro && state.nitroEnergy > 0;
          setIsNitroActive(isBoosting);

          if (isBoosting) {
            state.nitroEnergy = Math.max(0, state.nitroEnergy - 28 * dt);
            setNitro(Math.floor(state.nitroEnergy));
            if (Math.random() < 0.25) raceAudio.playNitro();
          } else {
            state.nitroEnergy = Math.min(100, state.nitroEnergy + 9 * dt);
            setNitro(Math.floor(state.nitroEnergy));
          }

          // Acceleration & Braking with delta time
          const topSpd = isBoosting ? state.nitroMaxSpeed : state.maxSpeed;
          if (keys.current.up) {
            const accelRate = isBoosting ? 92 : 58; // km/h per sec
            state.playerSpeed = Math.min(topSpd, state.playerSpeed + accelRate * dt);
          } else if (keys.current.down) {
            const brakeRate = 85; // km/h per sec
            state.playerSpeed = Math.max(0, state.playerSpeed - brakeRate * dt);
          } else {
            const decelRate = 34; // km/h per sec
            state.playerSpeed = Math.max(0, state.playerSpeed - decelRate * dt);
          }

          // Steering with delta time
          const steerSpeed = 1.7 * (Math.min(state.playerSpeed, 140) / 140);
          if (keys.current.left) state.playerX = Math.max(-1.12, state.playerX - steerSpeed * dt);
          if (keys.current.right) state.playerX = Math.min(1.12, state.playerX + steerSpeed * dt);

          // Drift pull on curves
          state.playerX -= state.roadCurve * 0.42 * (state.playerSpeed / 100) * dt;
          state.playerX = Math.max(-1.15, Math.min(1.15, state.playerX));

          // Advance player distance in real meters
          const moveMeters = (state.playerSpeed / 3.6) * dt;
          state.cameraZ += moveMeters;
          setDistance(Math.floor(state.cameraZ));
          setSpeed(Math.floor(state.playerSpeed));
          raceAudio.updateEngine(state.playerSpeed, isBoosting, false);

          // Lap Progress Check
          const currentLap = Math.min(TOTAL_LAPS, Math.floor(state.cameraZ / LAP_LENGTH) + 1);
          setLap(currentLap);

          if (currentLap > state.lastLapReported) {
            state.lastLapReported = currentLap;
            raceAudio.playLapChime();

            // Record Lap Time
            if (currentLapTime < state.bestLapTimeMs) {
              state.bestLapTimeMs = currentLapTime;
              setBestLapStr(formatTime(currentLapTime));
            }
            state.lapStartTime = now;

            // Bonus Nitro on new lap
            state.nitroEnergy = Math.min(100, state.nitroEnergy + 35);
            setNitro(Math.floor(state.nitroEnergy));

            const bannerText = currentLap === 3 ? '⚡ FINAL LAP! รอบสุดท้ายชี้ชะตา!' : `🏁 เข้าสู่รอบที่ ${currentLap} / 3 (+NOS โบนัส)`;
            setLapBanner(bannerText);
            const tBanner = setTimeout(() => setLapBanner(''), 3000);
            countdownTimers.current.push(tBanner);
          }

          // Curve generation
          state.curveTimer -= dt * 60;
          if (state.curveTimer <= 0) {
            state.curveTimer = 160 + Math.random() * 120;
            state.targetCurve = (Math.random() - 0.5) * 1.6;
          }
          state.roadCurve += (state.targetCurve - state.roadCurve) * (1.8 * dt);

          // 2. AI Bot Update with Realistic Acceleration & Fair Speed
          state.bots.forEach((bot) => {
            let targetSpeed = bot.maxSpeed;
            const distFromPlayer = bot.z - state.cameraZ;

            // Fair rubber-banding:
            // If bot is far ahead (> 160m), ease off slightly so player can catch up
            // If bot is far behind (> 120m), push moderately, but never cheat above 192 km/h
            if (distFromPlayer > 160) {
              targetSpeed = Math.max(135, bot.maxSpeed - 18);
            } else if (distFromPlayer < -120) {
              targetSpeed = Math.min(192, bot.maxSpeed + 12);
            }

            // Realistic bot acceleration
            if (bot.speed < targetSpeed) {
              bot.speed = Math.min(targetSpeed, bot.speed + bot.accel * dt);
            } else {
              bot.speed = Math.max(targetSpeed, bot.speed - 28 * dt);
            }

            // Move bot forward in real meters
            bot.z += (bot.speed / 3.6) * dt;

            // Gentle lane wandering
            bot.laneTimer = (bot.laneTimer || 0) + dt;
            if (bot.laneTimer > 3.0) {
              bot.targetX = (Math.random() - 0.5) * 1.2;
              bot.laneTimer = 0;
            }
            if (bot.targetX !== undefined) {
              bot.x += (bot.targetX - bot.x) * (0.8 * dt);
            }

            // Collision detection with player car
            const relZ = bot.z - state.cameraZ;
            if (relZ > -3 && relZ < 7) {
              const dx = Math.abs(bot.x - state.playerX);
              if (dx < 0.28) {
                state.playerSpeed = Math.max(30, state.playerSpeed - 25);
                state.shake = 9;
                raceAudio.playCrash();

                // Nudge apart
                if (bot.x > state.playerX) {
                  bot.x = Math.min(0.85, bot.x + 0.08);
                  state.playerX = Math.max(-0.85, state.playerX - 0.08);
                } else {
                  bot.x = Math.max(-0.85, bot.x - 0.08);
                  state.playerX = Math.min(0.85, state.playerX + 0.08);
                }

                // Sparks
                for (let i = 0; i < 8; i++) {
                  state.sparks.push({
                    x: cx + (state.playerX * w * 0.38),
                    y: h * 0.82,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 6,
                    life: 14,
                  });
                }
              }
            }
          });

          // Calculate Real-time Leaderboard Position
          let rank = 1;
          state.bots.forEach((bot) => {
            if (bot.z > state.cameraZ) rank++;
          });
          setPosition(rank);

          // Check 3 Laps Finished
          if (state.cameraZ >= TOTAL_TRACK) {
            setRaceFinished(true);
            setIsPlaying(false);
            raceAudio.stopEngine();
            const totalMs = now - state.raceStartTime;
            setFinalTimes({
              total: formatTime(totalMs),
              bestLap: formatTime(Math.min(state.bestLapTimeMs, currentLapTime)),
              finalRank: rank,
            });
          }
        }
      }

      // Camera Shake
      if (state.shake > 0) state.shake -= dt * 60;
      const shakeX = (Math.random() - 0.5) * state.shake;
      const shakeY = (Math.random() - 0.5) * state.shake;

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 3. Dynamic Time of Day Sky (Changes per Lap)
      // Lap 1: Golden Sunset, Lap 2: Twilight Violet, Lap 3: Cyberpunk Neon Night
      const currentLapNum = Math.min(3, Math.floor(state.cameraZ / LAP_LENGTH) + 1);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, cy);
      if (currentLapNum === 1) {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.5, '#312e81');
        skyGrad.addColorStop(0.8, '#831843');
        skyGrad.addColorStop(1, '#ea580c');
      } else if (currentLapNum === 2) {
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.5, '#1e1b4b');
        skyGrad.addColorStop(0.8, '#4c1d95');
        skyGrad.addColorStop(1, '#a21caf');
      } else {
        skyGrad.addColorStop(0, '#000000');
        skyGrad.addColorStop(0.6, '#090d16');
        skyGrad.addColorStop(0.9, '#0369a1');
        skyGrad.addColorStop(1, '#06b6d4');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, cy);

      // Distant Sun or Moon
      const celestialY = cy - 25;
      const celestialGrad = ctx.createRadialGradient(cx, celestialY, 10, cx, celestialY, 70);
      if (currentLapNum === 3) {
        celestialGrad.addColorStop(0, '#e0f2fe');
        celestialGrad.addColorStop(0.5, '#38bdf8');
        celestialGrad.addColorStop(1, '#38bdf800');
      } else {
        celestialGrad.addColorStop(0, '#fef08a');
        celestialGrad.addColorStop(0.5, '#f97316');
        celestialGrad.addColorStop(1, '#f9731600');
      }
      ctx.fillStyle = celestialGrad;
      ctx.beginPath();
      ctx.arc(cx, celestialY, 70, 0, Math.PI * 2);
      ctx.fill();

      // Distant City Skyline
      ctx.fillStyle = currentLapNum === 3 ? '#020617' : '#18181b';
      for (let i = 0; i < w; i += 45) {
        const bh = 25 + Math.sin(i * 0.05 + 2) * 20 + ((i * 13) % 25);
        ctx.fillRect(i, cy - bh, 40, bh);
        if (currentLapNum === 3 && i % 90 === 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(i + 10, cy - bh + 10, 8, 8);
          ctx.fillStyle = '#020617';
        }
      }

      // 4. Render 3D Pseudo Perspective Curved Road
      ctx.fillStyle = currentLapNum === 3 ? '#022c22' : '#064e3b';
      ctx.fillRect(0, cy, w, h - cy);

      const segments = 110;
      for (let i = segments; i > 0; i--) {
        const z1 = i * 16;
        const z2 = (i - 1) * 16;

        const y1 = cy + (h - cy) * (1 / (z1 * 0.032 + 1));
        const y2 = cy + (h - cy) * (1 / (z2 * 0.032 + 1));

        const roadW1 = (w * 0.72) * (1 / (z1 * 0.032 + 1));
        const roadW2 = (w * 0.72) * (1 / (z2 * 0.032 + 1));

        const curveOffset1 = state.roadCurve * Math.pow((segments - i) / segments, 2) * 160;
        const curveOffset2 = state.roadCurve * Math.pow((segments - (i - 1)) / segments, 2) * 160;

        const roadX1 = cx + curveOffset1 - (state.playerX * (w * 0.35) * (1 / (z1 * 0.032 + 1)));
        const roadX2 = cx + curveOffset2 - (state.playerX * (w * 0.35) * (1 / (z2 * 0.032 + 1)));

        // Absolute distance on track for this segment
        const absoluteZ = state.cameraZ + z1 * 0.6;
        const isStrip = Math.floor(absoluteZ / 12) % 2 === 0;

        // Check if this segment represents a Finish / Start Line (at 0, 1800, 3600, 5400m)
        const lapModulo = absoluteZ % LAP_LENGTH;
        const isFinishCheckered = lapModulo < 20;

        // Road Surface
        if (isFinishCheckered) {
          // Checkered start/finish line
          ctx.fillStyle = isStrip ? '#ffffff' : '#000000';
        } else {
          ctx.fillStyle = isStrip ? '#1e293b' : '#334155';
        }

        ctx.beginPath();
        ctx.moveTo(roadX1 - roadW1, y1);
        ctx.lineTo(roadX1 + roadW1, y1);
        ctx.lineTo(roadX2 + roadW2, y2);
        ctx.lineTo(roadX2 - roadW2, y2);
        ctx.fill();

        // Curbs (Red & White)
        const curbW1 = roadW1 * 0.09;
        const curbW2 = roadW2 * 0.09;
        ctx.fillStyle = isStrip ? '#ef4444' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(roadX1 - roadW1 - curbW1, y1);
        ctx.lineTo(roadX1 - roadW1, y1);
        ctx.lineTo(roadX2 - roadW2, y2);
        ctx.lineTo(roadX2 - roadW2 - curbW2, y2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(roadX1 + roadW1, y1);
        ctx.lineTo(roadX1 + roadW1 + curbW1, y1);
        ctx.lineTo(roadX2 + roadW2 + curbW2, y2);
        ctx.lineTo(roadX2 + roadW2, y2);
        ctx.fill();

        // Center lane marker
        if (!isFinishCheckered && isStrip) {
          ctx.fillStyle = '#facc15';
          const laneW1 = roadW1 * 0.03;
          const laneW2 = roadW2 * 0.03;
          ctx.beginPath();
          ctx.moveTo(roadX1 - laneW1, y1);
          ctx.lineTo(roadX1 + laneW1, y1);
          ctx.lineTo(roadX2 + laneW2, y2);
          ctx.lineTo(roadX2 - laneW2, y2);
          ctx.fill();
        }

        // Draw Starting Grid Boxes when near race start
        if (absoluteZ < 45 && absoluteZ > 0 && Math.floor(absoluteZ / 10) % 2 === 0) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(roadX1 - roadW1 * 0.5, y1 - 2, roadW1 * 0.4, 4);
          ctx.strokeRect(roadX1 + roadW1 * 0.1, y1 - 2, roadW1 * 0.4, 4);
        }
      }

      // 5. Render AI Bot Cars (Projected in 3D)
      const visibleBots = state.bots
        .map((bot) => {
          const relZ = bot.z - state.cameraZ;
          return { ...bot, relZ };
        })
        .filter((b) => b.relZ > -5 && b.relZ < 300)
        .sort((a, b) => b.relZ - a.relZ);

      visibleBots.forEach((bot) => {
        const clampedRelZ = Math.max(0, bot.relZ);
        const scale = 1 / (clampedRelZ * 0.016 + 1);
        const botY = cy + (h - cy) * scale;
        const curveOffset = state.roadCurve * Math.pow(scale, 1.5) * 160;
        const botX = cx + curveOffset + (bot.x - state.playerX) * (w * 0.35) * scale;

        const carW = 105 * scale;
        const carH = 55 * scale;

        if (carW < 4) return;

        ctx.save();
        ctx.translate(botX, botY);

        // Shadow
        ctx.fillStyle = '#00000066';
        ctx.beginPath();
        ctx.ellipse(0, 0, carW * 0.55, carH * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Car Body
        ctx.fillStyle = bot.color;
        ctx.fillRect(-carW * 0.5, -carH * 0.8, carW, carH * 0.7);

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-carW * 0.35, -carH * 1.15, carW * 0.7, carH * 0.4);

        // Spoiler
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-carW * 0.55, -carH * 1.25, carW * 1.1, carH * 0.15);

        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-carW * 0.45, -carH * 0.7, carW * 0.2, carH * 0.2);
        ctx.fillRect(carW * 0.25, -carH * 0.7, carW * 0.2, carH * 0.2);

        // Name Tag & Speed
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, Math.floor(13 * scale))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(bot.name, 0, -carH * 1.4);

        ctx.restore();
      });

      // 6. Render Player Car (Bottom Center)
      const pCarW = 145;
      const pCarH = 75;
      const pCarX = cx;
      const pCarY = h * 0.84;

      const lean = (keys.current.left ? -8 : keys.current.right ? 8 : 0);

      ctx.save();
      ctx.translate(pCarX, pCarY);
      ctx.rotate((lean * Math.PI) / 180);

      // Nitro Flame Particles
      if (keys.current.nitro && state.nitroEnergy > 0) {
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? '#38bdf8' : '#60a5fa';
          ctx.beginPath();
          ctx.arc(-pCarW * 0.3 + (Math.random() - 0.5) * 8, pCarH * 0.3 + Math.random() * 25, 6 + Math.random() * 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pCarW * 0.3 + (Math.random() - 0.5) * 8, pCarH * 0.3 + Math.random() * 25, 6 + Math.random() * 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Player Car Shadow
      ctx.fillStyle = '#00000088';
      ctx.beginPath();
      ctx.ellipse(0, pCarH * 0.25, pCarW * 0.55, pCarH * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rear Bumper & Main Body (Red Hypercar)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-pCarW * 0.5, -pCarH * 0.5, pCarW, pCarH * 0.65, 12);
      ctx.fill();

      // Diffuser
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-pCarW * 0.4, pCarH * 0.05, pCarW * 0.8, pCarH * 0.2);

      // Exhaust Pipes
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(-pCarW * 0.25, pCarH * 0.15, 6, 0, Math.PI * 2);
      ctx.arc(pCarW * 0.25, pCarH * 0.15, 6, 0, Math.PI * 2);
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(-pCarW * 0.36, -pCarH * 0.95, pCarW * 0.72, pCarH * 0.5, 10);
      ctx.fill();
      ctx.fillStyle = '#38bdf844';
      ctx.fillRect(-pCarW * 0.28, -pCarH * 0.9, pCarW * 0.56, pCarH * 0.2);

      // Spoiler
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-pCarW * 0.54, -pCarH * 1.05, pCarW * 1.08, pCarH * 0.16);

      // LED Taillights
      ctx.fillStyle = '#f87171';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.fillRect(-pCarW * 0.46, -pCarH * 0.45, pCarW * 0.32, pCarH * 0.16);
      ctx.fillRect(pCarW * 0.14, -pCarH * 0.45, pCarW * 0.32, pCarH * 0.16);
      ctx.shadowBlur = 0;

      ctx.restore();

      // 7. Sparks Particles
      for (let i = state.sparks.length - 1; i >= 0; i--) {
        const sp = state.sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life--;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(sp.x, sp.y, 3, 3);
        if (sp.life <= 0) state.sparks.splice(i, 1);
      }

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, raceFinished]);

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
              Page 3
            </span>
            <span className="text-xs text-slate-500 font-medium">🏎️ Grand Prix 3 Laps vs AI Bots</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Page 3: Turbo Drift Racer (3 Laps Grand Prix)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            การแข่งขัน 3 รอบสนามเต็มรูปแบบ (5,400 เมตร) ออกสตาร์ตพร้อมกันจากจุดกริด นับถอยหลัง 3..2..1..GO!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/page2"
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            ← ไป Page 2 (3D FPS)
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-sm"
          >
            กลับหน้าหลัก 🏠
          </Link>
        </div>
      </div>

      {/* Main Racing Canvas Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-slate-950">
        
        {/* Lap Banner Announcement Flash */}
        {lapBanner && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm sm:text-base tracking-wider shadow-2xl animate-bounce border border-white/30 backdrop-blur-md">
            {lapBanner}
          </div>
        )}

        {/* Top Racing HUD */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-5 flex items-center justify-between pointer-events-none">
          {/* Position Rank & Current Lap */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2.5 shadow-lg">
              <span className="text-xs font-bold text-slate-400">อันดับ (POS)</span>
              <span className={`text-2xl font-black ${position === 1 ? 'text-amber-400' : 'text-white'}`}>
                {position}
                <span className="text-xs text-slate-400 font-normal"> / 5</span>
              </span>
            </div>

            <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-center shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">รอบสนาม (Lap)</span>
              <span className={`text-base font-black ${lap === 3 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`}>
                {lap === 3 ? 'FINAL LAP' : `${lap} / ${TOTAL_LAPS}`}
              </span>
            </div>
          </div>

          {/* Lap & Total Time Tracker */}
          <div className="hidden md:flex bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 items-center gap-4 shadow-lg">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">LAP TIME</div>
              <div className="text-sm font-black text-white font-mono">{lapTimeStr}</div>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase">BEST LAP</div>
              <div className="text-sm font-black text-amber-400 font-mono">{bestLapStr}</div>
            </div>
          </div>

          {/* Controls Toggle & Speedometer */}
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

            {/* Speedometer & Nitro Gauge */}
            <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-lg">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Speed</div>
                <div className="text-xl font-black text-cyan-400 font-mono leading-none">
                  {speed} <span className="text-[10px] text-slate-400">KM/H</span>
                </div>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase">NOS</div>
                <div className="w-16 h-2.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isNitroActive ? 'bg-cyan-400 animate-pulse' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${nitro}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Track Distance Radar / Progress Bar */}
        <div className="absolute top-20 right-4 sm:right-6 z-20 hidden sm:flex flex-col items-end gap-1 pointer-events-none">
          <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-400 flex items-center gap-2">
            <span>🏁 DISTANCE:</span>
            <span className="text-indigo-400 font-mono">{distance} / {TOTAL_TRACK} M</span>
          </div>
          <div className="w-44 h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (distance / TOTAL_TRACK) * 100)}%` }}
            />
          </div>
        </div>

        {/* Formula 1 Starting Gantry & Countdown Display */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none select-none bg-black/40 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              {/* 4 Lights Gantry */}
              <div className="flex items-center gap-3 bg-slate-950/90 px-6 py-3 rounded-2xl border-2 border-slate-800 shadow-2xl backdrop-blur-md">
                <div className={`w-8 h-8 rounded-full border-2 transition-all ${countdown === 3 ? 'bg-red-500 border-red-300 shadow-[0_0_25px_#ef4444]' : 'bg-red-950/50 border-red-900/40'}`} />
                <div className={`w-8 h-8 rounded-full border-2 transition-all ${countdown === 2 ? 'bg-amber-500 border-amber-300 shadow-[0_0_25px_#f59e0b]' : 'bg-amber-950/50 border-amber-900/40'}`} />
                <div className={`w-8 h-8 rounded-full border-2 transition-all ${countdown === 1 ? 'bg-amber-400 border-amber-200 shadow-[0_0_25px_#facc15]' : 'bg-amber-950/50 border-amber-900/40'}`} />
                <div className={`w-8 h-8 rounded-full border-2 transition-all ${countdown === 'GO!' ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_30px_#10b981]' : 'bg-emerald-950/50 border-emerald-900/40'}`} />
              </div>

              {/* Huge Pulsing Countdown Text */}
              <div className="text-center mt-2">
                <div
                  key={countdown}
                  className={`font-black tracking-widest uppercase transition-all transform animate-bounce ${
                    countdown === 'GO!'
                      ? 'text-7xl sm:text-9xl text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.9)]'
                      : countdown === 3
                      ? 'text-7xl sm:text-9xl text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.9)]'
                      : 'text-7xl sm:text-9xl text-amber-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.9)]'
                  }`}
                >
                  {countdown}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 tracking-wider mt-2 bg-slate-900/85 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  {countdown === 'GO!' ? '🚀 ออกตัวพร้อมกัน! เร่งเครื่องเต็มพิกัด!' : '🚦 เตรียมพร้อมที่จุดสตาร์ต (Starting Grid)'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Race Display */}
        <canvas
          ref={canvasRef}
          className="w-full h-[460px] sm:h-[540px] block"
        />

        {/* Start / Finish Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-amber-500/20">
              {raceFinished ? (position === 1 ? '🏆' : '🏁') : '🏎️'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              {raceFinished
                ? (position === 1 ? '🏆 VICTORY! แชมป์อันดับ 1 GRAND PRIX' : `🏁 จบการแข่งขัน 3 รอบ! เข้าเส้นชัยอันดับที่ ${position}`)
                : 'TURBO RACING: 3 LAPS GRAND PRIX'}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mb-4 leading-relaxed">
              {raceFinished
                ? `คุณแข่งขันครบทั้ง 3 รอบ (5,400 ม.) เข้าเส้นชัยอันดับที่ ${position} / 5! เริ่มใหม่อีกครั้งเพื่อพิชิตถ้วยรางวัลอันดับ 1`
                : 'การแข่งขัน 3 รอบสนามเต็มรูปแบบ (5,400 เมตร) ออกสตาร์ตพร้อมกับบอท AI 4 คันจากจุดกริด ขับประชันความเร็วและใช้ไนโตรแซงคว้าแชมป์!'}
            </p>

            {/* Post-race Stats Breakdown */}
            {raceFinished && finalTimes && (
              <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-6 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-left">
                <div className="p-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">ตำแหน่ง</span>
                  <span className={`text-xl font-black ${finalTimes.finalRank === 1 ? 'text-amber-400' : 'text-white'}`}>
                    อันดับ {finalTimes.finalRank}
                  </span>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">เวลารวม</span>
                  <span className="text-base font-black text-cyan-400 font-mono">
                    {finalTimes.total}
                  </span>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">รอบเร็วที่สุด</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {finalTimes.bestLap}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={startRace}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-amber-500/30 active:scale-95"
            >
              {raceFinished ? '🔄 เริ่มแข่งใหม่อีกครั้ง (Restart Race)' : '🏁 สตาร์ตการแข่งขัน (นับถอยหลังพร้อมบอท)'}
            </button>

            {/* Controls Guide */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-5 text-center sm:text-left">
              <div>
                <span className="font-bold text-white block">เลี้ยว: [A][D] / ปุ่ม ◀ ▶</span>
                เลี้ยวซ้ายและขวา
              </div>
              <div>
                <span className="font-bold text-white block">เร่ง: [W] / แป้นคันเร่ง 🚗</span>
                เหยียบคันเร่ง (GAS)
              </div>
              <div>
                <span className="font-bold text-white block">เบรก: [S] / ปุ่ม 🛑</span>
                ชะลอความเร็ว (BRAKE)
              </div>
              <div>
                <span className="font-bold text-white block">ไนโตร: [Space] / ⚡</span>
                ไนโตรบูสต์เทอร์โบ (NOS)
              </div>
            </div>
          </div>
        )}

        {/* On-screen Touch Controls for Mobile */}
        {isPlaying && (
          <div className={`absolute bottom-3 left-3 right-3 z-30 items-end justify-between pointer-events-auto select-none touch-none ${
            showTouchControls === false
              ? 'hidden'
              : showTouchControls === true
              ? 'flex'
              : 'flex lg:hidden'
          }`}>
            {/* Left Hand: Steering */}
            <div className="flex gap-2">
              <button
                onTouchStart={(e) => { e.stopPropagation(); keys.current.left = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); keys.current.left = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); keys.current.left = false; }}
                onMouseDown={() => (keys.current.left = true)}
                onMouseUp={() => (keys.current.left = false)}
                className="w-15 h-15 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/90 text-white font-black text-2xl border-2 border-slate-700/80 active:bg-indigo-600 active:border-indigo-400 active:scale-95 shadow-2xl backdrop-blur-md transition-transform flex items-center justify-center"
                aria-label="Steer Left"
              >
                ◀
              </button>
              <button
                onTouchStart={(e) => { e.stopPropagation(); keys.current.right = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); keys.current.right = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); keys.current.right = false; }}
                onMouseDown={() => (keys.current.right = true)}
                onMouseUp={() => (keys.current.right = false)}
                className="w-15 h-15 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/90 text-white font-black text-2xl border-2 border-slate-700/80 active:bg-indigo-600 active:border-indigo-400 active:scale-95 shadow-2xl backdrop-blur-md transition-transform flex items-center justify-center"
                aria-label="Steer Right"
              >
                ▶
              </button>
            </div>

            {/* Right Hand: NOS, BRAKE, and GAS */}
            <div className="flex items-center gap-2">
              {/* Nitro Boost Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); keys.current.nitro = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); keys.current.nitro = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); keys.current.nitro = false; }}
                onMouseDown={() => (keys.current.nitro = true)}
                onMouseUp={() => (keys.current.nitro = false)}
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-cyan-600/90 text-white font-black text-xs border-2 border-cyan-400 active:bg-cyan-400 active:scale-95 shadow-xl shadow-cyan-500/30 backdrop-blur-md flex flex-col items-center justify-center transition-transform"
                aria-label="Nitro Boost"
              >
                <span className="text-base sm:text-lg">⚡</span>
                <span className="text-[9px] font-extrabold">NOS</span>
              </button>

              {/* Brake Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); keys.current.down = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); keys.current.down = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); keys.current.down = false; }}
                onMouseDown={() => (keys.current.down = true)}
                onMouseUp={() => (keys.current.down = false)}
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-rose-700/90 text-white font-black text-xs border-2 border-rose-500 active:bg-rose-500 active:scale-95 shadow-xl shadow-rose-600/30 backdrop-blur-md flex flex-col items-center justify-center transition-transform"
                aria-label="Brake"
              >
                <span className="text-base sm:text-lg">🛑</span>
                <span className="text-[9px] font-extrabold">BRAKE</span>
              </button>

              {/* Large Gas Pedal Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); keys.current.up = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); keys.current.up = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); keys.current.up = false; }}
                onMouseDown={() => (keys.current.up = true)}
                onMouseUp={() => (keys.current.up = false)}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white font-black text-xs border-2 border-emerald-300 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.5)] backdrop-blur-md flex flex-col items-center justify-center transition-transform"
                aria-label="Accelerate"
              >
                <span className="text-2xl sm:text-3xl">🚗</span>
                <span className="text-[11px] font-black uppercase tracking-wider">GAS</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Bot Competitors (Balanced Speeds) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">Viper Gold</div>
            <div className="text-[10px] text-slate-400">AI Bot • 152 km/h (Grid Slot 1)</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">Phantom Blue</div>
            <div className="text-[10px] text-slate-400">AI Bot • 165 km/h (Grid Slot 2)</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">Venom Green</div>
            <div className="text-[10px] text-slate-400">AI Bot • 176 km/h (Grid Slot 3)</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            4
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">Cyber Purple</div>
            <div className="text-[10px] text-slate-400">AI Bot • 186 km/h (Grid Slot 4)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
