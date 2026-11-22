'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Tag,
  Info,
  X,
  Zap,
  Volume2,
  VolumeX,
  ChevronRight,
  Compass,
  Cpu,
  Heart as HeartIcon,
  ChevronUp,
} from 'lucide-react';
import { ARButton } from './ar-button';
import { OrganType } from '@/lib/three/types';
import { getProceduralOrganGenerator, getOrganHotspots } from '@/lib/three/organ-models/index';

export interface Hotspot {
  id: string;
  name: string;
  position?: string;
  normal?: string;
  description?: string;
  clinicalFunction?: string;
  system?: string;
  normalizedPosition?: [number, number, number];
}

interface ModelViewerProps {
  modelUrl?: string;
  thumbnailUrl?: string;
  organName: string;
  systemName?: string;
  slug?: string;
  description?: string;
  hotspots?: Hotspot[];
  className?: string;
}

/** Map organ string & anatomical system context → canonical OrganType */
function resolveOrganType(
  organName: string,
  systemName?: string,
  slug?: string,
  description?: string,
): OrganType {
  const combined = `${organName || ''} ${slug || ''} ${description || ''}`.toLowerCase();
  const sys = (systemName || '').toLowerCase();

  // 1. Direct organ keyword matches
  if (combined.includes('heart') || combined.includes('cor ') || combined.includes('cardio') || combined.includes('aorta')) return 'heart';
  if (combined.includes('brain') || combined.includes('encephal') || combined.includes('cerebr') || combined.includes('neuro') || combined.includes('cortex')) return 'brain';
  if (combined.includes('lung') || combined.includes('pulmon') || combined.includes('bronch') || combined.includes('trachea')) return 'lungs';
  if (combined.includes('kidney') || combined.includes('renal') || combined.includes('ren ') || combined.includes('nephr')) return 'kidney';
  if (combined.includes('liver') || combined.includes('hepat') || combined.includes('hepar') || combined.includes('gallbladder')) return 'liver';
  if (combined.includes('stomach') || combined.includes('gaster') || combined.includes('gastr') || combined.includes('peptic')) return 'stomach';
  if (combined.includes('pancrea') || combined.includes('islet')) return 'pancreas';
  if (combined.includes('spleen') || combined.includes('lien') || combined.includes('splen')) return 'spleen';
  if (combined.includes('eye') || combined.includes('ocul') || combined.includes('optic') || combined.includes('retina')) return 'eye';
  if (combined.includes('large intestine') || combined.includes('colon') || combined.includes('cecum') || combined.includes('bowel') || combined.includes('large_int')) return 'large_intestine';
  if (combined.includes('small intestine') || combined.includes('ileum') || combined.includes('jejun') || combined.includes('duoden') || combined.includes('small_int')) return 'small_intestine';
  if (combined.includes('bladder') || combined.includes('vesic') || combined.includes('urinar')) return 'bladder';
  if (combined.includes('thyroid') || combined.includes('parathyroid') || combined.includes('goiter')) return 'thyroid';
  if (combined.includes('femur') || combined.includes('bone') || combined.includes('femor') || combined.includes('osteo') || combined.includes('skelet') || combined.includes('tibia')) return 'femur';
  if (combined.includes('muscle') || combined.includes('muscl') || combined.includes('myo') || combined.includes('bicep') || combined.includes('tricep')) return 'muscle';

  // 2. Anatomical System Context
  if (sys.includes('digestive') || sys.includes('gastro')) return 'stomach';
  if (sys.includes('nervous') || sys.includes('neuro')) return 'brain';
  if (sys.includes('respiratory')) return 'lungs';
  if (sys.includes('urinary') || sys.includes('renal')) return 'kidney';
  if (sys.includes('cardiovascular') || sys.includes('circulat')) return 'heart';
  if (sys.includes('skeletal')) return 'femur';
  if (sys.includes('muscular')) return 'muscle';
  if (sys.includes('endocrine')) return 'thyroid';
  if (sys.includes('immune') || sys.includes('lymphatic')) return 'spleen';
  if (sys.includes('integumentary')) return 'muscle';
  if (sys.includes('reproductive')) return 'bladder';

  return 'kidney';
}

