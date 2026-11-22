import * as THREE from 'three';
import { createTissueMaterial, createVesselMaterial } from '../organ-materials';
import { OrganDimensions, OrganRenderOptions, AnatomicalHotspot } from '../types';

export const HEART_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'aortic_arch',
    name: 'Aortic Arch & Brachiocephalic Branches',
    normalizedPosition: [0.08, 0.48, 0.02],
    description: 'The highest portion of the aorta which curves over the heart, giving off the brachiocephalic trunk, left common carotid, and left subclavian arteries.',
    clinicalFunction: 'High-pressure conduit supplying oxygenated blood to the brain, neck, and upper extremities. Site of aortic dissection and coarctation.',
    system: 'Cardiovascular (Arterial)',
  },
  {
    id: 'pulmonary_trunk',
    name: 'Pulmonary Trunk & Bifurcation',
    normalizedPosition: [-0.14, 0.32, 0.22],
    description: 'Arises from the right ventricle, courses anterior and leftward of the ascending aorta, and bifurcates into left and right pulmonary arteries carrying deoxygenated blood to the lungs.',
    clinicalFunction: 'Low-pressure conduit for deoxygenated blood. Key landmark in pulmonary embolism and pulmonary hypertension.',
    system: 'Cardiovascular (Pulmonary)',
  },
  {
    id: 'lad_coronary',
    name: 'Left Anterior Descending (LAD) Artery',
    normalizedPosition: [-0.06, -0.05, 0.36],
    description: 'Clinically termed the "Widow Maker", this critical vessel courses through the anterior interventricular sulcus supplying 45–55% of the left ventricular myocardium.',
    clinicalFunction: 'Myocardial perfusion to the apex, anterior wall, and anterior two-thirds of the septum. Most frequent site of acute myocardial infarction.',
    system: 'Coronary Vasculature',
  },
  {
    id: 'left_ventricle',
    name: 'Left Ventricle (Apex & Muscular Free Wall)',
    normalizedPosition: [-0.28, -0.26, 0.16],
    description: 'The thickest muscular chamber of the heart (8–12 mm wall thickness), designed to generate 120 mmHg peak systolic pressure.',
    clinicalFunction: 'Primary systemic muscular pump. Evaluated via Ejection Fraction (normal 55–70%). Substrate for hypertrophic cardiomyopathy and systolic heart failure.',
    system: 'Myocardium',
  },
  {
    id: 'right_ventricle',
    name: 'Right Ventricle (Conus Arteriosus)',
    normalizedPosition: [0.18, -0.12, 0.26],
    description: 'Crescent-shaped low-pressure chamber that receives deoxygenated blood from the right atrium through the tricuspid valve and pumps it into the lungs.',
    clinicalFunction: 'Pumps against low pulmonary vascular resistance (~25/10 mmHg). Prone to strain in acute PE (McConnell sign).',
    system: 'Myocardium',
  },
  {
    id: 'right_atrium',
    name: 'Right Atrium & Pectinate Appendage',
    normalizedPosition: [0.32, 0.18, 0.04],
    description: 'Thin-walled receiving chamber that collects systemic venous return from the superior and inferior vena cavae, as well as the coronary sinus.',
    clinicalFunction: 'Houses the Sinoatrial (SA) Node at the junction with the SVC, initiating rhythmic cardiac depolarization at 60–100 bpm.',
    system: 'Cardiac Conduction / Venous',
  },
  {
    id: 'superior_vena_cava',
    name: 'Superior Vena Cava (SVC)',
    normalizedPosition: [0.26, 0.52, -0.08],
    description: 'Large valveless venous trunk formed by the confluence of the left and right brachiocephalic veins, returning blood from the upper half of the body.',
    clinicalFunction: 'Central venous pressure (CVP) monitoring reference point. Susceptible to SVC syndrome from mediastinal mass compression.',
    system: 'Cardiovascular (Venous)',
  },
  {
    id: 'cardiac_apex',
    name: 'Anatomical Cardiac Apex',
    normalizedPosition: [-0.22, -0.48, 0.14],
    description: 'Inferolateral conical tip of the heart directed anteriorly, inferiorly, and to the left, resting against the left 5th intercostal space.',
    clinicalFunction: 'Point of Maximal Impulse (PMI) on clinical cardiac auscultation. Displacement indicates left ventricular dilation or cardiomegaly.',
    system: 'Anatomical Landmark',
  },
];

