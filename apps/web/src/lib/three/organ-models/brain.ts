import * as THREE from 'three';
import { createTissueMaterial, createVesselMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const BRAIN_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'frontal_lobe',
    name: 'Frontal Lobe & Prefrontal Cortex',
    normalizedPosition: [0.0, 0.22, 0.58],
    description: 'Largest cerebral lobe governing executive functions, voluntary motor control, cognitive flexibility, abstract reasoning, and expressive language via Broca\'s area (inferior frontal gyrus).',
    clinicalFunction: 'Damage causes executive dysfunction, abulia, personality disinhibition, or non-fluent (Broca\'s) motor aphasia.',
    system: 'Telencephalon (Cortex)',
  },
  {
    id: 'parietal_lobe',
    name: 'Parietal Lobe & Somatosensory Cortex',
    normalizedPosition: [0.0, 0.62, 0.12],
    description: 'Houses the primary somatosensory cortex (postcentral gyrus) which processes contralateral tactile sensation, thermal discrimination, stereognosis, and spatial attention integration.',
    clinicalFunction: 'Non-dominant parietal lesions cause hemispatial neglect; dominant inferior parietal lesions produce Gerstmann syndrome.',
    system: 'Telencephalon (Cortex)',
  },
  {
    id: 'temporal_lobe',
    name: 'Temporal Lobe & Auditory Cortex',
    normalizedPosition: [0.48, -0.08, 0.22],
    description: 'Processes auditory signals (transverse temporal gyri of Heschl), receptive language comprehension (Wernicke\'s area in superior temporal gyrus), and episodic memory encoding via deep medial hippocampal structures.',
    clinicalFunction: 'Lesions cause receptive sensory aphasia (fluent word salad), anterograde amnesia, or temporal lobe epilepsy.',
    system: 'Telencephalon (Cortex)',
  },
  {
    id: 'occipital_lobe',
    name: 'Occipital Lobe & Primary Visual Cortex (V1)',
    normalizedPosition: [0.0, 0.08, -0.62],
    description: 'Posterior visual processing center arranged retinotopically along the banks of the calcarine sulcus, receiving geniculocalcarine radiations from the lateral geniculate nucleus.',
    clinicalFunction: 'Posterior cerebral artery (PCA) infarction causes contralateral homonymous hemianopsia with macular sparing.',
    system: 'Telencephalon (Cortex)',
  },
  {
    id: 'cerebellum',
    name: 'Cerebellar Hemispheres & Folia',
    normalizedPosition: [0.24, -0.42, -0.44],
    description: 'Dorsal metencephalic structure containing over 50% of the brain\'s total neurons, folded into tight horizontal folia for calibration of motor timing, coordination, vestibular balance, and motor learning.',
    clinicalFunction: 'Cerebellar strokes or degenerative ataxia manifest with dysmetria, intention tremor, scanning dysarthria, and nystagmus.',
    system: 'Metencephalon (Coordination)',
  },
  {
    id: 'brainstem_pons',
    name: 'Brainstem (Pons & Medulla Oblongata)',
    normalizedPosition: [0.0, -0.56, -0.12],
    description: 'Vital autonomic conduit transmitting ascending sensory and descending pyramidal motor tracts; houses the respiratory centers, cardiovascular vasomotor nuclei, and cranial nerve nuclei III–XII.',
    clinicalFunction: 'Brainstem herniation (tonsillar/uncal) compresses vital respiratory pacemaker nuclei, resulting in rapid circulatory collapse.',
    system: 'Brainstem (Autonomic)',
  },
  {
    id: 'mca_vessel',
    name: 'Middle Cerebral Artery (Sylvian M2/M3)',
    normalizedPosition: [0.44, 0.12, 0.28],
    description: 'Largest branch of the internal carotid artery, projecting laterally into the Sylvian fissure to supply 80% of the cerebral convexities, motor homunculus (face/arm), and language centers.',
    clinicalFunction: 'Most common site of ischemic thromboembolic stroke, causing contralateral hemiplegia and acute cortical deficits.',
    system: 'Cerebrovascular Circulation',
  },
  {
    id: 'longitudinal_fissure',
    name: 'Longitudinal Fissure & Corpus Callosum',
    normalizedPosition: [0.0, 0.44, 0.0],
    description: 'Deep sagittal cleft separating the left and right cerebral hemispheres, underlaid by the corpus callosum with ~200 million transverse commissural axonal projections.',
    clinicalFunction: 'Surgical anterior corpus callosotomy prevents interhemispheric spread of intractable epileptic seizures.',
    system: 'Commissural Architecture',
  },
];

