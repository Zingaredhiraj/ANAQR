import * as THREE from 'three';
import { createTissueMaterial, createVesselMaterial, createCartilageMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const LUNGS_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'trachea',
    name: 'Trachea',
    normalizedPosition: [0, 0.85, 0],
    description: 'Cartilaginous tube conducting air from larynx into primary bronchi.',
    clinicalFunction: 'Airway patency and mucociliary clearance.',
    system: 'Respiratory',
  },
  {
    id: 'carina',
    name: 'Tracheal Carina',
    normalizedPosition: [0, 0.45, 0],
    description: 'Internal cartilaginous ridge at the bifurcation of primary bronchi.',
    clinicalFunction: 'Sensitive cough reflex trigger zone.',
    system: 'Respiratory',
  },
  {
    id: 'right_superior_lobe',
    name: 'Right Superior Lobe',
    normalizedPosition: [0.55, 0.45, 0.1],
    description: 'Upper pulmonary lobe of the 3-lobed right lung.',
    clinicalFunction: 'Alveolar gas exchange.',
    system: 'Respiratory',
  },
  {
    id: 'right_middle_lobe',
    name: 'Right Middle Lobe',
    normalizedPosition: [0.65, 0, 0.25],
    description: 'Middle pulmonary lobe separated by horizontal and oblique fissures.',
    clinicalFunction: 'Right pulmonary ventilation.',
    system: 'Respiratory',
  },
  {
    id: 'right_inferior_lobe',
    name: 'Right Inferior Lobe',
    normalizedPosition: [0.55, -0.45, -0.05],
    description: 'Largest posterior lobe resting on the right hemidiaphragm.',
    clinicalFunction: 'Major lower lobe ventilation and gas diffusion.',
    system: 'Respiratory',
  },
  {
    id: 'left_superior_lobe',
    name: 'Left Superior Lobe',
    normalizedPosition: [-0.55, 0.35, 0.1],
    description: 'Upper lobe of the 2-lobed left lung containing the cardiac notch.',
    clinicalFunction: 'Left upper respiratory ventilation.',
    system: 'Respiratory',
  },
  {
    id: 'left_inferior_lobe',
    name: 'Left Inferior Lobe',
    normalizedPosition: [-0.55, -0.45, -0.05],
    description: 'Posterior-inferior lobe of left lung resting on the diaphragm.',
    clinicalFunction: 'Lower respiratory gas exchange.',
    system: 'Respiratory',
  },
  {
    id: 'cardiac_notch',
    name: 'Cardiac Notch',
    normalizedPosition: [-0.25, -0.1, 0.2],
    description: 'Anterior concavity of left lung accommodating the cardiac apex.',
    clinicalFunction: 'Anatomical landmark accommodating heart contour.',
    system: 'Respiratory',
  },
];