/** Sculpt organic vertex perturbation with continuous frequency harmonics */
function sculptOrganicTissue(
  geo: THREE.BufferGeometry,
  frequency: number,
  amplitude: number,
  biasY: number = 0
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

    // Multi-frequency harmonic perturbation
    const wave =
      Math.sin(nx * frequency * 2.8 + biasY) * Math.cos(ny * frequency * 2.1 + 0.4) * 0.45 +
      Math.sin(ny * frequency * 3.5 + nz * frequency * 2.2) * 0.35 +
      Math.cos(nz * frequency * 4.2 + nx * frequency * 1.9) * 0.2;

    const disp = wave * amplitude;
    pos.setXYZ(i, v.x + nx * disp, v.y + ny * disp, v.z + nz * disp);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function createHeartModel(
  dimensions: OrganDimensions,
  options: OrganRenderOptions = {}
): THREE.Group {
  const heart = new THREE.Group();
  heart.name = 'Human_Cardiovascular_Heart';

  const len = dimensions.lengthMm / 1000; // ~0.12m
  const wid = dimensions.widthMm / 1000; // ~0.09m
  const hei = dimensions.heightMm / 1000; // ~0.08m

  // ── Premium PBR Anatomical Materials ───────────────────────────────────────
  const lvMat = createTissueMaterial('#881C28', {
    ...options,
    roughness: 0.52,
    clearcoat: 0.45,
    clearcoatRoughness: 0.25,
  }); // Left ventricle: rich deep myocardial crimson

  const rvMat = createTissueMaterial('#942634', {
    ...options,
    roughness: 0.55,
    clearcoat: 0.4,
  }); // Right ventricle: anterior myocardial tone

  const atriaMat = createTissueMaterial('#A83E4C', {
    ...options,
    roughness: 0.6,
    clearcoat: 0.3,
  }); // Atria & auricles: slightly softer tissue

  const fatMat = createTissueMaterial('#D9B48F', {
    ...options,
    roughness: 0.72,
    clearcoat: 0.2,
  }); // Subepicardial adipose sulcus fat: soft yellowish cream

  const aortaMat = createVesselMaterial('#C5221F', {
    ...options,
    roughness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
  }); // Aorta: vibrant arterial crimson

  const pulmonaryMat = createVesselMaterial('#1D5FA8', {
    ...options,
    roughness: 0.38,
    clearcoat: 0.5,
  }); // Pulmonary artery: medical deep cobalt

  const vcavaMat = createVesselMaterial('#184275', {
    ...options,
    roughness: 0.4,
    clearcoat: 0.45,
  }); // Vena Cava: deep sapphire blue

  const coronaryArteryMat = createVesselMaterial('#EA3323', {
    ...options,
    roughness: 0.25,
    clearcoat: 0.7,
  }); // Coronary artery: vivid arterial scarlet

  const coronaryVeinMat = createVesselMaterial('#2563EB', {
    ...options,
    roughness: 0.3,
    clearcoat: 0.6,
  }); // Cardiac vein: electric azure

  // ── 1. Left Ventricle & Apex (Anatomical conical heart body) ─────────────
  // Sculpted cone-ellipsoid pointing antero-inferiorly toward left side
  const lvGeo = new THREE.SphereGeometry(0.38, 64, 64);
  // Deform sphere to create anatomical cardiac apex taper
  const lvPos = lvGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < lvPos.count; i++) {
    const y = lvPos.getY(i);
    const x = lvPos.getX(i);
    const z = lvPos.getZ(i);
    // Taper toward apex at bottom (negative y)
    const taper = y < 0 ? Math.max(0.35, 1.0 + y * 1.6) : 1.0 - y * 0.25;
    lvPos.setXYZ(i, x * taper, y * 1.35, z * (taper * 0.9 + 0.1));
  }
  sculptOrganicTissue(lvGeo, 7.5, 0.018, 1.2);

  const lvMesh = new THREE.Mesh(lvGeo, lvMat);
  lvMesh.scale.set(len * 0.82, hei * 0.95, wid * 0.8);
  lvMesh.rotation.z = -0.28; // 16° anatomical cardiac tilt
  lvMesh.rotation.y = 0.18;
  lvMesh.position.set(-len * 0.06, -hei * 0.08, wid * 0.04);
  lvMesh.castShadow = true;
  lvMesh.receiveShadow = true;
  heart.add(lvMesh);

  // ── 2. Right Ventricle (Anterior crescent wrap) ───────────────────────────
  const rvGeo = new THREE.SphereGeometry(0.32, 56, 56);
  const rvPos = rvGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < rvPos.count; i++) {
    const y = rvPos.getY(i);
    const x = rvPos.getX(i);
    const z = rvPos.getZ(i);
    const taper = y < 0 ? Math.max(0.4, 1.0 + y * 1.2) : 1.0;
    rvPos.setXYZ(i, x * taper * 1.1, y * 1.1, z * taper * 0.85);
  }
  sculptOrganicTissue(rvGeo, 8.0, 0.015, 2.5);

  const rvMesh = new THREE.Mesh(rvGeo, rvMat);
  rvMesh.scale.set(len * 0.72, hei * 0.82, wid * 0.7);
  rvMesh.rotation.z = -0.15;
  rvMesh.position.set(len * 0.12, -hei * 0.05, wid * 0.18);
  rvMesh.castShadow = true;
  heart.add(rvMesh);

  // ── 3. Right Atrium & Auricle ────────────────────────────────────────────
  const raGeo = sculptOrganicTissue(new THREE.SphereGeometry(0.24, 48, 48), 6.0, 0.014, 3.2);
  const raMesh = new THREE.Mesh(raGeo, atriaMat);
  raMesh.scale.set(len * 0.65, hei * 0.58, wid * 0.6);
  raMesh.position.set(len * 0.28, hei * 0.18, wid * 0.02);
  heart.add(raMesh);

  // Right Auricle (pectinate appendage draping anteriorly)
  const rAuriclePoints = [
    new THREE.Vector3(len * 0.22, hei * 0.22, wid * 0.12),
    new THREE.Vector3(len * 0.16, hei * 0.18, wid * 0.26),
    new THREE.Vector3(len * 0.08, hei * 0.12, wid * 0.28),
  ];
  const rAuricle = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rAuriclePoints), 24, len * 0.055, 14, false),
    atriaMat
  );
  heart.add(rAuricle);

  // ── 4. Left Atrium & Auricle ─────────────────────────────────────────────
  const laGeo = sculptOrganicTissue(new THREE.SphereGeometry(0.23, 48, 48), 6.5, 0.014, 4.1);
  const laMesh = new THREE.Mesh(laGeo, atriaMat);
  laMesh.scale.set(len * 0.62, hei * 0.55, wid * 0.62);
  laMesh.position.set(-len * 0.15, hei * 0.22, -wid * 0.14);
  heart.add(laMesh);

  // Left Auricle (drapes over left side of pulmonary trunk)
  const lAuriclePoints = [
    new THREE.Vector3(-len * 0.18, hei * 0.24, -wid * 0.04),
    new THREE.Vector3(-len * 0.22, hei * 0.18, wid * 0.12),
    new THREE.Vector3(-len * 0.16, hei * 0.10, wid * 0.22),
  ];
  const lAuricle = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lAuriclePoints), 24, len * 0.048, 14, false),
    atriaMat
  );
  heart.add(lAuricle);

  // ── 5. Subepicardial Adipose Fat Deposits (Grooves) ───────────────────────
  // Anterior interventricular groove fat cushion
  const antSulcusFat = [
    new THREE.Vector3(0, hei * 0.18, wid * 0.32),
    new THREE.Vector3(-len * 0.04, hei * 0.04, wid * 0.36),
    new THREE.Vector3(-len * 0.08, -hei * 0.14, wid * 0.32),
    new THREE.Vector3(-len * 0.14, -hei * 0.32, wid * 0.24),
    new THREE.Vector3(-len * 0.20, -hei * 0.46, wid * 0.16),
  ];
  const fatTubeGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(antSulcusFat),
    32,
    len * 0.038,
    12,
    false
  );
  heart.add(new THREE.Mesh(fatTubeGeo, fatMat));

  // Atrioventricular (coronary) sulcus fat cushion
  const avSulcusFat = [
    new THREE.Vector3(len * 0.06, hei * 0.18, wid * 0.28),
    new THREE.Vector3(len * 0.22, hei * 0.12, wid * 0.18),
    new THREE.Vector3(len * 0.28, hei * 0.02, 0),
    new THREE.Vector3(len * 0.24, -hei * 0.08, -wid * 0.16),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(avSulcusFat), 28, len * 0.032, 10, false),
      fatMat
    )
  );

  // ── 6. Ascending Aorta & Classic Aortic Arch ──────────────────────────────
  const aortaPath = [
    new THREE.Vector3(-len * 0.02, hei * 0.16, wid * 0.04), // Root / Aortic Sinus
    new THREE.Vector3(0, hei * 0.32, wid * 0.06),          // Ascending Aorta
    new THREE.Vector3(len * 0.04, hei * 0.48, wid * 0.02), // Beginning of arch
    new THREE.Vector3(len * 0.06, hei * 0.58, -wid * 0.06), // Peak of arch
    new THREE.Vector3(0, hei * 0.54, -wid * 0.16),          // Left curvature
    new THREE.Vector3(-len * 0.06, hei * 0.38, -wid * 0.22), // Descending aorta
    new THREE.Vector3(-len * 0.08, hei * 0.12, -wid * 0.24), // Thoracic continuation
  ];
  const aortaMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(aortaPath), 48, len * 0.075, 24, false),
    aortaMat
  );
  aortaMesh.castShadow = true;
  heart.add(aortaMesh);

  // Aortic Bulb / Sinuses of Valsalva expansion
  const aorticBulb = new THREE.Mesh(
    new THREE.SphereGeometry(len * 0.09, 24, 24),
    aortaMat
  );
  aorticBulb.position.set(-len * 0.02, hei * 0.18, wid * 0.04);
  aorticBulb.scale.set(1.1, 0.9, 1.1);
  heart.add(aorticBulb);

  // ── 7. The Three Brachiocephalic Great Vessel Branches ──────────────────
  // 1. Brachiocephalic trunk (first & largest branch)
  const bctPoints = [
    new THREE.Vector3(len * 0.03, hei * 0.52, wid * 0.01),
    new THREE.Vector3(len * 0.08, hei * 0.68, wid * 0.03),
    new THREE.Vector3(len * 0.12, hei * 0.82, wid * 0.04),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bctPoints), 20, len * 0.028, 14, false),
      aortaMat
    )
  );

  // 2. Left Common Carotid Artery (middle branch)
  const lccPoints = [
    new THREE.Vector3(len * 0.04, hei * 0.56, -wid * 0.05),
    new THREE.Vector3(len * 0.02, hei * 0.72, -wid * 0.04),
    new THREE.Vector3(0, hei * 0.84, -wid * 0.03),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lccPoints), 20, len * 0.022, 12, false),
      aortaMat
    )
  );

  // 3. Left Subclavian Artery (third branch, lateral)
  const lscPoints = [
    new THREE.Vector3(len * 0.01, hei * 0.55, -wid * 0.11),
    new THREE.Vector3(-len * 0.04, hei * 0.70, -wid * 0.12),
    new THREE.Vector3(-len * 0.08, hei * 0.82, -wid * 0.13),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lscPoints), 20, len * 0.022, 12, false),
      aortaMat
    )
  );

  // ── 8. Pulmonary Trunk & Arteries (Crosses anterior to aorta) ────────────
  const ptPath = [
    new THREE.Vector3(-len * 0.06, hei * 0.12, wid * 0.22), // RV outflow tract
    new THREE.Vector3(-len * 0.10, hei * 0.28, wid * 0.20),
    new THREE.Vector3(-len * 0.12, hei * 0.42, wid * 0.12), // Bifurcation under arch
  ];
  const ptMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptPath), 28, len * 0.068, 20, false),
    pulmonaryMat
  );
  ptMesh.castShadow = true;
  heart.add(ptMesh);

  // Left Pulmonary Artery (courses posterior/leftward beneath aortic arch)
  const lpaPath = [
    new THREE.Vector3(-len * 0.12, hei * 0.42, wid * 0.12),
    new THREE.Vector3(-len * 0.24, hei * 0.44, wid * 0.04),
    new THREE.Vector3(-len * 0.36, hei * 0.40, -wid * 0.06),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lpaPath), 20, len * 0.038, 14, false),
      pulmonaryMat
    )
  );

  // Right Pulmonary Artery (courses rightward under aortic arch)
  const rpaPath = [
    new THREE.Vector3(-len * 0.12, hei * 0.42, wid * 0.12),
    new THREE.Vector3(0, hei * 0.45, 0),
    new THREE.Vector3(len * 0.18, hei * 0.42, -wid * 0.06),
    new THREE.Vector3(len * 0.32, hei * 0.38, -wid * 0.12),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rpaPath), 24, len * 0.038, 14, false),
      pulmonaryMat
    )
  );

  // Ligamentum Arteriosum (fibrous remnant connecting aortic arch to LPA)
  const ligPoints = [
    new THREE.Vector3(0, hei * 0.52, -wid * 0.08),
    new THREE.Vector3(-len * 0.08, hei * 0.46, wid * 0.04),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ligPoints), 8, len * 0.012, 8, false),
      fatMat
    )
  );

  // ── 9. Superior Vena Cava & Inferior Vena Cava ────────────────────────────
  // Superior Vena Cava
  const svcPath = [
    new THREE.Vector3(len * 0.26, hei * 0.72, -wid * 0.06),
    new THREE.Vector3(len * 0.26, hei * 0.45, -wid * 0.02),
    new THREE.Vector3(len * 0.24, hei * 0.24, wid * 0.02),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(svcPath), 24, len * 0.052, 16, false),
      vcavaMat
    )
  );

  // Inferior Vena Cava
  const ivcPath = [
    new THREE.Vector3(len * 0.22, -hei * 0.42, -wid * 0.08),
    new THREE.Vector3(len * 0.24, -hei * 0.16, -wid * 0.04),
    new THREE.Vector3(len * 0.24, hei * 0.06, 0),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ivcPath), 24, len * 0.048, 16, false),
      vcavaMat
    )
  );

  // ── 10. Left Anterior Descending (LAD) & Coronary Vasculature ─────────────
  // LAD artery descending along anterior sulcus toward apex
  const ladPath = [
    new THREE.Vector3(-len * 0.02, hei * 0.18, wid * 0.32),
    new THREE.Vector3(-len * 0.05, hei * 0.05, wid * 0.38),
    new THREE.Vector3(-len * 0.09, -hei * 0.12, wid * 0.34),
    new THREE.Vector3(-len * 0.14, -hei * 0.28, wid * 0.26),
    new THREE.Vector3(-len * 0.19, -hei * 0.44, wid * 0.17),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ladPath), 36, len * 0.016, 12, false),
      coronaryArteryMat
    )
  );

  // Diagonal Branch 1 (from LAD over LV anterior free wall)
  const d1Path = [
    new THREE.Vector3(-len * 0.06, hei * 0.02, wid * 0.36),
    new THREE.Vector3(-len * 0.14, -hei * 0.06, wid * 0.32),
    new THREE.Vector3(-len * 0.22, -hei * 0.16, wid * 0.22),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(d1Path), 20, len * 0.011, 10, false),
      coronaryArteryMat
    )
  );

  // Great Cardiac Vein (runs parallel to LAD)
  const gcvPath = [
    new THREE.Vector3(-len * 0.04, hei * 0.16, wid * 0.34),
    new THREE.Vector3(-len * 0.07, hei * 0.03, wid * 0.39),
    new THREE.Vector3(-len * 0.11, -hei * 0.14, wid * 0.35),
    new THREE.Vector3(-len * 0.16, -hei * 0.30, wid * 0.27),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gcvPath), 28, len * 0.013, 10, false),
      coronaryVeinMat
    )
  );

  // Right Coronary Artery (RCA) winding around right AV sulcus
  const rcaPath = [
    new THREE.Vector3(len * 0.04, hei * 0.16, wid * 0.26),
    new THREE.Vector3(len * 0.18, hei * 0.10, wid * 0.18),
    new THREE.Vector3(len * 0.26, -hei * 0.02, wid * 0.06),
    new THREE.Vector3(len * 0.26, -hei * 0.16, -wid * 0.08),
    new THREE.Vector3(len * 0.18, -hei * 0.32, -wid * 0.16),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rcaPath), 36, len * 0.015, 12, false),
      coronaryArteryMat
    )
  );

  // Marginal Branch of RCA
  const rcaMarginalPath = [
    new THREE.Vector3(len * 0.24, -hei * 0.04, wid * 0.10),
    new THREE.Vector3(len * 0.22, -hei * 0.20, wid * 0.14),
    new THREE.Vector3(len * 0.12, -hei * 0.36, wid * 0.16),
  ];
  heart.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rcaMarginalPath), 20, len * 0.011, 10, false),
      coronaryArteryMat
    )
  );

  // ── 11. Four Pulmonary Veins (entering Left Atrium posteriorly) ───────────
  const pvEntries: Array<{ p1: [number, number, number]; p2: [number, number, number] }> = [
    { p1: [-len * 0.28, hei * 0.30, -wid * 0.18], p2: [-len * 0.18, hei * 0.24, -wid * 0.16] }, // Left Superior
    { p1: [-len * 0.28, hei * 0.14, -wid * 0.20], p2: [-len * 0.18, hei * 0.16, -wid * 0.17] }, // Left Inferior
    { p1: [len * 0.02, hei * 0.30, -wid * 0.22], p2: [-len * 0.06, hei * 0.24, -wid * 0.18] },  // Right Superior
    { p1: [len * 0.02, hei * 0.14, -wid * 0.24], p2: [-len * 0.06, hei * 0.16, -wid * 0.19] },  // Right Inferior
  ];
  pvEntries.forEach(entry => {
    const pvCurve = new THREE.LineCurve3(
      new THREE.Vector3(...entry.p1),
      new THREE.Vector3(...entry.p2)
    );
    heart.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(pvCurve, 10, len * 0.028, 12, false),
        aortaMat // Oxygenated blood = arterial red
      )
    );
  });

  return heart;
}