/** Default dimensions per organ (mm) */
const DEFAULT_DIMS: Record<string, { lengthMm: number; widthMm: number; heightMm: number }> = {
  heart: { lengthMm: 120, widthMm: 90, heightMm: 80 },
  brain: { lengthMm: 160, widthMm: 140, heightMm: 120 },
  lungs: { lengthMm: 250, widthMm: 160, heightMm: 120 },
  kidney: { lengthMm: 110, widthMm: 60, heightMm: 50 },
  liver: { lengthMm: 230, widthMm: 170, heightMm: 150 },
  stomach: { lengthMm: 250, widthMm: 120, heightMm: 100 },
  eye: { lengthMm: 24, widthMm: 24, heightMm: 24 },
  large_intestine: { lengthMm: 200, widthMm: 60, heightMm: 50 },
  small_intestine: { lengthMm: 150, widthMm: 40, heightMm: 35 },
  pancreas: { lengthMm: 160, widthMm: 50, heightMm: 40 },
  spleen: { lengthMm: 130, widthMm: 75, heightMm: 50 },
  bladder: { lengthMm: 110, widthMm: 90, heightMm: 80 },
  thyroid: { lengthMm: 60, widthMm: 50, heightMm: 25 },
  femur: { lengthMm: 450, widthMm: 90, heightMm: 90 },
  muscle: { lengthMm: 350, widthMm: 50, heightMm: 50 },
};

