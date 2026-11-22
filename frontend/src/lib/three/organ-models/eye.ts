import * as THREE from 'three';
import { createTissueMaterial, createCartilageMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const EYE_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'cornea',
    name: 'Cornea',
    normalizedPosition: [0, 0, 0.85],
    description: 'Transparent anterior dome providing two-thirds of the eye refractive power.',
    clinicalFunction: 'Light refraction and visual clarity.',
    system: 'Special Sensory',
  },
  {
    id: 'iris_pupil',
    name: 'Iris & Pupil',
    normalizedPosition: [0, 0, 0.65],
    description: 'Pigmented muscular diaphragm with central aperture controlling retinal illumination.',
    clinicalFunction: 'Pupillary light reflex regulation.',
    system: 'Special Sensory',
  },
  {
    id: 'sclera',
    name: 'Sclera',
    normalizedPosition: [0.65, 0.25, 0],
    description: 'Opaque fibrous protective outer coat maintaining eyeball intraocular shape.',
    clinicalFunction: 'Structural integrity and extraocular muscle insertions.',
    system: 'Special Sensory',
  },
  {
    id: 'optic_nerve',
    name: 'Optic Nerve (CN II)',
    normalizedPosition: [0, 0, -0.95],
    description: 'Paired sensory cranial nerve transmitting retinal visual signals to visual cortex.',
    clinicalFunction: 'Visual afferent pathway.',
    system: 'Special Sensory / Nervous',
  },
];

export function createEyeModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const eye = new THREE.Group();
  eye.name = 'Human_Eye';

  const radius = (dimensions.widthMm / 1000) * 0.5; // ~12mm radius
  const nerveLen = (dimensions.lengthMm / 1000) * 0.8; // ~32-40mm

  const scleraMat = createTissueMaterial('#F4F1EA', {
    ...options,
    roughness: 0.25,
    clearcoat: 0.85,
  });

  const irisMat = createTissueMaterial('#2E5B88', {
    ...options,
    roughness: 0.45,
  });

  const pupilMat = new THREE.MeshBasicMaterial({ color: '#0A0A0A' });

  const corneaMat = createCartilageMaterial('#E8F4F8', {
    ...options,
    transparent: true,
    opacity: 0.35,
    clearcoat: 1.0,
  });

  const nerveMat = createTissueMaterial('#D7C4A8', options);

  // 1. Sclera (eyeball globe)
  const scleraGeo = new THREE.SphereGeometry(radius, 40, 40);
  const scleraMesh = new THREE.Mesh(scleraGeo, scleraMat);
  eye.add(scleraMesh);

  // 2. Cornea (anterior protruding transparent dome)
  const corneaGeo = new THREE.SphereGeometry(radius * 0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const corneaMesh = new THREE.Mesh(corneaGeo, corneaMat);
  corneaMesh.position.set(0, 0, radius * 0.65);
  eye.add(corneaMesh);

  // 3. Iris (pigmented disc)
  const irisGeo = new THREE.RingGeometry(radius * 0.18, radius * 0.55, 36);
  const irisMesh = new THREE.Mesh(irisGeo, irisMat);
  irisMesh.position.set(0, 0, radius * 0.88);
  eye.add(irisMesh);

  // 4. Pupil (central dark aperture)
  const pupilGeo = new THREE.CircleGeometry(radius * 0.18, 32);
  const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
  pupilMesh.position.set(0, 0, radius * 0.89);
  eye.add(pupilMesh);

  // 5. Optic Nerve (posterior exiting sheath tube)
  const nerveSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -radius * 0.95),
    new THREE.Vector3(radius * 0.1, -radius * 0.05, -radius - nerveLen * 0.4),
    new THREE.Vector3(radius * 0.15, -radius * 0.1, -radius - nerveLen),
  ]);
  const nerveTube = new THREE.TubeGeometry(nerveSpline, 24, radius * 0.22, 16, false);
  const nerveMesh = new THREE.Mesh(nerveTube, nerveMat);
  eye.add(nerveMesh);

  return eye;
}
