import * as THREE from 'three';
import { createTissueMaterial, createCartilageMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const MUSCLE_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'muscle_belly',
    name: 'Biceps Muscle Belly',
    normalizedPosition: [0, 0, 0.25],
    description: 'Thick, contractile fusiform center composed of bundled, parallel muscle fascicles.',
    clinicalFunction: 'Powerful forearm supination and elbow flexion.',
    system: 'Muscular',
  },
  {
    id: 'proximal_tendons',
    name: 'Long & Short Head Tendons',
    normalizedPosition: [0, 0.85, 0],
    description: 'Dual proximal tendinous origins attaching to supraglenoid tubercle and coracoid process.',
    clinicalFunction: 'Shoulder joint stabilization and glenohumeral flexion.',
    system: 'Muscular / Skeletal',
  },
  {
    id: 'distal_tendon',
    name: 'Distal Bicipital Tendon',
    normalizedPosition: [0, -0.85, 0.05],
    description: 'Strong rounded tendon inserting into the radial tuberosity of the radius.',
    clinicalFunction: 'Transmits flexion torque and biceps reflex elicitation.',
    system: 'Muscular',
  },
];

export function createMuscleModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const muscle = new THREE.Group();
  muscle.name = 'Human_Skeletal_Muscle';

  const len = dimensions.lengthMm / 1000;
  const wid = dimensions.widthMm / 1000;
  const hei = dimensions.heightMm / 1000;

  const bellyMat = createTissueMaterial('#A63A42', options);
  const tendonMat = createCartilageMaterial('#E8ECEF', options);

  // 1. Fusiform Muscle Belly (spindle capsule mesh)
  const bellyGeo = new THREE.CapsuleGeometry(wid * 0.45, len * 0.45, 24, 32);
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.scale.set(1.0, 1.0, hei / wid);
  muscle.add(bellyMesh);

  // Parallel muscle fascicle fiber tubes on surface
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const fiberSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * wid * 0.25, len * 0.25, Math.sin(angle) * hei * 0.25),
      new THREE.Vector3(Math.cos(angle) * wid * 0.46, 0, Math.sin(angle) * hei * 0.46),
      new THREE.Vector3(Math.cos(angle) * wid * 0.25, -len * 0.25, Math.sin(angle) * hei * 0.25),
    ]);
    const fiberMesh = new THREE.Mesh(
      new THREE.TubeGeometry(fiberSpline, 20, wid * 0.035, 8, false),
      bellyMat
    );
    muscle.add(fiberMesh);
  }

  // 2. Proximal Tendons (Long & Short Heads)
  [-1, 1].forEach((side) => {
    const pTendonSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * wid * 0.15, len * 0.22, 0),
      new THREE.Vector3(side * wid * 0.22, len * 0.35, 0),
      new THREE.Vector3(side * wid * 0.25, len * 0.48, 0),
    ]);
    const pTendonMesh = new THREE.Mesh(
      new THREE.TubeGeometry(pTendonSpline, 16, wid * 0.08, 12, false),
      tendonMat
    );
    muscle.add(pTendonMesh);
  });

  // 3. Distal Insertion Tendon
  const dTendonSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -len * 0.22, 0),
    new THREE.Vector3(0, -len * 0.35, 0),
    new THREE.Vector3(wid * 0.05, -len * 0.48, 0),
  ]);
  const dTendonMesh = new THREE.Mesh(
    new THREE.TubeGeometry(dTendonSpline, 16, wid * 0.09, 12, false),
    tendonMat
  );
  muscle.add(dTendonMesh);

  return muscle;
}
