import * as THREE from 'three';
import { createBoneMaterial, createCartilageMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const FEMUR_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'femoral_head',
    name: 'Femoral Head',
    normalizedPosition: [-0.65, 0.85, 0.1],
    description: 'Smooth, globular articular ball articulating with acetabulum in hip joint.',
    clinicalFunction: 'Weight-bearing ball-and-socket hip articulation.',
    system: 'Skeletal',
  },
  {
    id: 'femoral_neck',
    name: 'Femoral Neck',
    normalizedPosition: [-0.35, 0.75, 0.05],
    description: 'Constricted pyramidal strut connecting head to shaft at ~125-130° angle of inclination.',
    clinicalFunction: 'High biomechanical stress zone (frequent subcapital fracture site).',
    system: 'Skeletal',
  },
  {
    id: 'greater_trochanter',
    name: 'Greater Trochanter',
    normalizedPosition: [0.35, 0.78, 0],
    description: 'Large, quadrangular lateral prominence serving as insertion for hip abductors.',
    clinicalFunction: 'Gluteus medius and minimus insertion for pelvic leveling during gait.',
    system: 'Skeletal',
  },
  {
    id: 'femoral_shaft',
    name: 'Diaphysis (Femoral Shaft)',
    normalizedPosition: [0, 0, 0.05],
    description: 'Strong cylindrical compact bone shaft exhibiting physiological slight anterior convex bow.',
    clinicalFunction: 'Massive axial weight-bearing transmission.',
    system: 'Skeletal',
  },
  {
    id: 'distal_condyles',
    name: 'Medial & Lateral Condyles',
    normalizedPosition: [0, -0.85, 0.05],
    description: 'Expanded distal articular knuckles forming the femoral component of the knee joint.',
    clinicalFunction: 'Knee flexion, extension, and terminal screw-home rotation.',
    system: 'Skeletal',
  },
];

export function createFemurModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const femur = new THREE.Group();
  femur.name = 'Human_Femur';

  const len = dimensions.lengthMm / 1000; // ~0.45m
  const wid = dimensions.widthMm / 1000; // ~0.08m
  const hei = dimensions.heightMm / 1000;

  const boneMat = createBoneMaterial('#EAE3D2', options);
  const cartilageMat = createCartilageMaterial('#D6E5EA', options);

  // 1. Curved Diaphysis (shaft with gentle anterior bow)
  const shaftSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, len * 0.32, 0),
    new THREE.Vector3(0, len * 0.12, hei * 0.12), // Anterior bow
    new THREE.Vector3(0, -len * 0.12, hei * 0.12),
    new THREE.Vector3(0, -len * 0.32, 0),
  ]);
  const shaftTube = new THREE.TubeGeometry(shaftSpline, 32, wid * 0.22, 18, false);
  const shaftMesh = new THREE.Mesh(shaftTube, boneMat);
  femur.add(shaftMesh);

  // 2. Proximal Femoral Head (spherical articular ball with smooth cartilage)
  const headGeo = new THREE.SphereGeometry(wid * 0.35, 32, 32);
  const headMesh = new THREE.Mesh(headGeo, cartilageMat);
  headMesh.position.set(-wid * 0.55, len * 0.42, 0);
  femur.add(headMesh);

  // 3. Femoral Neck (angled bridge connecting head to shaft)
  const neckSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, len * 0.32, 0),
    new THREE.Vector3(-wid * 0.28, len * 0.38, 0),
    new THREE.Vector3(-wid * 0.52, len * 0.42, 0),
  ]);
  const neckTube = new THREE.TubeGeometry(neckSpline, 16, wid * 0.24, 16, false);
  const neckMesh = new THREE.Mesh(neckTube, boneMat);
  femur.add(neckMesh);

  // 4. Greater Trochanter (prominent lateral tuberosity)
  const trochanterGeo = new THREE.SphereGeometry(wid * 0.32, 20, 20);
  const trochanterMesh = new THREE.Mesh(trochanterGeo, boneMat);
  trochanterMesh.scale.set(1.0, 1.4, 0.9);
  trochanterMesh.position.set(wid * 0.35, len * 0.35, 0);
  femur.add(trochanterMesh);

  // 5. Distal Medial Condyle
  const mCondyleGeo = new THREE.SphereGeometry(wid * 0.32, 24, 24);
  const mCondyleMesh = new THREE.Mesh(mCondyleGeo, cartilageMat);
  mCondyleMesh.scale.set(0.9, 0.9, 1.4);
  mCondyleMesh.position.set(-wid * 0.25, -len * 0.38, 0);
  femur.add(mCondyleMesh);

  // 6. Distal Lateral Condyle
  const lCondyleGeo = new THREE.SphereGeometry(wid * 0.32, 24, 24);
  const lCondyleMesh = new THREE.Mesh(lCondyleGeo, cartilageMat);
  lCondyleMesh.scale.set(0.9, 0.9, 1.4);
  lCondyleMesh.position.set(wid * 0.25, -len * 0.38, 0);
  femur.add(lCondyleMesh);

  return femur;
}
