import * as THREE from 'three';
import { createTissueMaterial, createVesselMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const KIDNEY_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'renal_cortex',
    name: 'Renal Cortex',
    normalizedPosition: [0.65, 0.25, 0],
    description: 'Outer region of the kidney containing renal corpuscles and convoluted tubules.',
    clinicalFunction: 'Primary site of blood ultrafiltration.',
    system: 'Urinary',
  },
  {
    id: 'renal_hilum',
    name: 'Renal Hilum',
    normalizedPosition: [-0.15, 0, 0.2],
    description: 'Medial cleft where the renal vessels, nerves, and ureter enter/exit.',
    clinicalFunction: 'Vascular and excretory conduit gate.',
    system: 'Urinary',
  },
  {
    id: 'renal_artery',
    name: 'Renal Artery',
    normalizedPosition: [-0.45, 0.1, 0.1],
    description: 'High-flow branch of abdominal aorta delivering blood for renal filtration.',
    clinicalFunction: 'Receives ~20-25% of resting cardiac output.',
    system: 'Cardiovascular / Urinary',
  },
  {
    id: 'renal_vein',
    name: 'Renal Vein',
    normalizedPosition: [-0.45, -0.05, 0.15],
    description: 'Large vein returning filtered blood to the inferior vena cava.',
    clinicalFunction: 'Filtered venous return.',
    system: 'Cardiovascular / Urinary',
  },
  {
    id: 'ureter',
    name: 'Ureter',
    normalizedPosition: [-0.25, -0.75, 0.1],
    description: 'Muscular tube conveying urine from renal pelvis to urinary bladder.',
    clinicalFunction: 'Peristaltic urine propulsion.',
    system: 'Urinary',
  },
  {
    id: 'adrenal_gland',
    name: 'Suprarenal (Adrenal) Gland',
    normalizedPosition: [0.1, 0.85, 0],
    description: 'Endocrine gland capping superior pole of kidney.',
    clinicalFunction: 'Secretes epinephrine, norepinephrine, cortisol, and aldosterone.',
    system: 'Endocrine',
  },
];

export function createKidneyModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const kidney = new THREE.Group();
  kidney.name = 'Human_Kidney';

  const len = dimensions.lengthMm / 1000; // height/length
  const wid = dimensions.widthMm / 1000; // width
  const hei = dimensions.heightMm / 1000; // depth

  const cortexMat = createTissueMaterial('#8C4A4A', options);
  const adrenalMat = createTissueMaterial('#D4A759', options);
  const ureterMat = createVesselMaterial('#E8C275', options);
  const arteryMat = createVesselMaterial('#C0392B', options);
  const veinMat = createVesselMaterial('#3B6998', options);

  // 1. Renal Body via LatheGeometry (24-point smooth bean profile)
  const profilePoints: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const angle = t * Math.PI;
    const x = Math.sin(angle) * 0.5;
    const y = Math.cos(angle) * 0.5;
    // Add realistic medial indentation for renal hilum
    const hilumIndent = Math.sin(angle) * (y < 0.1 && y > -0.1 ? 0.35 : 0.0);
    profilePoints.push(new THREE.Vector2(Math.max(x - hilumIndent, 0.04), y));
  }

  const kidneyGeo = new THREE.LatheGeometry(profilePoints, 48);
  const kidneyMesh = new THREE.Mesh(kidneyGeo, cortexMat);
  kidneyMesh.scale.set(wid, len, hei);
  kidney.add(kidneyMesh);

  // 2. Suprarenal (Adrenal) Gland (pyramidal cap on superior pole)
  const adrenalGeo = new THREE.ConeGeometry(wid * 0.32, len * 0.22, 24);
  const adrenalMesh = new THREE.Mesh(adrenalGeo, adrenalMat);
  adrenalMesh.position.set(wid * 0.05, len * 0.46, 0);
  adrenalMesh.rotation.z = -0.25;
  kidney.add(adrenalMesh);

  // 3. Renal Pelvis & Ureter (exiting medial hilum)
  const ureterSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-wid * 0.08, -len * 0.05, 0),
    new THREE.Vector3(-wid * 0.22, -len * 0.25, hei * 0.08),
    new THREE.Vector3(-wid * 0.26, -len * 0.55, hei * 0.12),
    new THREE.Vector3(-wid * 0.28, -len * 0.85, hei * 0.14),
  ]);
  const ureterTube = new THREE.TubeGeometry(ureterSpline, 36, wid * 0.05, 16, false);
  const ureterMesh = new THREE.Mesh(ureterTube, ureterMat);
  kidney.add(ureterMesh);

  // 4. Renal Artery (crimson)
  const artSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-wid * 0.6, len * 0.08, hei * 0.08),
    new THREE.Vector3(-wid * 0.35, len * 0.06, hei * 0.05),
    new THREE.Vector3(-wid * 0.1, len * 0.04, 0),
  ]);
  const artMesh = new THREE.Mesh(
    new THREE.TubeGeometry(artSpline, 24, wid * 0.045, 14, false),
    arteryMat
  );
  kidney.add(artMesh);

  // 5. Renal Vein (cobalt blue)
  const veinSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-wid * 0.6, -len * 0.04, hei * 0.12),
    new THREE.Vector3(-wid * 0.32, -len * 0.02, hei * 0.08),
    new THREE.Vector3(-wid * 0.1, 0, hei * 0.02),
  ]);
  const veinMesh = new THREE.Mesh(
    new THREE.TubeGeometry(veinSpline, 24, wid * 0.055, 14, false),
    veinMat
  );
  kidney.add(veinMesh);

  return kidney;
}
