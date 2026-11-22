/**
 * AnatoScan AR – Prisma Seed Script
 * Seeds realistic development data:
 * - Anatomical systems (10)
 * - Organs (11 total, heart with full content)
 * - Faculty and admin users
 * - Heart: anatomy, disorders, learning modules, quiz, QR code
 */

import { PrismaClient, Role, ContentStatus, ModuleType, QuizDifficulty } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AnatoScan AR database seed...\n');

  // ── 1. Create Department ─────────────────────────────────────────────────
  const dept = await prisma.department.upsert({
    where: { name: 'Department of Anatomy' },
    update: {},
    create: {
      name: 'Department of Anatomy',
      code: 'ANAT',
      description: 'Department of Anatomy – Medical College',
    },
  });
  console.log('✅ Department created');

  // ── 2. Create Super Admin ────────────────────────────────────────────────
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@anatoscan.edu';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@AnatoScan2024!';
  const adminHash = await argon2.hash(adminPassword, { type: argon2.argon2id });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
      isEmailVerified: true,
      facultyProfile: {
        create: {
          firstName: 'Super',
          lastName: 'Admin',
          designation: 'Platform Administrator',
          departmentId: dept.id,
        },
      },
    },
  });
  console.log(`✅ Super Admin created: ${adminEmail}`);

  // ── 3. Create Sample Faculty ─────────────────────────────────────────────
  const facultyHash = await argon2.hash('Faculty@2024!', { type: argon2.argon2id });
  const faculty = await prisma.user.upsert({
    where: { email: 'dr.sharma@anatoscan.edu' },
    update: {},
    create: {
      email: 'dr.sharma@anatoscan.edu',
      passwordHash: facultyHash,
      role: Role.FACULTY,
      isActive: true,
      isEmailVerified: true,
      facultyProfile: {
        create: {
          firstName: 'Dr. Priya',
          lastName: 'Sharma',
          designation: 'Associate Professor',
          qualification: 'MBBS, MS (Anatomy)',
          specialization: 'Cardiovascular & Thoracic Anatomy',
          departmentId: dept.id,
          bio: 'Specialist in cardiovascular anatomy with 12 years of teaching experience.',
        },
      },
    },
  });
  console.log(`✅ Faculty created: dr.sharma@anatoscan.edu`);

  // ── 4. Create Sample Student ─────────────────────────────────────────────
  const studentHash = await argon2.hash('Student@2024!', { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { email: 'student@anatoscan.edu' },
    update: {},
    create: {
      email: 'student@anatoscan.edu',
      passwordHash: studentHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
      studentProfile: {
        create: {
          firstName: 'Rahul',
          lastName: 'Verma',
          studentId: 'MED2024001',
          batchYear: 2024,
          departmentId: dept.id,
        },
      },
    },
  });
  console.log(`✅ Student created: student@anatoscan.edu`);

  // ── 5. Create Anatomical Systems ─────────────────────────────────────────
  const systems = [
    { name: 'Cardiovascular System', slug: 'cardiovascular', color: '#EF4444', description: 'The heart and blood vessels that circulate blood throughout the body.' },
    { name: 'Respiratory System', slug: 'respiratory', color: '#3B82F6', description: 'Organs responsible for gas exchange including the lungs and airways.' },
    { name: 'Digestive System', slug: 'digestive', color: '#F97316', description: 'The gastrointestinal tract and accessory organs for digestion and absorption.' },
    { name: 'Nervous System', slug: 'nervous', color: '#8B5CF6', description: 'The brain, spinal cord and peripheral nerves that coordinate bodily functions.' },
    { name: 'Skeletal System', slug: 'skeletal', color: '#6B7280', description: 'Bones, cartilage, ligaments and joints that form the structural framework.' },
    { name: 'Muscular System', slug: 'muscular', color: '#DC2626', description: 'Skeletal, smooth and cardiac muscles enabling movement and function.' },
    { name: 'Urinary System', slug: 'urinary', color: '#D97706', description: 'Kidneys, ureters, bladder and urethra for filtration and excretion.' },
    { name: 'Reproductive System', slug: 'reproductive', color: '#EC4899', description: 'Organs involved in reproduction and sexual development.' },
    { name: 'Endocrine System', slug: 'endocrine', color: '#10B981', description: 'Glands that produce hormones regulating metabolism and homeostasis.' },
    { name: 'Integumentary System', slug: 'integumentary', color: '#92400E', description: 'Skin, hair, nails and glands forming the external protective covering.' },
  ];

  const createdSystems: Record<string, string> = {};
  for (const sys of systems) {
    const created = await prisma.anatomicalSystem.upsert({
      where: { slug: sys.slug },
      update: {},
      create: { ...sys, departmentId: dept.id },
    });
    createdSystems[sys.slug] = created.id;
  }
  console.log(`✅ 10 Anatomical Systems created`);

  // ── 6. Create Heart Organ (Primary Demo) ─────────────────────────────────
  const heartSlug = 'heart';
  const heart = await prisma.organ.upsert({
    where: { slug: heartSlug },
    update: {},
    create: {
      name: 'Heart',
      slug: heartSlug,
      scientificName: 'Cor',
      latinName: 'Cor',
      systemId: createdSystems['cardiovascular'],
      description: `The human heart is a muscular organ approximately the size of a fist, located in the mediastinum. It functions as a dual pump, driving blood through the pulmonary and systemic circulations to deliver oxygen and nutrients to all body tissues.`,
      location: 'Middle mediastinum, pericardial sac. Lies obliquely, with the base directed superiorly and the apex directed inferiorly and to the left.',
      status: ContentStatus.APPROVED,
      isPublished: true,
      publishedAt: new Date(),
      tags: ['cardiovascular', 'mediastinum', 'pump', 'circulation'],
      content: {
        create: {
          externalStructure: `The heart is enclosed within the pericardial sac. It has a base (posterior surface), an apex (directed left and downward), and four surfaces: sternocostal (anterior), diaphragmatic (inferior), and two pulmonary surfaces. The coronary sulcus encircles the heart separating the atria from the ventricles. The anterior and posterior interventricular sulci mark the position of the interventricular septum.`,
          internalStructure: `The heart has four chambers: two atria (right and left) and two ventricles (right and left). The atria receive blood and the ventricles pump blood out of the heart. The right side handles deoxygenated blood (pulmonary circulation) and the left side handles oxygenated blood (systemic circulation).`,
          chambers: `**Right Atrium:** Receives deoxygenated blood from the superior and inferior venae cavae and the coronary sinus. Contains the sinoatrial (SA) node. The wall is thin and trabeculated.

**Left Atrium:** Receives oxygenated blood from the four pulmonary veins. Has the thickest walls among the atria. The left atrial appendage extends anteriorly.

**Right Ventricle:** Pumps deoxygenated blood into the pulmonary trunk. Has the thinnest ventricular wall (approximately 3-5mm). Features trabeculae carneae and papillary muscles.

**Left Ventricle:** Pumps oxygenated blood into the aorta. Has the thickest wall (approximately 8-12mm) due to high systemic resistance. Contains the anterior and posterior papillary muscles.`,
          valves: `**Tricuspid Valve (Right AV Valve):** Located between the right atrium and right ventricle. Has three cusps: anterior, posterior, and septal. Prevents regurgitation into the right atrium during ventricular systole.

**Pulmonary Valve (Pulmonary Semilunar):** Located at the junction of the right ventricle and pulmonary trunk. Has three semilunar cusps. Prevents backflow from the pulmonary artery.

**Mitral Valve (Bicuspid/Left AV Valve):** Located between the left atrium and left ventricle. Has two cusps: anterior and posterior. The most commonly affected valve in rheumatic heart disease.

**Aortic Valve (Aortic Semilunar):** Located at the junction of the left ventricle and aorta. Has three semilunar cusps: right, left, and posterior (non-coronary). The right and left coronary arteries arise from the corresponding aortic sinuses.`,
          bloodSupply: `**Right Coronary Artery (RCA):** Arises from the right aortic sinus. Supplies the right atrium, right ventricle, sinoatrial node (in 60% of cases), atrioventricular node (in 80% of cases), posterior third of interventricular septum (in right dominant hearts), and inferior portion of the left ventricle. Major branches: Sinoatrial nodal artery, Right marginal artery, Posterior interventricular (posterior descending) artery.

**Left Coronary Artery (LCA):** Arises from the left aortic sinus. Divides into the Left Anterior Descending (LAD) and Circumflex arteries. Supplies the left atrium, most of the left ventricle, anterior two-thirds of the interventricular septum, and sinoatrial node (in 40% of cases). The LAD is the most commonly occluded artery in coronary artery disease.

**Venous Drainage:** The coronary sinus (a wide venous channel in the coronary sulcus) drains most cardiac veins into the right atrium. The great cardiac vein accompanies the LAD. The middle cardiac vein accompanies the posterior interventricular artery.`,
          nerveSupply: `**Sympathetic:** Accelerates heart rate, increases contractility and conduction velocity. Preganglionic fibers from T1-T5. Postganglionic fibers via superior, middle, and inferior cardiac nerves.

**Parasympathetic:** Slows heart rate, decreases contractility. Via the vagus nerve (CN X). The right vagus primarily innervates the SA node; the left vagus primarily innervates the AV node.

**Intrinsic Conduction System:** SA Node (pacemaker, in right atrium near SVC) → AV Node (in interatrial septum) → Bundle of His → Right and Left Bundle Branches → Purkinje Fibers.`,
          normalFunctioning: `The heart generates approximately 60-100 beats per minute at rest, pumping approximately 4.7-5.5 liters of blood per minute (cardiac output). The cardiac cycle consists of systole (ventricular contraction) and diastole (ventricular relaxation). During systole, the ventricles contract and blood is ejected into the aorta and pulmonary trunk. The ejection fraction (EF) in a normal heart is 55-70%.`,
          clinicalCorrelation: `**ECG (Electrocardiogram):** Records the electrical activity of the heart. P wave = atrial depolarization; QRS complex = ventricular depolarization; T wave = ventricular repolarization.

**Echocardiography:** Ultrasound-based imaging of cardiac structure and function. Assesses wall motion, valve morphology, chamber dimensions, and ejection fraction.

**Cardiac Auscultation:** S1 (mitral and tricuspid valve closure) and S2 (aortic and pulmonary valve closure) are normal heart sounds. Murmurs may indicate valvular pathology.`,
          diagnosticMethods: `Electrocardiography (ECG/EKG), Echocardiography (TTE/TEE), Cardiac MRI, CT Coronary Angiography, Coronary Angiography (Gold standard for CAD), Stress testing, Nuclear cardiology (SPECT/PET), Chest X-ray.`,
        },
      },
    },
  });
  console.log(`✅ Heart organ created`);

  // ── 7. Heart Anatomical Structures ───────────────────────────────────────
  const heartStructures = [
    { name: 'Right Atrium', description: 'Upper right chamber receiving deoxygenated blood from systemic veins.', function: 'Receives blood from superior and inferior venae cavae and coronary sinus.', meshName: 'right_atrium', orderIndex: 0 },
    { name: 'Left Atrium', description: 'Upper left chamber receiving oxygenated blood from pulmonary veins.', function: 'Receives oxygenated blood from four pulmonary veins.', meshName: 'left_atrium', orderIndex: 1 },
    { name: 'Right Ventricle', description: 'Lower right chamber pumping blood to the lungs.', function: 'Pumps deoxygenated blood into the pulmonary trunk.', meshName: 'right_ventricle', orderIndex: 2 },
    { name: 'Left Ventricle', description: 'Lower left chamber with the thickest wall, pumping blood to the body.', function: 'Pumps oxygenated blood into the aorta for systemic circulation.', meshName: 'left_ventricle', orderIndex: 3 },
    { name: 'Mitral Valve', description: 'Bicuspid valve between the left atrium and left ventricle.', function: 'Prevents backflow of blood from left ventricle to left atrium during systole.', meshName: 'mitral_valve', orderIndex: 4 },
    { name: 'Aortic Valve', description: 'Semilunar valve between the left ventricle and aorta.', function: 'Prevents backflow of blood from aorta to left ventricle during diastole.', meshName: 'aortic_valve', orderIndex: 5 },
    { name: 'Aorta', description: 'The largest artery in the body, arising from the left ventricle.', function: 'Carries oxygenated blood from the left ventricle to the systemic circulation.', meshName: 'aorta', orderIndex: 6 },
    { name: 'Pulmonary Trunk', description: 'Large artery arising from the right ventricle.', function: 'Carries deoxygenated blood to the left and right pulmonary arteries.', meshName: 'pulmonary_trunk', orderIndex: 7 },
  ];

  for (const structure of heartStructures) {
    await prisma.anatomicalStructure.upsert({
      where: { id: `heart-struct-${structure.orderIndex}` },
      update: {},
      create: { ...structure, organId: heart.id, id: `heart-struct-${structure.orderIndex}` },
    });
  }
  console.log(`✅ Heart anatomical structures created`);

  // ── 8. Heart Disorders ────────────────────────────────────────────────────
  await prisma.disorder.createMany({
    skipDuplicates: true,
    data: [
      {
        organId: heart.id,
        name: 'Aortic Stenosis',
        description: 'Narrowing of the aortic valve opening, restricting blood flow from the left ventricle into the aorta.',
        causes: 'Progressive calcification and fibrosis of the aortic valve cusps (most common in elderly). Can also occur due to congenital bicuspid aortic valve or rheumatic fever.',
        symptoms: 'Chest pain (angina), syncope on exertion, dyspnea, reduced exercise tolerance. The classic triad is angina, syncope, and heart failure.',
        structuralEffect: 'The valve opening becomes progressively smaller (normally 2.6-3.5 cm²; severe stenosis < 1.0 cm²). Valve leaflets become thickened, calcified, and immobile.',
        functionalEffect: 'Increased afterload on the left ventricle leads to concentric hypertrophy. Reduced cardiac output, especially on exertion. Elevated left ventricular pressure.',
        status: ContentStatus.APPROVED,
        orderIndex: 0,
      },
      {
        organId: heart.id,
        name: 'Coronary Artery Disease (CAD)',
        description: 'Narrowing or blockage of coronary arteries due to atherosclerotic plaque, reducing blood supply to the myocardium.',
        causes: 'Atherosclerosis: build-up of cholesterol-rich plaques in coronary arteries. Risk factors include hypertension, hyperlipidemia, smoking, diabetes, obesity, and family history.',
        symptoms: 'Stable angina (exertional chest pain), unstable angina (rest pain), myocardial infarction (heart attack), sudden cardiac death.',
        structuralEffect: 'Plaque formation in the intima of coronary arteries reduces vessel lumen. Plaque rupture triggers thrombus formation, potentially causing complete vessel occlusion.',
        functionalEffect: 'Myocardial ischemia impairs contractility. Infarction causes permanent myocardial necrosis. Affects regional wall motion and overall cardiac function.',
        status: ContentStatus.APPROVED,
        orderIndex: 1,
      },
    ],
  });
  console.log(`✅ Heart disorders created`);

  // ── 9. Heart Learning Modules ─────────────────────────────────────────────
  // Module 1: Normal Working
  const module1 = await prisma.learningModule.upsert({
    where: { organId_type: { organId: heart.id, type: ModuleType.NORMAL_WORKING } },
    update: {},
    create: {
      organId: heart.id,
      type: ModuleType.NORMAL_WORKING,
      title: 'Normal Heart Function',
      description: 'Understand how the healthy human heart pumps blood through the pulmonary and systemic circulations.',
      status: ContentStatus.APPROVED,
      estimatedMinutes: 15,
      sections: {
        create: [
          {
            title: 'Introduction to the Heart',
            content: `# The Human Heart\n\nThe heart is a remarkable muscular organ that beats approximately **2.5 billion times** in a 70-year lifespan without stopping for maintenance. It is the central pump of the cardiovascular system, maintaining circulation to every cell in the body.\n\n## Key Facts\n- Size: Approximately the size of your fist\n- Weight: 250-350 grams (adult)\n- Location: Middle mediastinum\n- Output at rest: ~5 liters per minute\n- Beats per minute at rest: 60-100`,
            contentType: 'markdown',
            orderIndex: 0,
          },
          {
            title: 'The Four Chambers',
            content: `# Four Chambers of the Heart\n\nThe heart has four distinct chambers that work in a coordinated sequence:\n\n## Right Side (Pulmonary)\n- **Right Atrium** → receives deoxygenated blood from the body\n- **Right Ventricle** → pumps blood to the lungs\n\n## Left Side (Systemic)\n- **Left Atrium** → receives oxygenated blood from the lungs\n- **Left Ventricle** → pumps oxygenated blood to the entire body\n\n> The left ventricular wall is 2-3× thicker than the right, reflecting the greater pressure required to pump blood through the systemic circulation.`,
            contentType: 'markdown',
            orderIndex: 1,
          },
          {
            title: 'Blood Flow Through the Heart',
            content: `# Complete Blood Flow Pathway\n\n## Systemic to Pulmonary:\n\`\`\`\nBody (deoxygenated blood)\n    ↓\nSuperior & Inferior Vena Cava\n    ↓\nRight Atrium\n    ↓ (through Tricuspid Valve)\nRight Ventricle\n    ↓ (through Pulmonary Valve)\nPulmonary Trunk → Left & Right Pulmonary Arteries\n    ↓\nLungs (gas exchange: CO₂ out, O₂ in)\n    ↓\nFour Pulmonary Veins\n    ↓\nLeft Atrium\n    ↓ (through Mitral Valve)\nLeft Ventricle\n    ↓ (through Aortic Valve)\nAorta → Systemic Circulation\n    ↓\nBody (oxygen delivered)\n\`\`\`\n\nThis completes one complete circuit of blood flow.`,
            contentType: 'markdown',
            orderIndex: 2,
          },
          {
            title: 'Cardiac Cycle',
            content: `# The Cardiac Cycle\n\nThe cardiac cycle is the sequence of events occurring in one heartbeat.\n\n## Systole (Contraction Phase)\nDuration: ~0.3 seconds at rest\n- Ventricular pressure rises above atrial pressure → AV valves close → S1 sound\n- Ventricular pressure rises above aortic/pulmonary pressure → Semilunar valves open\n- Blood is ejected into the aorta and pulmonary trunk\n\n## Diastole (Relaxation Phase)\nDuration: ~0.5 seconds at rest\n- Ventricular pressure falls below aortic/pulmonary pressure → Semilunar valves close → S2 sound\n- Ventricles relax and fill with blood from atria\n- AV valves open as ventricular pressure falls below atrial pressure\n\n## Heart Sounds\n- **S1 (lub):** AV valve closure at the start of systole\n- **S2 (dub):** Semilunar valve closure at the end of systole`,
            contentType: 'markdown',
            orderIndex: 3,
          },
        ],
      },
    },
  });

  // Module 2: What Goes Wrong
  const module2 = await prisma.learningModule.upsert({
    where: { organId_type: { organId: heart.id, type: ModuleType.WHAT_GOES_WRONG } },
    update: {},
    create: {
      organId: heart.id,
      type: ModuleType.WHAT_GOES_WRONG,
      title: 'Heart Disorders',
      description: 'Explore common cardiac abnormalities including aortic stenosis and coronary artery disease.',
      status: ContentStatus.APPROVED,
      estimatedMinutes: 20,
      sections: {
        create: [
          {
            title: 'Aortic Stenosis',
            content: `# Aortic Stenosis\n\n## Normal vs. Stenotic Valve\n\n**Normal Aortic Valve:**\n- Three flexible, thin cusps\n- Opening area: 2.6-3.5 cm²\n- Opens widely during systole\n- Blood flows freely into the aorta\n\n**Stenotic Aortic Valve:**\n- Thickened, calcified, fused cusps\n- Opening area: Severe stenosis < 1.0 cm²\n- Restricted opening during systole\n- Increased pressure gradient across the valve\n\n## Mechanism\nCalcification → restricted valve opening → increased left ventricular afterload → compensatory left ventricular hypertrophy → eventually decompensated heart failure\n\n## Classic Symptoms Triad\n1. **Angina** – reduced coronary flow during exertion\n2. **Syncope** – inadequate cardiac output on exertion\n3. **Heart failure** – dyspnea, orthopnea\n\n> ⚠️ This information is for educational purposes only. Diagnosis and treatment require qualified medical professionals.`,
            contentType: 'markdown',
            orderIndex: 0,
          },
          {
            title: 'Coronary Artery Disease',
            content: `# Coronary Artery Disease (CAD)\n\n## The Atherosclerotic Process\n\n1. **Endothelial injury** from risk factors (hypertension, smoking, dyslipidemia)\n2. **Lipid accumulation** – LDL cholesterol deposits in arterial intima\n3. **Inflammatory response** – macrophages form foam cells\n4. **Plaque formation** – fibrous cap over lipid core\n5. **Plaque rupture** – triggers platelet aggregation and thrombosis\n6. **Vessel occlusion** – myocardial infarction\n\n## Which Artery?\n- **LAD (Left Anterior Descending)** – Most commonly occluded, supplies anterior wall of LV\n- **RCA (Right Coronary Artery)** – Supplies right ventricle and inferior wall\n- **LCX (Left Circumflex)** – Supplies lateral wall of LV\n\n## Myocardial Infarction\nComplete occlusion → myocardial necrosis → reduced ventricular function → possible complications (arrhythmia, heart failure, rupture)`,
            contentType: 'markdown',
            orderIndex: 1,
          },
        ],
      },
    },
  });

  // Module 3: How it is Measured
  const module3 = await prisma.learningModule.upsert({
    where: { organId_type: { organId: heart.id, type: ModuleType.HOW_IT_IS_MEASURED } },
    update: {},
    create: {
      organId: heart.id,
      type: ModuleType.HOW_IT_IS_MEASURED,
      title: 'Cardiac Diagnostics',
      description: 'Learn how the heart is measured and assessed using ECG, echocardiography, and other diagnostic tools.',
      status: ContentStatus.APPROVED,
      estimatedMinutes: 20,
      sections: {
        create: [
          {
            title: 'Electrocardiogram (ECG)',
            content: `# Electrocardiogram (ECG / EKG)\n\n## What It Measures\nThe ECG records the electrical activity of the heart from the body surface using electrodes.\n\n## How It Works\n- **Electrodes** placed on the limbs and chest detect tiny electrical voltages\n- **12-lead ECG** provides 12 different views of cardiac electrical activity\n- Electrical impulses in the heart cause depolarization and repolarization of myocytes\n\n## ECG Components\n| Wave | Represents |\n|------|------------|\n| P wave | Atrial depolarization |\n| PR interval | AV conduction time |\n| QRS complex | Ventricular depolarization |\n| ST segment | Ventricular repolarization (early) |\n| T wave | Ventricular repolarization |\n| QT interval | Total ventricular electrical activity |\n\n## Clinical Applications\n- Detect arrhythmias (AF, VT, heart block)\n- Identify myocardial ischemia/infarction (ST changes)\n- Assess chamber hypertrophy\n- Monitor drug effects\n\n> Normal resting heart rate on ECG: 60-100 bpm. P wave before every QRS indicates normal sinus rhythm.`,
            contentType: 'markdown',
            orderIndex: 0,
          },
          {
            title: 'Echocardiography',
            content: `# Echocardiography\n\n## What It Measures\nEchocardiography uses high-frequency ultrasound waves to create real-time images of the heart's structure and function.\n\n## Types\n- **Transthoracic Echo (TTE):** Standard echocardiogram via chest wall probe\n- **Transesophageal Echo (TEE):** Probe in esophagus for clearer images, particularly of posterior structures\n- **Stress Echo:** Assessment during exercise or pharmacological stress\n- **3D Echo:** Three-dimensional reconstruction of cardiac structures\n\n## Parameters Measured\n| Parameter | Normal Value |\n|-----------|-------------|\n| Ejection Fraction (EF) | 55-70% |\n| Left Ventricular End Diastolic Diameter | 3.5-5.5 cm |\n| Left Atrial Diameter | 2.6-4.0 cm |\n| Interventricular Septum Thickness | 0.6-1.1 cm |\n| Aortic Root Diameter | 2.1-3.4 cm |\n\n## Valve Assessment\n- Valve morphology (thickening, calcification, vegetations)\n- Regurgitation (backward flow): color Doppler\n- Stenosis: gradient across valve measured by Doppler\n\n## Aortic Stenosis on Echo\n- Mean gradient across aortic valve > 40 mmHg = severe\n- Valve area < 1.0 cm² = severe\n- Heavily calcified, immobile cusps visualized`,
            contentType: 'markdown',
            orderIndex: 1,
          },
          {
            title: 'Other Cardiac Investigations',
            content: `# Other Cardiac Diagnostic Technologies\n\n## Cardiac Biomarkers\n- **Troponin (I and T):** Released from damaged myocardium. Gold standard for MI diagnosis. Rises 3-4 hours post-infarction, peaks at 12-24 hours.\n- **CK-MB:** Cardiac-specific creatine kinase. Rises 4-6 hours post-MI.\n- **BNP / NT-proBNP:** Released in response to increased ventricular wall stress. Marker of heart failure.\n\n## Cardiac MRI\n- Excellent soft tissue contrast\n- Assessment of myocardial viability, fibrosis (late gadolinium enhancement)\n- Accurate volumetric measurements\n- Assessment of cardiomyopathies\n\n## CT Coronary Angiography\n- Non-invasive assessment of coronary arteries\n- Calcium scoring (Agatston score) for atherosclerotic burden\n- Visualization of coronary anatomy and stenoses\n\n## Invasive Coronary Angiography\n- Gold standard for coronary artery disease assessment\n- Catheter inserted via femoral or radial artery\n- Contrast injection into coronary ostia under fluoroscopy\n- Allows concurrent percutaneous coronary intervention (PCI)\n\n> All procedures have specific indications, contraindications and risks assessed by qualified clinicians.`,
            contentType: 'markdown',
            orderIndex: 2,
          },
        ],
      },
    },
  });
  console.log(`✅ Heart learning modules created`);

  // ── 10. Heart Quiz ────────────────────────────────────────────────────────
  const quiz = await prisma.quiz.create({
    data: {
      organId: heart.id,
      title: 'Heart Anatomy & Physiology Quiz',
      description: 'Test your knowledge of cardiac anatomy, physiology, and common disorders.',
      difficulty: QuizDifficulty.MEDIUM,
      passingScore: 60,
      status: ContentStatus.APPROVED,
      isPublished: true,
      questions: {
        create: [
          {
            questionText: 'Which valve lies between the left atrium and left ventricle?',
            explanation: 'The mitral (bicuspid) valve lies between the left atrium and left ventricle. It has two cusps and prevents regurgitation during ventricular systole.',
            marks: 1,
            orderIndex: 0,
            options: {
              create: [
                { optionText: 'Tricuspid valve', isCorrect: false, orderIndex: 0 },
                { optionText: 'Mitral valve', isCorrect: true, orderIndex: 1 },
                { optionText: 'Aortic valve', isCorrect: false, orderIndex: 2 },
                { optionText: 'Pulmonary valve', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            questionText: 'The sinoatrial (SA) node is primarily located in which cardiac structure?',
            explanation: 'The SA node is located in the superior part of the right atrium, near the opening of the superior vena cava. It is the primary pacemaker of the heart.',
            marks: 1,
            orderIndex: 1,
            options: {
              create: [
                { optionText: 'Left atrium', isCorrect: false, orderIndex: 0 },
                { optionText: 'Right ventricle', isCorrect: false, orderIndex: 1 },
                { optionText: 'Right atrium', isCorrect: true, orderIndex: 2 },
                { optionText: 'AV node', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            questionText: 'Which coronary artery is most commonly occluded in myocardial infarction?',
            explanation: 'The Left Anterior Descending (LAD) artery is most commonly occluded, supplying the anterior wall of the left ventricle. It is sometimes called the "widow maker."',
            marks: 1,
            orderIndex: 2,
            options: {
              create: [
                { optionText: 'Right Coronary Artery', isCorrect: false, orderIndex: 0 },
                { optionText: 'Left Circumflex Artery', isCorrect: false, orderIndex: 1 },
                { optionText: 'Left Anterior Descending Artery', isCorrect: true, orderIndex: 2 },
                { optionText: 'Posterior Interventricular Artery', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            questionText: 'The QRS complex on an ECG represents:',
            explanation: 'The QRS complex represents ventricular depolarization – the electrical activation that causes ventricular muscle contraction (systole).',
            marks: 1,
            orderIndex: 3,
            options: {
              create: [
                { optionText: 'Atrial depolarization', isCorrect: false, orderIndex: 0 },
                { optionText: 'Ventricular repolarization', isCorrect: false, orderIndex: 1 },
                { optionText: 'Ventricular depolarization', isCorrect: true, orderIndex: 2 },
                { optionText: 'AV nodal conduction', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            questionText: 'Normal ejection fraction (EF) range is:',
            explanation: 'Normal ejection fraction is 55-70%. EF < 40% indicates significant systolic dysfunction (heart failure with reduced ejection fraction).',
            marks: 1,
            orderIndex: 4,
            options: {
              create: [
                { optionText: '20-40%', isCorrect: false, orderIndex: 0 },
                { optionText: '40-55%', isCorrect: false, orderIndex: 1 },
                { optionText: '55-70%', isCorrect: true, orderIndex: 2 },
                { optionText: '75-90%', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Heart quiz created with 5 questions`);

  // ── 11. QR Code for Heart ─────────────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  await prisma.qRCode.upsert({
    where: { code: `QR-HEART-001` },
    update: {},
    create: {
      organId: heart.id,
      code: 'QR-HEART-001',
      url: `${appUrl}/o/heart`,
      isActive: true,
    },
  });
  console.log(`✅ Heart QR code created → ${appUrl}/o/heart`);

  // ── 12. Sample Feedback ────────────────────────────────────────────────────
  await prisma.feedback.createMany({
    skipDuplicates: true,
    data: [
      {
        organId: heart.id,
        overallRating: 5,
        contentClarity: 5,
        educationalUsefulness: 5,
        accuracyRating: 5,
        confidenceLevel: 8,
        comment: 'Excellent explanation of cardiac anatomy. The blood flow diagram is very clear.',
        isAnonymous: true,
      },
      {
        organId: heart.id,
        overallRating: 4,
        contentClarity: 4,
        educationalUsefulness: 5,
        accuracyRating: 4,
        confidenceLevel: 7,
        comment: 'Very helpful for understanding the valves. Would love more diagrams.',
        isAnonymous: true,
      },
    ],
  });
  console.log(`✅ Sample feedback created`);

  // ── 13. Other Stub Organs ────────────────────────────────────────────────
  const stubOrgans = [
    { name: 'Brain', slug: 'brain', scientificName: 'Encephalon', latinName: 'Encephalon', systemSlug: 'nervous', description: 'The brain is the most complex organ in the body, controlling all bodily functions and higher cognitive processes.' },
    { name: 'Lungs', slug: 'lungs', scientificName: 'Pulmones', latinName: 'Pulmones', systemSlug: 'respiratory', description: 'The paired lungs are the primary organs of respiration, enabling gas exchange between air and blood.' },
    { name: 'Liver', slug: 'liver', scientificName: 'Hepar', latinName: 'Hepar', systemSlug: 'digestive', description: 'The largest internal organ, performing over 500 functions including metabolism, detoxification, and protein synthesis.' },
    { name: 'Kidney', slug: 'kidney', scientificName: 'Ren', latinName: 'Ren', systemSlug: 'urinary', description: 'The paired kidneys filter blood, regulate fluid balance, and produce urine.' },
    { name: 'Stomach', slug: 'stomach', scientificName: 'Gaster', latinName: 'Gaster', systemSlug: 'digestive', description: 'A muscular organ that receives food from the esophagus and begins chemical and mechanical digestion.' },
    { name: 'Pancreas', slug: 'pancreas', scientificName: 'Pancreas', latinName: 'Pancreas', systemSlug: 'digestive', description: 'A dual-function gland with exocrine (digestive enzymes) and endocrine (insulin, glucagon) functions.' },
    { name: 'Spleen', slug: 'spleen', scientificName: 'Lien', latinName: 'Lien', systemSlug: 'cardiovascular', description: 'The largest lymphoid organ, involved in blood filtration, immune response, and red blood cell storage.' },
    { name: 'Eye', slug: 'eye', scientificName: 'Oculus', latinName: 'Oculus', systemSlug: 'nervous', description: 'The organ of vision, converting light into neural signals interpreted by the visual cortex.' },
    { name: 'Ear', slug: 'ear', scientificName: 'Auris', latinName: 'Auris', systemSlug: 'nervous', description: 'The organ of hearing and balance, comprising the external, middle, and inner ear.' },
  ];

  for (const organ of stubOrgans) {
    await prisma.organ.upsert({
      where: { slug: organ.slug },
      update: {},
      create: {
        name: organ.name,
        slug: organ.slug,
        scientificName: organ.scientificName,
        latinName: organ.latinName,
        systemId: createdSystems[organ.systemSlug],
        description: organ.description,
        status: ContentStatus.DRAFT,
        isPublished: false,
        content: { create: {} },
      },
    });
  }
  console.log(`✅ 9 stub organs created (DRAFT status – awaiting faculty content)`);

  // ── 14. Assign Heart to Faculty ───────────────────────────────────────────
  const facultyProfile = await prisma.facultyProfile.findUnique({
    where: { userId: faculty.id },
  });
  if (facultyProfile) {
    await prisma.organAssignment.upsert({
      where: { organId_facultyProfileId: { organId: heart.id, facultyProfileId: facultyProfile.id } },
      update: {},
      create: {
        organId: heart.id,
        facultyProfileId: facultyProfile.id,
        canEdit: true,
        canPublish: false,
      },
    });
  }
  console.log(`✅ Heart assigned to Dr. Priya Sharma`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!\n');
  console.log('='.repeat(50));
  console.log('Demo Credentials:');
  console.log(`  Super Admin : ${adminEmail} / ${adminPassword}`);
  console.log(`  Faculty     : dr.sharma@anatoscan.edu / Faculty@2024!`);
  console.log(`  Student     : student@anatoscan.edu / Student@2024!`);
  console.log('='.repeat(50));
  console.log(`\n🔗 Test QR route: ${appUrl}/o/heart\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
