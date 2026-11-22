import * as THREE from 'three';
import { createTissueMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const SMALL_INTESTINE_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'duodenum',
    name: 'Duodenal Loop',
    normalizedPosition: [0.35, 0.55, 0],
    description: 'C-shaped initial segment wrapping around the head of the pancreas.',
    clinicalFunction: 'Neutralizes gastric acid and receives bile & pancreatic enzymes.',
    system: 'Digestive',
  },
  {
    id: 'jejunum',
    name: 'Jejunal Loops',
    normalizedPosition: [-0.4, 0.15, 0.2],
    description: 'Upper coiled two-fifths of mesenteric small intestine in umbilical region.',
    clinicalFunction: 'Primary site of carbohydrate, amino acid, and lipid absorption.',
    system: 'Digestive',
  },
  {
    id: 'ileum',
    name: 'Ileum',
    normalizedPosition: [0.25, -0.45, 0.2],
    description: 'Terminal three-fifths of small intestine terminating at ileocecal valve.',
    clinicalFunction: 'Vitamin B12 absorption, bile salt reabsorption, Peyer patches immune defense.',
    system: 'Digestive / Immune',
  },
];

export function createSmallIntestineModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const intestine = new THREE.Group();
  intestine.name = 'Human_Small_Intestine';

  const len = dimensions.lengthMm / 1000;
  const wid = dimensions.widthMm / 1000;
  const hei = dimensions.heightMm / 1000;

  const jejunumMat = createTissueMaterial('#D48372', options);
  const ileumMat = createTissueMaterial('#C6705F', options);

  // Generate continuous serpentine folding curves
  const points: THREE.Vector3[] = [];
  const loops = 18;
  for (let i = 0; i <= loops; i++) {
    const t = i / loops;
    const angle = t * Math.PI * 8;
    const x = Math.sin(angle) * (wid * 0.35);
    const y = (t - 0.5) * (hei * 0.7);
    const z = Math.cos(angle * 0.6) * (len * 0.35);
    points.push(new THREE.Vector3(x, y, z));
  }

  const intestineSpline = new THREE.CatmullRomCurve3(points);
  const intestineTube = new THREE.TubeGeometry(intestineSpline, 96, wid * 0.045, 14, false);
  const intestineMesh = new THREE.Mesh(intestineTube, jejunumMat);
  intestine.add(intestineMesh);

  return intestine;
}
