'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Layers,
  Sparkles,
  Info,
  Compass,
} from 'lucide-react';
import { getProceduralOrganGenerator, getOrganHotspots } from '@/lib/three/organ-models';
import { OrganDimensions, AnatomicalHotspot, OrganType } from '@/lib/three/types';
import { normalizeDimensions } from '@/lib/three/dimension-normalizer';

interface Organ3DPreviewProps {
  organType: string;
  dimensions?: Partial<OrganDimensions>;
  xray?: boolean;
  showHotspots?: boolean;
  autoRotate?: boolean;
  onSelectHotspot?: (hotspot: AnatomicalHotspot | null) => void;
  className?: string;
}

interface ProjectedHotspot {
  hotspot: AnatomicalHotspot;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export default function Organ3DPreview({
  organType,
  dimensions: customDims,
  xray: defaultXray = false,
  showHotspots: defaultHotspots = true,
  autoRotate: defaultAutoRotate = true,
  onSelectHotspot,
  className = 'h-[520px] w-full',
}: Organ3DPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [xray, setXray] = useState(defaultXray);
  const [showHotspots, setShowHotspots] = useState(defaultHotspots);
  const [autoRotate, setAutoRotate] = useState(defaultAutoRotate);
  const [selectedHotspot, setSelectedHotspot] = useState<AnatomicalHotspot | null>(null);
  const [projectedHotspots, setProjectedHotspots] = useState<ProjectedHotspot[]>([]);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const organGroupRef = useRef<THREE.Group | null>(null);
  const hotspotMeshesRef = useRef<THREE.Mesh[]>([]);

  const normalizedDims = useMemo(
    () => normalizeDimensions(organType as OrganType, customDims),
    [organType, customDims]
  );

  const hotspots = useMemo(() => getOrganHotspots(organType), [organType]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050B1D');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.22, 1.1);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#E2E8F0', '#0A1128', 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.25);
    keyLight.position.set(2.5, 3.5, 3.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#ffffff', 0.45);
    fillLight.position.set(-3.0, 1.5, -2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#ffffff', 0.3);
    rimLight.position.set(0, -2.0, -2.5);
    scene.add(rimLight);

    // 5. Floor Grid
    const grid = new THREE.GridHelper(1.6, 28, '#334155', '#1E293B');
    grid.position.y = -0.38;
    scene.add(grid);

    // 6. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 0.35;
    controls.maxDistance = 2.5;
    controlsRef.current = controls;

    // 7. Raycasting for hotspot picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hotspotMeshesRef.current);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hotspotData = hitMesh.userData as AnatomicalHotspot;
        if (hotspotData) {
          setSelectedHotspot(hotspotData);
          if (onSelectHotspot) onSelectHotspot(hotspotData);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 8. Animation & Hotspot Projection Loop
    let animationFrameId: number;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);

      // Project 3D hotspots to 2D screen coordinates
      if (hotspots.length > 0 && container) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;

        const projected: ProjectedHotspot[] = hotspots.map((h) => {
          const [nx, ny, nz] = h.normalizedPosition;
          const posX = nx * (normalizedDims.widthMm * 0.0005);
          const posY = ny * (normalizedDims.heightMm * 0.0005);
          const posZ = nz * (normalizedDims.lengthMm * 0.0005);

          tempVec.set(posX, posY, posZ);
          tempVec.project(camera);

          // Visible only if in front of camera
          const isVisible = tempVec.z < 1.0;
          const sX = (tempVec.x * 0.5 + 0.5) * cWidth;
          const sY = (-tempVec.y * 0.5 + 0.5) * cHeight;

          return {
            hotspot: h,
            screenX: sX,
            screenY: sY,
            visible: isVisible,
          };
        });

        setProjectedHotspots(projected);
      }
    };

    animate();

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update autoRotate setting
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update Organ Geometry & Saffron Hotspots
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // 1. Remove previous organ group and dispose
    if (organGroupRef.current) {
      scene.remove(organGroupRef.current);
      organGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      organGroupRef.current = null;
    }

    // 2. Generate new organ group
    const generator = getProceduralOrganGenerator(organType);
    if (!generator) return;

    const organGroup = generator(normalizedDims, { xray });
    organGroupRef.current = organGroup;
    scene.add(organGroup);

    // 3. Re-create Saffron Hotspot 3D marker spheres
    hotspotMeshesRef.current.forEach((m) => {
      scene.remove(m);
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    hotspotMeshesRef.current = [];

    if (showHotspots) {
      hotspots.forEach((h) => {
        const [nx, ny, nz] = h.normalizedPosition;
        const posX = nx * (normalizedDims.widthMm * 0.0005);
        const posY = ny * (normalizedDims.heightMm * 0.0005);
        const posZ = nz * (normalizedDims.lengthMm * 0.0005);

        const markerGeo = new THREE.SphereGeometry(0.012, 16, 16);
        const markerMat = new THREE.MeshStandardMaterial({
          color: '#FF9933',
          emissive: '#FF9933',
          emissiveIntensity: 0.8,
          roughness: 0.3,
        });

        const markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.set(posX, posY, posZ);
        markerMesh.userData = h;

        scene.add(markerMesh);
        hotspotMeshesRef.current.push(markerMesh);
      });
    }
  }, [organType, normalizedDims, xray, showHotspots, hotspots]);

  const handleResetCamera = (view: 'anterior' | 'posterior' | 'superior' | 'lateral' = 'anterior') => {
    if (!controlsRef.current || !cameraRef.current) return;
    controlsRef.current.reset();
    switch (view) {
      case 'anterior':
        cameraRef.current.position.set(0, 0.22, 1.1);
        break;
      case 'posterior':
        cameraRef.current.position.set(0, 0.22, -1.1);
        break;
      case 'superior':
        cameraRef.current.position.set(0, 1.25, 0.1);
        break;
      case 'lateral':
        cameraRef.current.position.set(1.15, 0.22, 0);
        break;
    }
    controlsRef.current.update();
  };

  const handleSelectHotspot = (h: AnatomicalHotspot) => {
    setSelectedHotspot(h);
    if (onSelectHotspot) onSelectHotspot(h);
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#050B1D] border border-slate-800 shadow-2xl flex flex-col ${className}`}
    >
      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur text-xs font-semibold text-slate-300 border border-slate-700/60 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {organType.replace(/_/g, ' ')}
          </span>

          <span className="px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur text-xs font-mono text-slate-400 border border-slate-800">
            {normalizedDims.widthMm} × {normalizedDims.heightMm} × {normalizedDims.lengthMm} mm
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur p-1 rounded-xl border border-slate-700/60 shadow-lg">
          {/* X-Ray Toggle */}
          <button
            onClick={() => setXray(!xray)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              xray
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle X-Ray / Transparency Mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">X-Ray</span>
          </button>

          {/* Hotspots Toggle */}
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              showHotspots
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Anatomical Hotspots"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hotspots</span>
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              autoRotate
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Auto-Rotation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">360°</span>
          </button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 2D Hotspot Labels Tagging 3D Model */}
      {showHotspots && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {projectedHotspots.map(({ hotspot, screenX, screenY, visible }) => {
            if (!visible || screenX < 0 || screenY < 0) return null;
            const isSelected = selectedHotspot?.id === hotspot.id;

            return (
              <div
                key={hotspot.id}
                style={{
                  transform: `translate(${screenX}px, ${screenY}px) translate(-50%, -120%)`,
                }}
                className="absolute top-0 left-0 transition-transform duration-75"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHotspot(hotspot);
                  }}
                  className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur shadow-lg transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 scale-105'
                      : 'bg-slate-900/90 text-amber-200 border border-amber-500/35 hover:border-amber-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-slate-950' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span>{hotspot.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Camera View Presets Bar (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-slate-900/85 backdrop-blur p-1 rounded-xl border border-slate-800 text-xs text-slate-400">
        <Compass className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
        <button
          onClick={() => handleResetCamera('anterior')}
          className="px-2 py-1 rounded-md hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Anterior
        </button>
        <button
          onClick={() => handleResetCamera('posterior')}
          className="px-2 py-1 rounded-md hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Posterior
        </button>
        <button
          onClick={() => handleResetCamera('superior')}
          className="px-2 py-1 rounded-md hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Superior
        </button>
        <button
          onClick={() => handleResetCamera('lateral')}
          className="px-2 py-1 rounded-md hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Lateral
        </button>
      </div>

      {/* Selected Hotspot Educational Card (Bottom Right) */}
      {selectedHotspot && (
        <div className="absolute bottom-3 right-3 z-20 max-w-xs p-3.5 rounded-xl bg-slate-900/95 backdrop-blur border border-amber-500/40 text-slate-200 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {selectedHotspot.system} Landmark
              </span>
              <h4 className="text-sm font-semibold text-white">
                {selectedHotspot.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            {selectedHotspot.description}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-200/90 flex items-start gap-1">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
            <span>{selectedHotspot.clinicalFunction}</span>
          </div>
        </div>
      )}
    </div>
  );
}
