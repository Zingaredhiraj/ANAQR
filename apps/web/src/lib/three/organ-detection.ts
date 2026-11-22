import { OrganDimensions, OrganType } from './types';
import { DEFAULT_ORGAN_DIMENSIONS, normalizeDimensions } from './dimension-normalizer';

interface OrganRule {
  keywords: string[];
  type: OrganType;
}

export const ORGAN_RULES: Record<OrganType, OrganRule> = {
  heart: {
    type: 'heart',
    keywords: [
      'heart',
      'cardiac',
      'cardiovascular',
      'myocardium',
      'aorta',
      'ventricle',
      'atrium',
      'coronary',
      'blood pump',
    ],
  },
  lungs: {
    type: 'lungs',
    keywords: [
      'lungs',
      'lung',
      'respiratory',
      'pulmonary',
      'breathing',
      'bronchi',
      'trachea',
      'alveoli',
    ],
  },
  kidney: {
    type: 'kidney',
    keywords: [
      'kidney',
      'renal',
      'urinary',
      'nephron',
      'ureter',
      'adrenal',
      'suprarenal',
    ],
  },
  liver: {
    type: 'liver',
    keywords: [
      'liver',
      'hepatic',
      'hepatocyte',
      'gallbladder',
      'bile',
      'portal vein',
      'falciform',
    ],
  },
  brain: {
    type: 'brain',
    keywords: [
      'brain',
      'cerebral',
      'cerebrum',
      'cerebellum',
      'neural',
      'nervous',
      'frontal lobe',
      'brainstem',
      'pons',
    ],
  },
  stomach: {
    type: 'stomach',
    keywords: [
      'stomach',
      'gastric',
      'gastro',
      'fundus',
      'pylorus',
      'cardia',
      'chyme',
    ],
  },
  eye: {
    type: 'eye',
    keywords: [
      'eye',
      'eyeball',
      'ocular',
      'cornea',
      'retina',
      'optic nerve',
      'sclera',
      'iris',
      'pupil',
      'vision',
    ],
  },
  large_intestine: {
    type: 'large_intestine',
    keywords: [
      'large intestine',
      'colon',
      'cecum',
      'appendix',
      'sigmoid',
      'rectum',
      'colorectal',
      'bowel',
    ],
  },
  small_intestine: {
    type: 'small_intestine',
    keywords: [
      'small intestine',
      'duodenum',
      'jejunum',
      'ileum',
      'mesentery',
      'enteric',
    ],
  },
  pancreas: {
    type: 'pancreas',
    keywords: [
      'pancreas',
      'pancreatic',
      'islet',
      'insulin',
      'wirsung',
    ],
  },
  spleen: {
    type: 'spleen',
    keywords: [
      'spleen',
      'splenic',
      'lymphoid',
      'splenomegaly',
    ],
  },
  bladder: {
    type: 'bladder',
    keywords: [
      'bladder',
      'urinary bladder',
      'detrusor',
      'trigone',
      'vesical',
      'micturition',
    ],
  },
  thyroid: {
    type: 'thyroid',
    keywords: [
      'thyroid',
      'endocrine',
      'isthmus',
      'thyroxine',
      'goiter',
      'calcitonin',
    ],
  },
  femur: {
    type: 'femur',
    keywords: [
      'femur',
      'thigh bone',
      'femoral',
      'trochanter',
      'condyle',
      'bone',
      'skeletal',
    ],
  },
  muscle: {
    type: 'muscle',
    keywords: [
      'muscle',
      'biceps',
      'skeletal muscle',
      'muscular',
      'tendon',
      'myofibril',
      'brachii',
    ],
  },
};

export interface DetectedOrganResult {
  organType: OrganType;
  confidence: number;
  matchedKeywords: string[];
}

/**
 * Detects organ type from free-form clinical descriptions using keyword scoring.
 */
export function detectOrgan(description: string): DetectedOrganResult | null {
  if (!description || typeof description !== 'string') return null;

  const text = description.toLowerCase();

  const results = Object.values(ORGAN_RULES)
    .map((rule) => {
      const matches = rule.keywords.filter((kw) => text.includes(kw));
      return {
        organType: rule.type,
        confidence: matches.length,
        matchedKeywords: matches,
      };
    })
    .filter((res) => res.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  return results[0] ?? null;
}

/**
 * Extracts metric dimensions (length, width, height / depth / diameter) from clinical text.
 */
export function extractDimensions(
  description: string,
  fallbackType: OrganType = 'heart'
): OrganDimensions {
  if (!description || typeof description !== 'string') {
    return DEFAULT_ORGAN_DIMENSIONS[fallbackType];
  }

  const lengthMatch = description.match(
    /(?:length|depth|long)\s*(?:is|of|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(cm|mm)/i
  );
  const widthMatch = description.match(
    /(?:width|wide|transverse)\s*(?:is|of|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(cm|mm)/i
  );
  const heightMatch = description.match(
    /(?:height|high|thick|vertical)\s*(?:is|of|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(cm|mm)/i
  );
  const diameterMatch = description.match(
    /(?:diameter|diameter of|size)\s*(?:is|of|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(cm|mm)/i
  );

  const convertToMm = (val: string, unit: string) =>
    unit.toLowerCase() === 'cm' ? parseFloat(val) * 10 : parseFloat(val);

  const extracted: Partial<OrganDimensions> = {};

  if (lengthMatch) {
    extracted.lengthMm = convertToMm(lengthMatch[1], lengthMatch[2]);
  }
  if (widthMatch) {
    extracted.widthMm = convertToMm(widthMatch[1], widthMatch[2]);
  }
  if (heightMatch) {
    extracted.heightMm = convertToMm(heightMatch[1], heightMatch[2]);
  }

  // Handle spherical/eye cases where diameter applies to width and height
  if (diameterMatch && !widthMatch) {
    const diamMm = convertToMm(diameterMatch[1], diameterMatch[2]);
    extracted.widthMm = diamMm;
    extracted.heightMm = diamMm;
  }

  return normalizeDimensions(fallbackType, extracted);
}
