import * as THREE from 'three';
import { createTissueMaterial, createVesselMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const LIVER_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'right_lobe',
    name: 'Right Hepatic Lobe',
    normalizedPosition: [0.45, 0.1, 0.1],
    description: 'Largest lobe of the liver occupying the right hypochondrium.',
    clinicalFunction: 'Major metabolic factory, glycogen storage, bile synthesis.',
    system: 'Digestive',
  },
  {
    id: 'left_lobe',
    name: 'Left Hepatic Lobe',
    normalizedPosition: [-0.55, 0.15, 0.1],
    description: 'Smaller, flattened triangular lobe extending into epigastrium.',
    clinicalFunction: 'Metabolic synthesis and toxin detoxification.',
    system: 'Digestive',
  },
  {
    id: 'falciform_ligament',
    name: 'Falciform Ligament',
    normalizedPosition: [-0.08, 0.45, 0.35],
    description: 'Peritoneal fold connecting liver to anterior abdominal wall and diaphragm.',
    clinicalFunction: 'Anatomical divide separating right and left anatomical lobes.',
    system: 'Digestive',
  },
  {
    id: 'gallbladder',
    name: 'Gallbladder',
    normalizedPosition: [0.15, -0.45, 0.3],
    description: 'Pear-shaped sac on visceral surface storing and concentrating bile.',
    clinicalFunction: 'Bile concentration and cholecystokinin-triggered expulsion.',
    system: 'Digestive / Biliary',
  },
  {
    id: 'ivc',
    name: 'Inferior Vena Cava (IVC) Groove',
    normalizedPosition: [0.05, 0.55, -0.3],
    description: 'Posterior fossa transmitting the IVC receiving hepatic veins.',
    clinicalFunction: 'Systemic venous drainage returning to the heart.',
    system: 'Cardiovascular',
  },
  {
    id: 'porta_hepatis',
    name: 'Porta Hepatis',
    normalizedPosition: [0.05, -0.15, -0.1],
    description: 'Transverse fissure transmitting portal triad (portal vein, hepatic artery, bile duct).',
    clinicalFunction: 'Neurovascular and biliary entrance/exit.',
    system: 'Digestive / Vascular',
  },
];

export function createLiverModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const liver = new THREE.Group();
  liver.name = 'Human_Liver';

  const len = dimensions.lengthMm / 1000; // length (AP)
  const wid = dimensions.widthMm / 1000; // width (transverse)
  const hei = dimensions.heightMm / 1000; // height (vertical)

  const liverMat = createTissueMaterial('#873E23', options);
  const leftLobeMat = createTissueMaterial('#944A2E', options);
  const gallbladderMat = createTissueMaterial('#3E6B27', options);
  const ivcMat = createVesselMaterial('#3B6998', options);
  const portalMat = createVesselMaterial('#5A3E7A', options);

  // 1. Right Lobe (massive dome, rounded convex superior surface)
  const rLobeGeo = new THREE.SphereGeometry(0.5, 48, 48);
  const rLobeMesh = new THREE.Mesh(rLobeGeo, liverMat);
  rLobeMesh.scale.set(wid * 0.55, hei * 0.72, len * 0.65);
  rLobeMesh.position.set(wid * 0.12, 0, 0);
  liver.add(rLobeMesh);

  // 2. Left Lobe (flattened, tapered wedge extending laterally to left)
  const lLobeGeo = new THREE.SphereGeometry(0.44, 36, 36);
  const lLobeMesh = new THREE.Mesh(lLobeGeo, leftLobeMat);
  lLobeMesh.scale.set(wid * 0.42, hei * 0.48, len * 0.45);
  lLobeMesh.position.set(-wid * 0.28, hei * 0.04, -len * 0.05);
  lLobeMesh.rotation.z = 0.2;
  liver.add(lLobeMesh);

  // 3. Falciform Ligament Line (fine dividing extrusion on anterior-superior border)
  const falciformSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-wid * 0.04, hei * 0.42, len * 0.15),
    new THREE.Vector3(-wid * 0.05, hei * 0.15, len * 0.32),
    new THREE.Vector3(-wid * 0.06, -hei * 0.25, len * 0.3),
  ]);
  const falciformTube = new THREE.TubeGeometry(falciformSpline, 24, wid * 0.015, 12, false);
  const falciformMesh = new THREE.Mesh(falciformTube, createTissueMaterial('#B56345', options));
  liver.add(falciformMesh);

  // 4. Gallbladder (pear-shaped ellipsoid on inferior visceral surface)
  const gbGeo = new THREE.SphereGeometry(0.35, 24, 24);
  const gbMesh = new THREE.Mesh(gbGeo, gallbladderMat);
  gbMesh.scale.set(wid * 0.14, hei * 0.18, len * 0.32);
  gbMesh.position.set(wid * 0.1, -hei * 0.38, len * 0.22);
  gbMesh.rotation.x = 0.4;
  liver.add(gbMesh);

  // 5. Inferior Vena Cava (large vertical blue trunk in posterior groove)
  const ivcSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(wid * 0.06, -hei * 0.45, -len * 0.25),
    new THREE.Vector3(wid * 0.05, 0, -len * 0.28),
    new THREE.Vector3(wid * 0.04, hei * 0.45, -len * 0.26),
  ]);
  const ivcTube = new THREE.TubeGeometry(ivcSpline, 24, wid * 0.055, 16, false);
  const ivcMesh = new THREE.Mesh(ivcTube, ivcMat);
  liver.add(ivcMesh);

  // 6. Hepatic Portal Vein (entering at porta hepatis)
  const portalSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -hei * 0.45, -len * 0.05),
    new THREE.Vector3(wid * 0.04, -hei * 0.2, -len * 0.12),
  ]);
  const portalTube = new THREE.TubeGeometry(portalSpline, 16, wid * 0.045, 14, false);
  const portalMesh = new THREE.Mesh(portalTube, portalMat);
  liver.add(portalMesh);

  return liver;
}