export function createLungsModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const lungs = new THREE.Group();
  lungs.name = 'Human_Lungs';

  const len = dimensions.lengthMm / 1000; // depth
  const wid = dimensions.widthMm / 1000; // width
  const hei = dimensions.heightMm / 1000; // height

  const lungParenchymaMat = createTissueMaterial('#D98C8C', options);
  const leftLungMat = createTissueMaterial('#D08080', options);
  const rightMiddleMat = createTissueMaterial('#DE9595', options);
  const cartilageMat = createCartilageMaterial('#D9C3B0', options);
  const arteryMat = createVesselMaterial('#527FA8', options);
  const veinMat = createVesselMaterial('#C0392B', options);

  // 1. Trachea with horizontal cartilage rings
  const tracheaSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, hei * 0.75, 0),
    new THREE.Vector3(0, hei * 0.45, -len * 0.04),
    new THREE.Vector3(0, hei * 0.22, -len * 0.05),
  ]);
  const tracheaTube = new THREE.TubeGeometry(tracheaSpline, 32, wid * 0.045, 18, false);
  const tracheaMesh = new THREE.Mesh(tracheaTube, cartilageMat);
  lungs.add(tracheaMesh);

  // Trachea cartilaginous rings
  for (let i = 0; i < 7; i++) {
    const yPos = hei * 0.26 + i * (hei * 0.065);
    const ringGeo = new THREE.TorusGeometry(wid * 0.048, wid * 0.007, 12, 24, Math.PI * 1.6);
    const ringMesh = new THREE.Mesh(ringGeo, cartilageMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, yPos, -len * 0.035);
    lungs.add(ringMesh);
  }

  // 2. Primary Bronchi (Right is wider, shorter, more vertical; Left is longer, more angular)
  const rightBronchusSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, hei * 0.22, -len * 0.05),
    new THREE.Vector3(wid * 0.08, hei * 0.12, -len * 0.02),
    new THREE.Vector3(wid * 0.18, hei * 0.02, 0),
  ]);
  const rightBronchus = new THREE.Mesh(
    new THREE.TubeGeometry(rightBronchusSpline, 24, wid * 0.035, 16, false),
    cartilageMat
  );
  lungs.add(rightBronchus);

  const leftBronchusSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, hei * 0.22, -len * 0.05),
    new THREE.Vector3(-wid * 0.1, hei * 0.1, -len * 0.03),
    new THREE.Vector3(-wid * 0.22, hei * 0.02, 0),
  ]);
  const leftBronchus = new THREE.Mesh(
    new THREE.TubeGeometry(leftBronchusSpline, 24, wid * 0.03, 16, false),
    cartilageMat
  );
  lungs.add(leftBronchus);

  // 3. Right Lung: 3 Lobes (Superior, Middle, Inferior)
  const rSup = new THREE.Mesh(new THREE.SphereGeometry(0.48, 36, 36), lungParenchymaMat);
  rSup.scale.set(wid * 0.28, hei * 0.35, len * 0.38);
  rSup.position.set(wid * 0.28, hei * 0.22, len * 0.02);
  lungs.add(rSup);

  const rMid = new THREE.Mesh(new THREE.SphereGeometry(0.44, 32, 32), rightMiddleMat);
  rMid.scale.set(wid * 0.27, hei * 0.24, len * 0.36);
  rMid.position.set(wid * 0.32, -hei * 0.02, len * 0.08);
  lungs.add(rMid);

  const rInf = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 36), lungParenchymaMat);
  rInf.scale.set(wid * 0.3, hei * 0.42, len * 0.42);
  rInf.position.set(wid * 0.28, -hei * 0.25, -len * 0.04);
  lungs.add(rInf);

  // 4. Left Lung: 2 Lobes (Superior with cardiac notch, Inferior)
  const lSup = new THREE.Mesh(new THREE.SphereGeometry(0.48, 36, 36), leftLungMat);
  lSup.scale.set(wid * 0.26, hei * 0.42, len * 0.36);
  lSup.position.set(-wid * 0.28, hei * 0.18, len * 0.02);
  lungs.add(lSup);

  const lInf = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 36), leftLungMat);
  lInf.scale.set(wid * 0.28, hei * 0.44, len * 0.4);
  lInf.position.set(-wid * 0.28, -hei * 0.25, -len * 0.04);
  lungs.add(lInf);

  // 5. Pulmonary Hilar Vessels (Artery in blue, Vein in red)
  [-1, 1].forEach((side) => {
    const artSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, hei * 0.12, len * 0.05),
      new THREE.Vector3(side * wid * 0.15, hei * 0.05, len * 0.02),
      new THREE.Vector3(side * wid * 0.22, 0, len * 0.01),
    ]);
    const artMesh = new THREE.Mesh(
      new THREE.TubeGeometry(artSpline, 20, wid * 0.022, 12, false),
      arteryMat
    );
    lungs.add(artMesh);

    const veinSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, hei * 0.02, len * 0.04),
      new THREE.Vector3(side * wid * 0.14, -hei * 0.04, len * 0.02),
      new THREE.Vector3(side * wid * 0.2, -hei * 0.08, 0),
    ]);
    const veinMesh = new THREE.Mesh(
      new THREE.TubeGeometry(veinSpline, 20, wid * 0.02, 12, false),
      veinMat
    );
    lungs.add(veinMesh);
  });

  return lungs;
}
