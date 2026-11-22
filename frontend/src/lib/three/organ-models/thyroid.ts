import * as THREE from 'three';
import { createTissueMaterial, createCartilageMaterial, createVesselMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const THYROID_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'right_lobe',
    name: 'Right Thyroid Lobe',
    normalizedPosition: [0.65, 0.25, 0.2],
    description: 'Lateral lobe embracing thyroid cartilage and trachea rings 2-4.',
    clinicalFunction: 'Follicular synthesis of T3 (triiodothyronine) and T4 (thyroxine).',
    system: 'Endocrine',
  },
  {
    id: 'left_lobe',
    name: 'Left Thyroid Lobe',
    normalizedPosition: [-0.65, 0.25, 0.2],
    description: 'Lateral lobe resting adjacent to common carotid artery and recurrent laryngeal nerve.',
    clinicalFunction: 'Parafollicular C-cell calcitonin calcium homeostasis regulation.',
    system: 'Endocrine',
  },
  {
    id: 'isthmus',
    name: 'Thyroid Isthmus',
    normalizedPosition: [0, -0.25, 0.35],
    description: 'Central horizontal bridge crossing anterior to tracheal rings 2 and 3.',
    clinicalFunction: 'Anatomical landmark directly overlying trachea during tracheostomy.',
    system: 'Endocrine',
  },
];

export function createThyroidModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const thyroid = new THREE.Group();
  thyroid.name = 'Human_Thyroid';

  const len = dimensions.lengthMm / 1000;
  const wid = dimensions.widthMm / 1000;
  const hei = dimensions.heightMm / 1000;

  const thyroidMat = createTissueMaterial('#944242', options);
  const tracheaMat = createCartilageMaterial('#D9C3B0', options);
  const arteryMat = createVesselMaterial('#C0392B', options);

  // 1. Trachea Shaft (cartilaginous scaffold behind thyroid)
  const tracheaGeo = new THREE.CylinderGeometry(wid * 0.24, wid * 0.24, len * 1.6, 24);
  const tracheaMesh = new THREE.Mesh(tracheaGeo, tracheaMat);
  thyroid.add(tracheaMesh);

  // 2. Right Thyroid Lobe (conical ellipsoid)
  const rLobeGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const rLobeMesh = new THREE.Mesh(rLobeGeo, thyroidMat);
  rLobeMesh.scale.set(wid * 0.26, len * 0.65, hei * 0.45);
  rLobeMesh.position.set(wid * 0.25, len * 0.05, hei * 0.18);
  rLobeMesh.rotation.z = -0.15;
  thyroid.add(rLobeMesh);

  // 3. Left Thyroid Lobe
  const lLobeGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const lLobeMesh = new THREE.Mesh(lLobeGeo, thyroidMat);
  lLobeMesh.scale.set(wid * 0.26, len * 0.65, hei * 0.45);
  lLobeMesh.position.set(-wid * 0.25, len * 0.05, hei * 0.18);
  lLobeMesh.rotation.z = 0.15;
  thyroid.add(lLobeMesh);

  // 4. Isthmus (connecting bridge across anterior midline)
  const isthmusGeo = new THREE.CylinderGeometry(wid * 0.12, wid * 0.12, wid * 0.35, 16);
  const isthmusMesh = new THREE.Mesh(isthmusGeo, thyroidMat);
  isthmusMesh.rotation.z = Math.PI / 2;
  isthmusMesh.position.set(0, -len * 0.15, hei * 0.25);
  thyroid.add(isthmusMesh);

  // 5. Superior Thyroid Arteries (vascular supply arches)
  [-1, 1].forEach((side) => {
    const artSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * wid * 0.38, len * 0.6, 0),
      new THREE.Vector3(side * wid * 0.28, len * 0.45, hei * 0.15),
      new THREE.Vector3(side * wid * 0.22, len * 0.3, hei * 0.2),
    ]);
    const artMesh = new THREE.Mesh(
      new THREE.TubeGeometry(artSpline, 16, wid * 0.02, 10, false),
      arteryMat
    );
    thyroid.add(artMesh);
  });

  return thyroid;
}
