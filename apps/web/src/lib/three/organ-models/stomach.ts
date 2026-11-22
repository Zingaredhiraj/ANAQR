import * as THREE from 'three';
import { createTissueMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const STOMACH_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'cardia',
    name: 'Cardia & Gastroesophageal Junction',
    normalizedPosition: [-0.15, 0.65, 0],
    description: 'Entry zone where the abdominal esophagus enters the stomach.',
    clinicalFunction: 'Lower esophageal sphincter prevents acid reflux.',
    system: 'Digestive',
  },
  {
    id: 'fundus',
    name: 'Gastric Fundus',
    normalizedPosition: [-0.45, 0.75, 0.1],
    description: 'Superior dome-shaped part of the stomach resting below left dome of diaphragm.',
    clinicalFunction: 'Accumulates swallowed air and digestive gas.',
    system: 'Digestive',
  },
  {
    id: 'greater_curvature',
    name: 'Greater Curvature',
    normalizedPosition: [-0.65, -0.1, 0.2],
    description: 'Convex lateral border giving attachment to the greater omentum.',
    clinicalFunction: 'High compliance gastric reservoir expansion.',
    system: 'Digestive',
  },
  {
    id: 'lesser_curvature',
    name: 'Lesser Curvature',
    normalizedPosition: [0.1, 0.15, 0.05],
    description: 'Concave medial border giving attachment to the lesser omentum.',
    clinicalFunction: 'Magenstrasse rapid fluid transit pathway.',
    system: 'Digestive',
  },
  {
    id: 'pylorus',
    name: 'Pyloric Antrum & Sphincter',
    normalizedPosition: [0.55, -0.4, 0.1],
    description: 'Thick muscular ring controlling chyme release into duodenum.',
    clinicalFunction: 'Gastric emptying rate regulation.',
    system: 'Digestive',
  },
];

export function createStomachModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const stomach = new THREE.Group();
  stomach.name = 'Human_Stomach';

  const len = dimensions.lengthMm / 1000; // length
  const wid = dimensions.widthMm / 1000; // width
  const hei = dimensions.heightMm / 1000; // depth

  const bodyMat = createTissueMaterial('#C46D6D', options);
  const fundusMat = createTissueMaterial('#B55E5E', options);
  const pylorusMat = createTissueMaterial('#D49B9B', options);

  // 1. J-Curved Gastric Body via smooth CatmullRom spline
  const gastricSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-wid * 0.1, len * 0.35, 0), // Cardia
    new THREE.Vector3(-wid * 0.28, len * 0.15, hei * 0.12), // Upper body
    new THREE.Vector3(-wid * 0.35, -len * 0.12, hei * 0.15), // Greater curvature belly
    new THREE.Vector3(-wid * 0.15, -len * 0.35, hei * 0.1), // Inferior angle
    new THREE.Vector3(wid * 0.15, -len * 0.32, hei * 0.05), // Antrum
    new THREE.Vector3(wid * 0.35, -len * 0.22, 0), // Pylorus
  ]);

  const stomachTube = new THREE.TubeGeometry(gastricSpline, 48, wid * 0.22, 24, false);
  const bodyMesh = new THREE.Mesh(stomachTube, bodyMat);
  stomach.add(bodyMesh);

  // 2. Fundus Dome (superior rounded bulging pole)
  const fundusGeo = new THREE.SphereGeometry(0.38, 32, 32);
  const fundusMesh = new THREE.Mesh(fundusGeo, fundusMat);
  fundusMesh.scale.set(wid * 0.32, len * 0.22, hei * 0.35);
  fundusMesh.position.set(-wid * 0.22, len * 0.38, hei * 0.05);
  stomach.add(fundusMesh);

  // 3. Pyloric Sphincter (muscular collar ring at terminal exit)
  const pylorusGeo = new THREE.CylinderGeometry(wid * 0.11, wid * 0.11, len * 0.08, 20);
  const pylorusMesh = new THREE.Mesh(pylorusGeo, pylorusMat);
  pylorusMesh.rotation.z = Math.PI / 3;
  pylorusMesh.position.set(wid * 0.38, -len * 0.18, 0);
  stomach.add(pylorusMesh);

  return stomach;
}
