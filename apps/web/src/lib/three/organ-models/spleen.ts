import * as THREE from 'three';
import { createTissueMaterial, createVesselMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const SPLEEN_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'diaphragmatic_surface',
    name: 'Diaphragmatic Surface',
    normalizedPosition: [0, 0.45, -0.2],
    description: 'Smooth, convex outer contour fitting snugly under left hemidiaphragm ribs 9-11.',
    clinicalFunction: 'Protected lymphoid organ site.',
    system: 'Lymphatic / Immune',
  },
  {
    id: 'splenic_hilum',
    name: 'Splenic Hilum & Vessels',
    normalizedPosition: [0, -0.15, 0.25],
    description: 'Fissure on visceral surface transmitting splenic artery, vein, and autonomic nerves.',
    clinicalFunction: 'Entry and exit point for lymphoid circulation.',
    system: 'Lymphatic / Cardiovascular',
  },
  {
    id: 'anterior_notch',
    name: 'Anterior Superior Notch',
    normalizedPosition: [0.45, 0.25, 0.1],
    description: 'Distinctive anatomical indentation on superior-anterior margin of spleen.',
    clinicalFunction: 'Crucial clinical palpation landmark during splenomegaly.',
    system: 'Lymphatic',
  },
];

export function createSpleenModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const spleen = new THREE.Group();
  spleen.name = 'Human_Spleen';

  const len = dimensions.lengthMm / 1000;
  const wid = dimensions.widthMm / 1000;
  const hei = dimensions.heightMm / 1000;

  const spleenMat = createTissueMaterial('#6B2D38', options);
  const arteryMat = createVesselMaterial('#C0392B', options);
  const veinMat = createVesselMaterial('#3B6998', options);

  // 1. Spleen Body (convex-concave ellipsoid)
  const spleenGeo = new THREE.SphereGeometry(0.5, 40, 40);
  const spleenMesh = new THREE.Mesh(spleenGeo, spleenMat);
  spleenMesh.scale.set(wid * 0.75, len * 0.75, hei * 0.65);
  spleenMesh.rotation.z = 0.35;
  spleen.add(spleenMesh);

  // 2. Splenic Artery (tortuous branch from celiac trunk entering hilum)
  const artSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-wid * 0.45, -len * 0.15, hei * 0.35),
    new THREE.Vector3(-wid * 0.25, -len * 0.08, hei * 0.22),
    new THREE.Vector3(-wid * 0.05, -len * 0.05, hei * 0.12),
  ]);
  const artMesh = new THREE.Mesh(
    new THREE.TubeGeometry(artSpline, 20, wid * 0.035, 12, false),
    arteryMat
  );
  spleen.add(artMesh);

  // 3. Splenic Vein (leaving hilum to form portal vein)
  const veinSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-wid * 0.45, -len * 0.25, hei * 0.32),
    new THREE.Vector3(-wid * 0.22, -len * 0.18, hei * 0.2),
    new THREE.Vector3(0, -len * 0.12, hei * 0.1),
  ]);
  const veinMesh = new THREE.Mesh(
    new THREE.TubeGeometry(veinSpline, 20, wid * 0.045, 12, false),
    veinMat
  );
  spleen.add(veinMesh);

  return spleen;
}