/** Multi-frequency gyral folding displacement */
function sculptGyralCortex(
  geo: THREE.BufferGeometry,
  frequency: number,
  amplitude: number,
  seed: number
): THREE.BufferGeometry {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const count = pos.count;
  const v = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    const len = v.length() || 1;
    const nx = v.x / len;
    const ny = v.y / len;
    const nz = v.z / len;

    // Organic harmonic brain gyri displacement
    const gyrusWave =
      Math.sin(nx * frequency * 3.4 + seed) * Math.cos(ny * frequency * 2.8 + seed * 0.7) * 0.42 +
      Math.sin(ny * frequency * 4.1 + nz * frequency * 3.1 + seed * 0.4) * 0.36 +
      Math.cos(nx * frequency * 5.2 + nz * frequency * 3.8 + seed * 1.1) * 0.22;

    const disp = gyrusWave * amplitude;
    pos.setXYZ(i, v.x + nx * disp, v.y + ny * disp, v.z + nz * disp);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function createBrainModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const brain = new THREE.Group();
  brain.name = 'Human_Brain_Encephalon';

  const len = dimensions.lengthMm / 1000; // ~0.16m
  const wid = dimensions.widthMm / 1000; // ~0.14m
  const hei = dimensions.heightMm / 1000; // ~0.12m

  // ── Authentic Anatomical Materials ─────────────────────────────────────────
  const cortexMat = createTissueMaterial('#D4A88B', {
    ...options,
    roughness: 0.64,
    clearcoat: 0.35,
    clearcoatRoughness: 0.28,
  }); // Warm cerebral grey matter with soft capillary blush

  const cortexRMat = createTissueMaterial('#CEA285', {
    ...options,
    roughness: 0.65,
    clearcoat: 0.35,
  });

  const cerebellumMat = createTissueMaterial('#BF9478', {
    ...options,
    roughness: 0.72,
    clearcoat: 0.2,
  }); // Cerebellar folia: slightly denser tan

  const brainstemMat = createTissueMaterial('#C4A48A', {
    ...options,
    roughness: 0.5,
    clearcoat: 0.4,
  }); // Brainstem: smooth neural tract sheen

  const arteryMat = createVesselMaterial('#DC2626', {
    ...options,
    roughness: 0.28,
    clearcoat: 0.65,
  }); // Cerebral arteries: vibrant scarlet

  const venousSinusMat = createVesselMaterial('#1D4ED8', {
    ...options,
    roughness: 0.35,
    clearcoat: 0.5,
  }); // Venous sinuses: deep blue

  const opticChiasmMat = createTissueMaterial('#E5D0BA', {
    ...options,
    roughness: 0.45,
    clearcoat: 0.3,
  }); // Optic nerve white matter

  // ── 1. Left Cerebral Hemisphere ───────────────────────────────────────────
  const lhGeo = new THREE.SphereGeometry(0.48, 80, 80);
  // Shape the hemisphere: flattened medial wall, elongated anteroposteriorly
  const lhPos = lhGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < lhPos.count; i++) {
    const x = lhPos.getX(i);
    const y = lhPos.getY(i);
    const z = lhPos.getZ(i);
    // Flatten medial wall (where x > 0) to meet longitudinal fissure cleanly
    const medialX = x > 0 ? x * 0.45 : x * 1.05;
    // Frontal pole slightly broader, occipital pole narrower
    const apShape = z > 0 ? 1.05 : 0.95;
    lhPos.setXYZ(i, medialX, y * 0.92, z * 1.15 * apShape);
  }
  sculptGyralCortex(lhGeo, 8.2, 0.032, 12.4);

  const lhMesh = new THREE.Mesh(lhGeo, cortexMat);
  lhMesh.scale.set(len * 0.48, hei * 0.94, wid * 0.52);
  lhMesh.position.set(-len * 0.052, hei * 0.04, 0);
  lhMesh.castShadow = true;
  lhMesh.receiveShadow = true;
  brain.add(lhMesh);

  // ── 2. Right Cerebral Hemisphere ──────────────────────────────────────────
  const rhGeo = new THREE.SphereGeometry(0.48, 80, 80);
  const rhPos = rhGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < rhPos.count; i++) {
    const x = rhPos.getX(i);
    const y = rhPos.getY(i);
    const z = rhPos.getZ(i);
    const medialX = x < 0 ? x * 0.45 : x * 1.05;
    const apShape = z > 0 ? 1.05 : 0.95;
    rhPos.setXYZ(i, medialX, y * 0.92, z * 1.15 * apShape);
  }
  sculptGyralCortex(rhGeo, 8.2, 0.032, 28.7);

  const rhMesh = new THREE.Mesh(rhGeo, cortexRMat);
  rhMesh.scale.set(len * 0.48, hei * 0.94, wid * 0.52);
  rhMesh.position.set(len * 0.052, hei * 0.04, 0);
  rhMesh.castShadow = true;
  rhMesh.receiveShadow = true;
  brain.add(rhMesh);

  // ── 3. Temporal Lobes (Bilateral anterior-inferior projections) ───────────
  [-1, 1].forEach(side => {
    const tlGeo = new THREE.SphereGeometry(0.24, 48, 48);
    const tlPos = tlGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < tlPos.count; i++) {
      const x = tlPos.getX(i);
      const y = tlPos.getY(i);
      const z = tlPos.getZ(i);
      tlPos.setXYZ(i, x * 1.1, y * 0.85, z * 1.4); // Elongated temporal pole
    }
    sculptGyralCortex(tlGeo, 9.0, 0.022, side === -1 ? 44 : 88);

    const tlMesh = new THREE.Mesh(tlGeo, cortexMat);
    tlMesh.scale.set(len * 0.32, hei * 0.38, wid * 0.34);
    tlMesh.position.set(side * len * 0.28, -hei * 0.18, wid * 0.16);
    tlMesh.rotation.x = -0.15;
    tlMesh.rotation.y = side * 0.2;
    brain.add(tlMesh);
  });

  // ── 4. Cerebellum & Vermis (Infratentorial dense folia) ───────────────────
  [-1, 1].forEach(side => {
    const cbGeo = new THREE.SphereGeometry(0.32, 64, 64);
    // Compress vertically and stretch horizontally to mimic horizontal folia
    const cbPos = cbGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cbPos.count; i++) {
      const x = cbPos.getX(i);
      const y = cbPos.getY(i);
      const z = cbPos.getZ(i);
      // Tight horizontal ridge waves for cerebellar folia
      const foliaWave = Math.sin(y * 42.0) * 0.012;
      cbPos.setXYZ(i, x * 1.25 + (x > 0 ? foliaWave : -foliaWave), y * 0.72, z * 0.95);
    }
    sculptGyralCortex(cbGeo, 14.0, 0.024, side === -1 ? 102 : 155);

    const cbMesh = new THREE.Mesh(cbGeo, cerebellumMat);
    cbMesh.scale.set(len * 0.32, hei * 0.34, wid * 0.32);
    cbMesh.position.set(side * len * 0.16, -hei * 0.42, -wid * 0.36);
    cbMesh.castShadow = true;
    brain.add(cbMesh);
  });

  // Cerebellar Vermis (Midline connecting structure)
  const vermisGeo = new THREE.SphereGeometry(0.2, 36, 36);
  sculptGyralCortex(vermisGeo, 12.0, 0.018, 199);
  const vermisMesh = new THREE.Mesh(vermisGeo, cerebellumMat);
  vermisMesh.scale.set(len * 0.14, hei * 0.32, wid * 0.28);
  vermisMesh.position.set(0, -hei * 0.42, -wid * 0.38);
  brain.add(vermisMesh);

  // ── 5. Brainstem (Pons bulge, Midbrain & Medulla Oblongata) ───────────────
  // Midbrain / Cerebral Peduncles
  const midbrainGeo = new THREE.CylinderGeometry(len * 0.065, len * 0.075, hei * 0.18, 20);
  const midbrainMesh = new THREE.Mesh(midbrainGeo, brainstemMat);
  midbrainMesh.position.set(0, -hei * 0.22, -wid * 0.06);
  midbrainMesh.rotation.x = -0.15;
  brain.add(midbrainMesh);

  // Pons (Prominent bulbous anterior expansion)
  const ponsGeo = new THREE.SphereGeometry(len * 0.115, 32, 32);
  ponsGeo.scale(1.2, 0.85, 1.25);
  const ponsMesh = new THREE.Mesh(ponsGeo, brainstemMat);
  ponsMesh.position.set(0, -hei * 0.38, wid * 0.02);
  ponsMesh.castShadow = true;
  brain.add(ponsMesh);

  // Medulla Oblongata (Tapering cone down to foramen magnum)
  const medullaGeo = new THREE.CylinderGeometry(len * 0.07, len * 0.045, hei * 0.28, 24);
  const medullaMesh = new THREE.Mesh(medullaGeo, brainstemMat);
  medullaMesh.position.set(0, -hei * 0.58, -wid * 0.02);
  medullaMesh.rotation.x = -0.1;
  brain.add(medullaMesh);

  // Spinal cord stump
  const scGeo = new THREE.CylinderGeometry(len * 0.045, len * 0.042, hei * 0.22, 20);
  const scMesh = new THREE.Mesh(scGeo, brainstemMat);
  scMesh.position.set(0, -hei * 0.8, -wid * 0.04);
  brain.add(scMesh);

  // ── 6. Optic Chiasm & Nerves (Cranial Nerve II anterior to stalk) ──────────
  const chiasmPoints = [
    new THREE.Vector3(-len * 0.12, -hei * 0.16, wid * 0.28), // Left optic nerve
    new THREE.Vector3(0, -hei * 0.18, wid * 0.20),          // Optic Chiasm
    new THREE.Vector3(len * 0.12, -hei * 0.16, wid * 0.28),  // Right optic nerve
  ];
  heartTube(brain, chiasmPoints, len * 0.015, opticChiasmMat);

  // Optic Tracts (Projecting posteriorly around cerebral peduncles)
  const leftTract = [
    new THREE.Vector3(0, -hei * 0.18, wid * 0.20),
    new THREE.Vector3(-len * 0.08, -hei * 0.22, wid * 0.08),
    new THREE.Vector3(-len * 0.14, -hei * 0.24, -wid * 0.06),
  ];
  heartTube(brain, leftTract, len * 0.013, opticChiasmMat);

  const rightTract = [
    new THREE.Vector3(0, -hei * 0.18, wid * 0.20),
    new THREE.Vector3(len * 0.08, -hei * 0.22, wid * 0.08),
    new THREE.Vector3(len * 0.14, -hei * 0.24, -wid * 0.06),
  ];
  heartTube(brain, rightTract, len * 0.013, opticChiasmMat);

  // ── 7. Cerebrovascular Circulation (Circle of Willis & Major Arteries) ────
  // Basilar Artery (Ascending midline anterior groove of the pons)
  const basilarPoints = [
    new THREE.Vector3(0, -hei * 0.52, wid * 0.01),
    new THREE.Vector3(0, -hei * 0.38, wid * 0.12),
    new THREE.Vector3(0, -hei * 0.24, wid * 0.06),
  ];
  heartTube(brain, basilarPoints, len * 0.016, arteryMat);

  // Bilateral Middle Cerebral Arteries (Course into Sylvian Fissure)
  [-1, 1].forEach(side => {
    const mcaPoints = [
      new THREE.Vector3(side * len * 0.04, -hei * 0.18, wid * 0.16),
      new THREE.Vector3(side * len * 0.16, -hei * 0.14, wid * 0.22),
      new THREE.Vector3(side * len * 0.30, -hei * 0.06, wid * 0.24), // Sylvian bifurcation
      new THREE.Vector3(side * len * 0.42, hei * 0.06, wid * 0.18),  // Cortical M3/M4 branches
      new THREE.Vector3(side * len * 0.46, hei * 0.18, wid * 0.08),
    ];
    heartTube(brain, mcaPoints, len * 0.013, arteryMat);

    // Lateral striate / lenticulostriate perforator branch
    const striatePoints = [
      new THREE.Vector3(side * len * 0.16, -hei * 0.14, wid * 0.22),
      new THREE.Vector3(side * len * 0.22, -hei * 0.08, wid * 0.12),
      new THREE.Vector3(side * len * 0.26, 0, wid * 0.04),
    ];
    heartTube(brain, striatePoints, len * 0.009, arteryMat);
  });

  // Superior Sagittal Sinus (Dural venous sinus along superior midline)
  const sssPoints = [
    new THREE.Vector3(0, hei * 0.42, wid * 0.52),
    new THREE.Vector3(0, hei * 0.52, wid * 0.24),
    new THREE.Vector3(0, hei * 0.54, 0),
    new THREE.Vector3(0, hei * 0.48, -wid * 0.32),
    new THREE.Vector3(0, hei * 0.24, -wid * 0.54), // Confluence of sinuses (Torcular Herophili)
  ];
  heartTube(brain, sssPoints, len * 0.018, venousSinusMat);

  return brain;
}

/** Helper to add a curved tube mesh to a group */
function heartTube(
  parent: THREE.Group,
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material
) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, points.length * 8, radius, 12, false),
    material
  );
  mesh.castShadow = true;
  parent.add(mesh);
}
