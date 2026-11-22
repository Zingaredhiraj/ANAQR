import * as THREE from 'three';
import { createTissueMaterial, createCartilageMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const PANCREAS_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'pancreatic_head',
    name: 'Pancreatic Head & Uncinate Process',
    normalizedPosition: [0.65, -0.15, 0.1],
    description: 'Expanded right end embraced by C-loop of duodenum.',
    clinicalFunction: 'Exocrine enzyme synthesis (lipase, amylase, proteases).',
    system: 'Digestive / Endocrine',
  },
  {
    id: 'pancreatic_body',
    name: 'Pancreatic Body',
    normalizedPosition: [0.05, 0.1, 0.05],
    description: 'Prismatic elongated central segment crossing abdominal aorta and L1/L2.',
    clinicalFunction: 'Islets of Langerhans endocrine insulin and glucagon secretion.',
    system: 'Digestive / Endocrine',
  },
  {
    id: 'pancreatic_tail',
    name: 'Pancreatic Tail',
    normalizedPosition: [-0.75, 0.35, -0.1],
    description: 'Narrow tapered left tip contacting visceral surface of the spleen.',
    clinicalFunction: 'Highest density of endocrine islet tissue.',
    system: 'Digestive / Endocrine',
  },
  {
    id: 'pancreatic_duct',
    name: 'Main Pancreatic Duct (Wirsung)',
    normalizedPosition: [0, 0, 0.18],
    description: 'Central duct traversing length of gland to join common bile duct at ampulla of Vater.',
    clinicalFunction: 'Digestive juice bicarbonate secretion.',
    system: 'Digestive',
  },
];

export function createPancreasModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const pancreas = new THREE.Group();
  pancreas.name = 'Human_Pancreas';

  const len = dimensions.lengthMm / 1000; // length (horizontal)
  const wid = dimensions.widthMm / 1000; // width (height/thickness)
  const hei = dimensions.heightMm / 1000; // depth

  const tissueMat = createTissueMaterial('#E0B06B', options);
  const ductMat = createCartilageMaterial('#F0E6D2', options);

  // 1. Pancreatic Body & Tail (curved tapering tube from right to left)
  const pancreasSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(len * 0.38, -wid * 0.1, 0), // Head
    new THREE.Vector3(len * 0.22, 0, hei * 0.08), // Neck
    new THREE.Vector3(-len * 0.05, wid * 0.12, hei * 0.05), // Body
    new THREE.Vector3(-len * 0.28, wid * 0.25, -hei * 0.02), // Tail
    new THREE.Vector3(-len * 0.45, wid * 0.32, -hei * 0.08), // Tip
  ]);

  const tubeGeo = new THREE.TubeGeometry(pancreasSpline, 36, wid * 0.32, 18, false);
  const tubeMesh = new THREE.Mesh(tubeGeo, tissueMat);
  pancreas.add(tubeMesh);

  // 2. Pancreatic Head Bulge (right bulbous mass)
  const headGeo = new THREE.SphereGeometry(0.35, 24, 24);
  const headMesh = new THREE.Mesh(headGeo, tissueMat);
  headMesh.scale.set(len * 0.22, wid * 0.55, hei * 0.45);
  headMesh.position.set(len * 0.38, -wid * 0.15, 0);
  pancreas.add(headMesh);

  // 3. Main Pancreatic Duct (visible longitudinal white duct on surface)
  const ductSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(len * 0.36, -wid * 0.1, hei * 0.12),
    new THREE.Vector3(len * 0.18, 0, hei * 0.15),
    new THREE.Vector3(-len * 0.08, wid * 0.12, hei * 0.12),
    new THREE.Vector3(-len * 0.35, wid * 0.26, hei * 0.02),
  ]);
  const ductTube = new THREE.TubeGeometry(ductSpline, 24, wid * 0.035, 12, false);
  const ductMesh = new THREE.Mesh(ductTube, ductMat);
  pancreas.add(ductMesh);

  return pancreas;
}
