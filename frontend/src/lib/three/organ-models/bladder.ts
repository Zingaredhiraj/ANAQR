import * as THREE from 'three';
import { createTissueMaterial, createVesselMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const BLADDER_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'bladder_apex',
    name: 'Bladder Apex',
    normalizedPosition: [0, 0.75, 0.2],
    description: 'Anterior-superior pointed pole connected to umbilicus via median umbilical ligament.',
    clinicalFunction: 'Urachus anatomical remnant landmark.',
    system: 'Urinary',
  },
  {
    id: 'bladder_body',
    name: 'Detrusor Muscle Body',
    normalizedPosition: [0, 0.15, 0.35],
    description: 'Thick muscular wall composed of 3 intersecting layers of smooth muscle fibers.',
    clinicalFunction: 'High-compliance reservoir and coordinated micturition contraction.',
    system: 'Urinary',
  },
  {
    id: 'trigone',
    name: 'Bladder Trigone & Neck',
    normalizedPosition: [0, -0.65, -0.1],
    description: 'Smooth triangular mucous membrane floor bounded by ureteric orifices and internal urethral orifice.',
    clinicalFunction: 'Stretch sensitive zone signaling urinary fullness.',
    system: 'Urinary',
  },
  {
    id: 'ureters_inlet',
    name: 'Ureteric Orifices',
    normalizedPosition: [0.35, -0.45, -0.2],
    description: 'Oblique muscular entry tunnel preventing retrograde vesicoureteral urine reflux.',
    clinicalFunction: 'Anti-reflux valve mechanism.',
    system: 'Urinary',
  },
];

export function createBladderModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const bladder = new THREE.Group();
  bladder.name = 'Human_Urinary_Bladder';

  const len = dimensions.lengthMm / 1000;
  const wid = dimensions.widthMm / 1000;
  const hei = dimensions.heightMm / 1000;

  const detrusorMat = createTissueMaterial('#BD6B6B', options);
  const ureterMat = createVesselMaterial('#E8C275', options);
  const neckMat = createTissueMaterial('#A65353', options);

  // 1. Detrusor Body (rounded tetrahedral / pear-like ellipsoid)
  const bladderGeo = new THREE.SphereGeometry(0.5, 40, 40);
  const bladderMesh = new THREE.Mesh(bladderGeo, detrusorMat);
  bladderMesh.scale.set(wid * 0.75, hei * 0.75, len * 0.65);
  bladder.add(bladderMesh);

  // 2. Dual Ureters entering posterior base
  [-1, 1].forEach((side) => {
    const ureterSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * wid * 0.45, hei * 0.35, -len * 0.35),
      new THREE.Vector3(side * wid * 0.35, 0, -len * 0.28),
      new THREE.Vector3(side * wid * 0.2, -hei * 0.25, -len * 0.2),
    ]);
    const ureterTube = new THREE.TubeGeometry(ureterSpline, 20, wid * 0.035, 12, false);
    const ureterMesh = new THREE.Mesh(ureterTube, ureterMat);
    bladder.add(ureterMesh);
  });

  // 3. Bladder Neck & Urethral Exit (inferior cylinder)
  const urethraGeo = new THREE.CylinderGeometry(wid * 0.08, wid * 0.07, hei * 0.25, 20);
  const urethraMesh = new THREE.Mesh(urethraGeo, neckMat);
  urethraMesh.position.set(0, -hei * 0.45, -len * 0.05);
  bladder.add(urethraMesh);

  return bladder;
}
