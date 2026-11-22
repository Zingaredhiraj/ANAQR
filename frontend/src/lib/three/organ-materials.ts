import * as THREE from 'three';

export interface TissueMaterialOptions {
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  transparent?: boolean;
  opacity?: number;
  xray?: boolean;
  wireframe?: boolean;
}

/**
 * Creates premium medical-grade PBR tissue material with physical micro-roughness
 * and clearcoat for organic appearance without flat plastic look.
 */
export function createTissueMaterial(
  colorHex: string,
  options: TissueMaterialOptions = {}
): THREE.MeshPhysicalMaterial {
  const isXray = options.xray ?? false;

  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: options.roughness ?? 0.58,
    metalness: options.metalness ?? 0.04,
    clearcoat: isXray ? 0.0 : (options.clearcoat ?? 0.35),
    clearcoatRoughness: options.clearcoatRoughness ?? 0.22,
    reflectivity: 0.45,
    transparent: isXray || options.transparent || false,
    opacity: isXray ? 0.28 : (options.opacity ?? 1.0),
    depthWrite: !isXray,
    wireframe: options.wireframe ?? false,
    side: THREE.DoubleSide,
  });
}

/**
 * Creates distinct vascular material (arteries in vivid crimson, veins in rich cobalt, coronaries).
 */
export function createVesselMaterial(
  colorHex: string,
  options: TissueMaterialOptions = {}
): THREE.MeshPhysicalMaterial {
  const isXray = options.xray ?? false;

  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: options.roughness ?? 0.38,
    metalness: options.metalness ?? 0.08,
    clearcoat: isXray ? 0.0 : 0.45,
    clearcoatRoughness: 0.15,
    transparent: isXray || options.transparent || false,
    opacity: isXray ? 0.85 : (options.opacity ?? 1.0),
    side: THREE.DoubleSide,
  });
}

/**
 * Creates cartilaginous or semi-translucent structure material (trachea rings, joint cartilage).
 */
export function createCartilageMaterial(
  colorHex = '#D6E5EA',
  options: TissueMaterialOptions = {}
): THREE.MeshPhysicalMaterial {
  const isXray = options.xray ?? false;

  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.28,
    metalness: 0.02,
    clearcoat: 0.55,
    transmission: 0.12,
    transparent: true,
    opacity: isXray ? 0.35 : 0.92,
  });
}

/**
 * Creates bone cortex material (matte mineral bone texture with subtle sheen).
 */
export function createBoneMaterial(
  colorHex = '#EAE3D2',
  options: TissueMaterialOptions = {}
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.72,
    metalness: 0.01,
    clearcoat: 0.12,
    clearcoatRoughness: 0.4,
    wireframe: options.wireframe ?? false,
  });
}