/** Categorized color palette for anatomical systems */
function getLandmarkColor(system: string = '', index: number = 0) {
  const s = system.toLowerCase();
  if (s.includes('arterial') || s.includes('artery') || s.includes('coronary') || s.includes('aorta')) {
    return {
      bg: 'bg-rose-500',
      text: 'text-rose-400',
      border: 'border-rose-400/50',
      glow: 'rgba(244, 63, 94, 0.45)',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      label: 'Arterial Vasculature',
    };
  }
  if (s.includes('venous') || s.includes('vein') || s.includes('cava') || s.includes('pulmonary')) {
    return {
      bg: 'bg-blue-500',
      text: 'text-blue-400',
      border: 'border-blue-400/50',
      glow: 'rgba(59, 130, 246, 0.45)',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      label: 'Venous Vasculature',
    };
  }
  if (s.includes('cortex') || s.includes('telencephalon') || s.includes('myocardium')) {
    return {
      bg: 'bg-teal-500',
      text: 'text-teal-400',
      border: 'border-teal-400/50',
      glow: 'rgba(20, 184, 166, 0.45)',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      label: 'Functional Parenchyma',
    };
  }
  if (s.includes('nerve') || s.includes('conduction') || s.includes('brainstem') || s.includes('autonomic')) {
    return {
      bg: 'bg-amber-500',
      text: 'text-amber-400',
      border: 'border-amber-400/50',
      glow: 'rgba(245, 158, 11, 0.45)',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      label: 'Neural & Conduction',
    };
  }
  const palettes = [
    { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400/50', glow: 'rgba(16, 185, 129, 0.45)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Anatomical Structure' },
    { bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-400/50', glow: 'rgba(139, 92, 246, 0.45)', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30', label: 'Structural Landmark' },
    { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400/50', glow: 'rgba(6, 182, 212, 0.45)', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', label: 'Tissue Interface' },
  ];
  return palettes[index % palettes.length];
}

export function ModelViewer({
  modelUrl,
  thumbnailUrl,
  organName,
  systemName,
  slug,
  description,
  hotspots = [],
  className = '',
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);
  const organGroupRef = useRef<THREE.Group | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // States
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Default to false so on mobile the 3D organ is NEVER obstructed
  const [showLabelsList, setShowLabelsList] = useState(false);
  const [show3DPins, setShow3DPins] = useState(true);
  const [xrayMode, setXrayMode] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pin2DPositions, setPin2DPositions] = useState<Array<{ id: string; x: number; y: number; visible: boolean }>>([]);

  const safeOrganName = organName || 'Anatomical Specimen';
  const organType = resolveOrganType(safeOrganName, systemName, slug, description);
  const dims = DEFAULT_DIMS[organType] || DEFAULT_DIMS.heart;

  // On desktop screens, open labels list by default; on mobile, keep closed so organ is full view
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setShowLabelsList(true);
    }
  }, []);

  // Retrieve standardized anatomical landmarks
  const resolvedHotspots: Hotspot[] = useMemo(() => {
    if (hotspots && hotspots.length > 0) return hotspots;
    const std = getOrganHotspots(organType);
    if (std && std.length > 0) {
      return std.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        clinicalFunction: s.clinicalFunction,
        system: s.system,
        normalizedPosition: s.normalizedPosition,
      }));
    }
    return [
      { id: 'hs-1', name: `${safeOrganName} — Anterior Aspect`, description: 'Principal anterior-facing architectural boundary.', clinicalFunction: 'Anterior surgical access window.', system: 'Anatomical Landmark', normalizedPosition: [0, 0.2, 0.4] },
      { id: 'hs-2', name: 'Primary Vascular Pedicle', description: 'Major inflow arterial supply and venous drainage plexus.', clinicalFunction: 'Vascular clamping & ligation zone.', system: 'Cardiovascular (Arterial)', normalizedPosition: [0.15, 0.4, 0.1] },
      { id: 'hs-3', name: 'Functional Parenchymal Zone', description: 'Primary physiological working tissue mass.', clinicalFunction: 'Primary organ-specific metabolism.', system: 'Functional Parenchyma', normalizedPosition: [-0.2, -0.1, 0.2] },
      { id: 'hs-4', name: 'Structural Supporting Capsule', description: 'Fibroelastic protective capsule providing shape integrity.', clinicalFunction: 'Prevents interstitial overexpansion.', system: 'Structural Landmark', normalizedPosition: [0.2, -0.2, -0.1] },
      { id: 'hs-5', name: 'Hilar Neurovascular Confluence', description: 'Entry point for nerves, vessels, and lymphatic drainage.', clinicalFunction: 'Nerve bundle block reference point.', system: 'Neural & Conduction', normalizedPosition: [0, 0, -0.25] },
    ];
  }, [hotspots, organType, safeOrganName]);

  // Web Audio Heartbeat Synthesizer
  const playHeartbeatSound = useCallback(() => {
    if (audioMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // "Lub" (S1 - AV Valve Closure)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // "Dub" (S2 - Semilunar Valve Closure - 0.26s later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(85, now + 0.26);
      osc2.frequency.exponentialRampToValueAtTime(40, now + 0.36);
      gain2.gain.setValueAtTime(0.25, now + 0.26);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.26);
      osc2.stop(now + 0.4);
    } catch {
    }
  }, [audioMuted]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!canvasRef.current) return;

    let isMounted = true;

    try {
      const canvas = canvasRef.current;
      const initialW = canvas.offsetWidth || 400;
      const initialH = canvas.offsetHeight || 500;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(initialW, initialH);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#07111E');
      scene.fog = new THREE.FogExp2('#07111E', 0.65);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(40, initialW / initialH, 0.01, 50);
      camera.position.set(0, 0.12, 0.95);
      cameraRef.current = camera;

      // Studio Lighting
      const hemiLight = new THREE.HemisphereLight('#E2EEFF', '#1E293B', 0.65);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight('#FFF7ED', 2.8);
      keyLight.position.set(1.6, 2.8, 2.2);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0001;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight('#7DD3FC', 1.2);
      fillLight.position.set(-2.2, 0.8, -0.8);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight('#FCD34D', 1.1);
      rimLight.position.set(0.4, -1.8, -2.4);
      scene.add(rimLight);

      const heartGlow = new THREE.PointLight('#F43F5E', 0.8, 2.5);
      heartGlow.position.set(0, 0, 0.3);
      scene.add(heartGlow);

      // Floor Grid
      const grid = new THREE.GridHelper(3.5, 24, '#0D9488', '#112233');
      grid.position.y = -0.52;
      scene.add(grid);

      // OrbitControls with full Android / Mobile Touch Support
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.minDistance = 0.25;
      controls.maxDistance = 2.0;
      controls.maxPolarAngle = Math.PI * 0.88;
      controls.minPolarAngle = Math.PI * 0.12;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.9;
      // Configure multi-touch for mobile: 1 finger orbit, 2 finger zoom/pinch
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
      controlsRef.current = controls;

      // Procedural Organ Geometry Generation
      const generator = getProceduralOrganGenerator(organType);

      if (generator) {
        const group: any = generator(dims, { xray: false });
        group.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Scale to fit viewing volume
        const box = new THREE.Box3().setFromObject(group);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 0.44;
        const scale = targetSize / (maxDim || 1);
        group.scale.setScalar(scale);

        // Center geometry
        const center = new THREE.Vector3();
        box.getCenter(center);
        group.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        scene.add(group);
        organGroupRef.current = group;
      }

      setIsLoading(false);

      // Responsive Resize Observer
      const ro = new ResizeObserver(() => {
        if (!canvasRef.current || !isMounted) return;
        const cw = canvasRef.current.offsetWidth;
        const ch = canvasRef.current.offsetHeight;
        if (cw && ch) {
          renderer.setSize(cw, ch);
          camera.aspect = cw / ch;
          camera.updateProjectionMatrix();
        }
      });
      ro.observe(canvasRef.current);
      (renderer as any).__ro = ro;

      // Animation Loop
      const clock = new THREE.Clock();
      let lastBeatTime = 0;

      function animate() {
        if (!isMounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        controls.update();

        // Organic Physiological Simulations
        if (organGroupRef.current) {
          const organ = organGroupRef.current;
          if (!organ.userData.baseScale) {
            organ.userData.baseScale = organ.scale.x;
          }
          const baseScale = organ.userData.baseScale;

          const isActualHeart =
            organType === 'heart' &&
            (safeOrganName.toLowerCase().includes('heart') ||
              safeOrganName.toLowerCase().includes('cor') ||
              (systemName || '').toLowerCase().includes('cardio'));

          if (isActualHeart) {
            const cycleTime = elapsed * 1.2;
            const phase = cycleTime % 1;
            let beatScale = 1.0;

            if (phase < 0.15) {
              beatScale = 1.0 + Math.sin((phase / 0.15) * Math.PI) * 0.016;
            } else if (phase < 0.42) {
              const vPhase = (phase - 0.15) / 0.27;
              beatScale = 1.0 - Math.sin(vPhase * Math.PI) * 0.038;
            } else {
              const dPhase = (phase - 0.42) / 0.58;
              beatScale = 1.0 + Math.sin(dPhase * Math.PI) * 0.014;
            }

            organ.scale.setScalar(baseScale * beatScale);

            if (phase < 0.05 && elapsed - lastBeatTime > 0.6) {
              lastBeatTime = elapsed;
              playHeartbeatSound();
            }
          } else if (organType === 'brain') {
            const neuralPulse = 1.0 + Math.sin(elapsed * 2.2) * 0.008 + Math.sin(elapsed * 8.0) * 0.003;
            organ.scale.setScalar(baseScale * neuralPulse);
          } else if (organType === 'lungs') {
            const respPhase = Math.sin(elapsed * 1.45);
            organ.scale.set(
              baseScale * (1.0 + respPhase * 0.045),
              baseScale * (1.0 + respPhase * 0.035),
              baseScale * (1.0 + respPhase * 0.04),
            );
          }
        }

        // Update 2D Screen Coordinates for 3D Projected Pins
        if (canvasRef.current && cameraRef.current && organGroupRef.current) {
          const cw = canvasRef.current.offsetWidth;
          const ch = canvasRef.current.offsetHeight;
          const projCam = cameraRef.current;
          const organMesh = organGroupRef.current;

          const newPositions = resolvedHotspots.map(hs => {
            const [nx, ny, nz] = hs.normalizedPosition || [0, 0, 0];
            const hotspotLocal = new THREE.Vector3(nx * 0.26, ny * 0.26, nz * 0.26);
            hotspotLocal.applyMatrix4(organMesh.matrixWorld);

            const toCamera = projCam.position.clone().sub(hotspotLocal).normalize();
            const normal = hotspotLocal.clone().sub(organMesh.position).normalize();
            const isFrontFacing = toCamera.dot(normal) > -0.25;

            const screenCoord = hotspotLocal.clone().project(projCam);

            const px = (screenCoord.x * 0.5 + 0.5) * cw;
            const py = (-screenCoord.y * 0.5 + 0.5) * ch;
            const isWithinBounds = screenCoord.z < 1.0 && px >= 16 && px <= cw - 16 && py >= 45 && py <= ch - 45;

            return {
              id: hs.id,
              x: px,
              y: py,
              visible: isFrontFacing && isWithinBounds,
            };
          });

          setPin2DPositions(newPositions);
        }

        renderer.render(scene, camera);
      }
      animate();
    } catch (err: any) {
      console.error('[ModelViewer] Three.js init error:', err);
      if (isMounted) setError(err?.message || 'Failed to initialize 3D viewer.');
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) {
        (rendererRef.current as any).__ro?.disconnect();
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      organGroupRef.current = null;
    };
  }, [organType, resolvedHotspots, playHeartbeatSound]);

  // X-Ray Mode Toggle
  useEffect(() => {
    if (!organGroupRef.current) return;
    organGroupRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          mat.transparent = xrayMode;
          mat.opacity = xrayMode ? 0.22 : 1.0;
          mat.wireframe = false;
          if (xrayMode) {
            mat.depthWrite = false;
            mat.side = THREE.DoubleSide;
          } else {
            mat.depthWrite = true;
            mat.side = THREE.FrontSide;
          }
          mat.needsUpdate = true;
        });
      }
    });
  }, [xrayMode]);

  // Auto-rotate sync
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Reset Camera
  const handleResetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0.12, 0.95);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  // Focus on selected hotspot
  const focusHotspot = useCallback((hs: Hotspot) => {
    setActiveHotspot(hs);
    if (!cameraRef.current || !controlsRef.current || !organGroupRef.current) return;

    const [nx, ny, nz] = hs.normalizedPosition || [0, 0, 0];
    const organMesh = organGroupRef.current;
    const target = new THREE.Vector3(nx * 0.22, ny * 0.22, nz * 0.22).applyMatrix4(organMesh.matrixWorld);
    controlsRef.current.target.copy(target);
    controlsRef.current.update();
  }, []);

  const isHeart =
    organType === 'heart' &&
    (safeOrganName.toLowerCase().includes('heart') ||
      safeOrganName.toLowerCase().includes('cor') ||
      (systemName || '').toLowerCase().includes('cardio'));

  return (
    <div
      ref={containerRef}
      className={`relative bg-gradient-to-b from-[#060D18] via-[#0A1626] to-[#071220] rounded-2xl md:rounded-3xl overflow-hidden border border-teal-500/20 shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen w-screen'
          : 'h-[68vh] min-h-[480px] md:min-h-[620px]'
      } ${className}`}
    >
      {/* ── Top Header & Actions Bar (Mobile-Optimized Single Row) ─────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-[#060D18]/85 backdrop-blur-xl border-b border-white/10 gap-2">
        {/* Left: Specimen Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
            {organType === 'heart' ? (
              <HeartIcon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : organType === 'brain' ? (
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
                {safeOrganName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 shrink-0">
                3D
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block truncate">
              Procedural PBR • 360° Real-time Inspection
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Audio toggle for heartbeat */}
          {isHeart && (
            <button
              onClick={() => {
                setAudioMuted(m => !m);
                if (audioMuted) playHeartbeatSound();
              }}
              title={audioMuted ? 'Unmute Heartbeat' : 'Mute Heartbeat'}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition ${
                !audioMuted
                  ? 'bg-rose-500/25 text-rose-300 border-rose-400/50 shadow-md shadow-rose-500/20'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
              }`}
            >
              {!audioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Toggle 3D Hotspot Pins */}
          <button
            onClick={() => setShow3DPins(p => !p)}
            title={show3DPins ? 'Hide 3D Pins' : 'Show 3D Pins'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition ${
              show3DPins
                ? 'bg-teal-500/25 text-teal-300 border-teal-400/50 shadow-md shadow-teal-500/20'
                : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
          </button>

          {/* X-Ray Mode */}
          <button
            onClick={() => setXrayMode(x => !x)}
            title="Toggle X-Ray View"
            className={`p-1.5 sm:p-2 rounded-xl text-xs backdrop-blur-md border transition ${
              xrayMode
                ? 'bg-amber-500/25 text-amber-300 border-amber-400/50'
                : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
          </button>

          {/* Auto-Rotate */}
          <button
            onClick={() => setAutoRotate(r => !r)}
            title={autoRotate ? 'Pause Rotation' : 'Resume Rotation'}
            className={`p-1.5 sm:p-2 rounded-xl text-xs backdrop-blur-md border transition ${
              autoRotate
                ? 'bg-teal-500/25 text-teal-300 border-teal-400/40'
                : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            title="Reset Perspective"
            className="p-1.5 sm:p-2 rounded-xl text-xs bg-white/5 text-gray-300 border border-white/10 hover:text-white backdrop-blur-md transition"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 sm:p-2 rounded-xl text-xs bg-teal-600 hover:bg-teal-500 text-white border border-teal-400/40 backdrop-blur-md transition shadow-md shadow-teal-600/30"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── 3D Canvas (Touch Action None for Smooth Mobile Manipulation) ───── */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ display: 'block', touchAction: 'none' }}
      />

      {/* ── Floating 3D Projected Landmark Pins ────────────────────────────── */}
      {show3DPins && !isLoading && !error && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {resolvedHotspots.map((hs, idx) => {
            const pos = pin2DPositions.find(p => p.id === hs.id);
            if (!pos || !pos.visible) return null;

            const isSelected = activeHotspot?.id === hs.id;
            const isHovered = hoveredHotspot?.id === hs.id;
            const colors = getLandmarkColor(hs.system, idx);

            return (
              <div
                key={hs.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'opacity 0.15s ease-out',
                }}
                className="pointer-events-auto flex items-center gap-1.5 group"
                onMouseEnter={() => setHoveredHotspot(hs)}
                onMouseLeave={() => setHoveredHotspot(null)}
                onClick={() => focusHotspot(hs)}
              >
                <div className="relative cursor-pointer">
                  <span
                    style={{ backgroundColor: colors.glow }}
                    className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${
                      isSelected ? 'opacity-100 scale-125' : ''
                    }`}
                  />
                  <div
                    style={{ boxShadow: `0 0 12px ${colors.glow}` }}
                    className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-[11px] text-white border transition-all duration-200 ${
                      colors.bg
                    } ${isSelected ? 'scale-125 ring-2 ring-white border-white' : colors.border} hover:scale-125`}
                  >
                    {idx + 1}
                  </div>
                </div>

                {(isSelected || isHovered) && (
                  <div className="bg-[#0A1626]/95 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-teal-400/40 text-white text-[10px] sm:text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-xl flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span>{hs.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Desktop: Floating Right-Side Anatomical Landmarks List ─────────── */}
      {showLabelsList && !isLoading && !error && (
        <div className="hidden lg:flex absolute top-[58px] right-4 w-72 max-h-[440px] flex-col bg-[#060D18]/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl text-white z-10 overflow-hidden pointer-events-auto animate-in fade-in duration-200">
          <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Landmarks
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                {resolvedHotspots.length}
              </span>
            </div>
            <button
              onClick={() => setShowLabelsList(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              aria-label="Close landmarks list"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-y-auto p-2 space-y-1 flex-1 custom-scrollbar">
            {resolvedHotspots.map((item, idx) => {
              const isSelected = activeHotspot?.id === item.id;
              const colors = getLandmarkColor(item.system, idx);

              return (
                <button
                  key={item.id}
                  onClick={() => focusHotspot(item)}
                  className={`w-full text-left p-2 rounded-xl text-xs transition flex items-start gap-2 ${
                    isSelected
                      ? 'bg-teal-500/25 text-white border border-teal-400/50 shadow-md shadow-teal-500/10'
                      : 'hover:bg-white/5 text-gray-300 border border-transparent'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 text-white ${colors.bg} shadow-md`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-xs leading-snug block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                      {item.system || 'Anatomical Structure'}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 mt-1 transition ${
                      isSelected ? 'text-teal-400 rotate-90' : 'text-gray-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mobile: Bottom Sheet Drawer for Landmarks List ────────────────── */}
      {showLabelsList && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowLabelsList(false)}
          />

          {/* Slide-Up Bottom Sheet */}
          <div className="relative z-50 bg-[#060D18]/95 backdrop-blur-2xl border-t border-teal-500/30 rounded-t-3xl max-h-[65vh] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Grab handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-bold text-white">Anatomical Landmarks</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                  {resolvedHotspots.length}
                </span>
              </div>
              <button
                onClick={() => setShowLabelsList(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto py-2 space-y-1.5 flex-1 divide-y divide-white/5">
              {resolvedHotspots.map((item, idx) => {
                const isSelected = activeHotspot?.id === item.id;
                const colors = getLandmarkColor(item.system, idx);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      focusHotspot(item);
                      setShowLabelsList(false);
                    }}
                    className={`w-full text-left py-2.5 px-2 rounded-xl text-xs transition flex items-center gap-3 ${
                      isSelected
                        ? 'bg-teal-500/20 text-white font-semibold'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 text-white ${colors.bg} shadow-md`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate text-white">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400 block truncate">
                        {item.system || 'Anatomical Structure'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Active Landmark Detail Card (Responsive Floating Pill) ────────── */}
      {activeHotspot && (
        <div className="absolute bottom-16 sm:bottom-20 inset-x-3 sm:inset-x-6 sm:w-96 max-w-lg bg-[#060D18]/95 backdrop-blur-2xl border border-teal-500/40 rounded-2xl p-4 shadow-2xl text-white z-20 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3 h-3" />
              {activeHotspot.system || 'Anatomical Structure'}
            </span>
            <button
              onClick={() => setActiveHotspot(null)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              aria-label="Dismiss detail"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
            {activeHotspot.name}
          </h4>

          {activeHotspot.description && (
            <p className="text-[11px] sm:text-xs text-gray-300 mt-1.5 leading-relaxed">
              {activeHotspot.description}
            </p>
          )}

          {activeHotspot.clinicalFunction && (
            <div className="mt-2 bg-teal-950/60 border border-teal-500/30 rounded-xl p-2.5 text-xs">
              <strong className="text-teal-300 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                Clinical Significance
              </strong>
              <p className="text-teal-100/90 leading-relaxed text-[11px]">
                {activeHotspot.clinicalFunction}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Loading Overlay ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07111E]/95 z-30">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-3">
            <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <div
              className="absolute inset-2 border-4 border-rose-400/40 border-b-transparent rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
            />
          </div>
          <p className="text-teal-300 text-xs sm:text-sm font-bold tracking-wide">
            Rendering {safeOrganName}…
          </p>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 font-mono">
            Sculpting PBR anatomy & vasculature
          </p>
        </div>
      )}

      {/* ── Error Overlay ──────────────────────────────────────────────────── */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07111E]/95 z-30 p-6 text-center">
          <p className="text-rose-300 text-sm font-bold">{error}</p>
          <p className="text-gray-400 text-xs mt-2">Please refresh to reload the 3D model.</p>
        </div>
      )}

      {/* ── Bottom Controls & AR Bar ───────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-5 py-2.5 sm:py-3 bg-[#060D18]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-2 z-10">
        {/* Mobile Landmarks Button Toggle */}
        <button
          onClick={() => setShowLabelsList(l => !l)}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30 active:scale-95 transition"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Landmarks ({resolvedHotspots.length})</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        {/* Desktop helper text */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-300">
          <RotateCcw className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Rotate 360° • Pinch / scroll to zoom • Tap glowing pins to inspect</span>
        </div>

        {/* AR Button */}
        <div className="ml-auto">
          <ARButton modelUrl={modelUrl || ''} organName={organName} />
        </div>
      </div>
    </div>
  );
}
