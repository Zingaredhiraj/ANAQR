import * as THREE from 'three';
import { createTissueMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const LARGE_INTESTINE_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'cecum',
    name: 'Cecum',
    normalizedPosition: [0.65, -0.65, 0.1],
    description: 'Cul-de-sac pouch marking the start of the large intestine in right iliac fossa.',
    clinicalFunction: 'Bacterial fermentation and fluid absorption.',
    system: 'Digestive',
  },
  {
    id: 'appendix',
    name: 'Vermiform Appendix',
    normalizedPosition: [0.72, -0.85, 0.15],
    description: 'Finger-like tubular diverticulum arising from posteromedial cecal wall.',
    clinicalFunction: 'Immunological gut-associated lymphoid tissue (GALT) reservoir.',
    system: 'Digestive / Immune',
  },
  {
    id: 'ascending_colon',
    name: 'Ascending Colon',
    normalizedPosition: [0.7, 0, 0.05],
    description: 'Retroperitoneal colonic segment ascending along right abdominal flank.',
    clinicalFunction: 'Water and electrolyte reabsorption from liquid chyme.',
    system: 'Digestive',
  },
  {
    id: 'transverse_colon',
    name: 'Transverse Colon',
    normalizedPosition: [0, 0.7, 0.15],
    description: 'Longest, most mobile colonic segment crossing anterior upper abdomen.',
    clinicalFunction: 'Feces consolidation and propulsion.',
    system: 'Digestive',
  },
  {
    id: 'descending_colon',
    name: 'Descending Colon',
    normalizedPosition: [-0.7, 0, 0.05],
    description: 'Retroperitoneal colonic segment descending along left flank.',
    clinicalFunction: 'Fecal storage before defecation.',
    system: 'Digestive',
  },
  {
    id: 'sigmoid_colon',
    name: 'Sigmoid Colon & Rectum',
    normalizedPosition: [-0.25, -0.7, 0.1],
    description: 'S-shaped pelvic colonic loop terminating in the rectal ampulla.',
    clinicalFunction: 'Defecation continence and fecal expulsion.',
    system: 'Digestive',
  },
];

export function createLargeIntestineModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const colon = new THREE.Group();
  colon.name = 'Human_Large_Intestine';

  const len = dimensions.lengthMm / 1000; // depth
  const wid = dimensions.widthMm / 1000; // width
  const hei = dimensions.heightMm / 1000; // height

  const colonMat = createTissueMaterial('#BC7A65', options);
  const cecumMat = createTissueMaterial('#A86350', options);

  // Inverted U-shape colonic pathway
  const colonSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(wid * 0.35, -hei * 0.35, 0), // Cecum
    new THREE.Vector3(wid * 0.38, -hei * 0.15, -len * 0.05), // Ascending colon
    new THREE.Vector3(wid * 0.36, hei * 0.28, -len * 0.08), // Hepatic flexure
    new THREE.Vector3(wid * 0.15, hei * 0.35, len * 0.08), // Transverse arch right
    new THREE.Vector3(-wid * 0.15, hei * 0.32, len * 0.06), // Transverse arch left
    new THREE.Vector3(-wid * 0.38, hei * 0.3, -len * 0.08), // Splenic flexure
    new THREE.Vector3(-wid * 0.38, -hei * 0.15, -len * 0.05), // Descending colon
    new THREE.Vector3(-wid * 0.25, -hei * 0.38, len * 0.02), // Sigmoid loop
    new THREE.Vector3(0, -hei * 0.45, -len * 0.05), // Rectum
  ]);

  const tubeGeo = new THREE.TubeGeometry(colonSpline, 64, wid * 0.075, 18, false);
  const colonMesh = new THREE.Mesh(tubeGeo, colonMat);
  colon.add(colonMesh);

  // Cecum rounded pouch
  const cecumGeo = new THREE.SphereGeometry(wid * 0.11, 24, 24);
  const cecumMesh = new THREE.Mesh(cecumGeo, cecumMat);
  cecumMesh.position.set(wid * 0.35, -hei * 0.38, 0);
  colon.add(cecumMesh);

  // Vermiform Appendix (thin coiled tube)
  const appSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(wid * 0.35, -hei * 0.42, 0),
    new THREE.Vector3(wid * 0.38, -hei * 0.48, len * 0.05),
    new THREE.Vector3(wid * 0.36, -hei * 0.52, len * 0.08),
  ]);
  const appTube = new THREE.TubeGeometry(appSpline, 16, wid * 0.016, 10, false);
  const appMesh = new THREE.Mesh(appTube, cecumMat);
  colon.add(appMesh);

  return colon;
}
