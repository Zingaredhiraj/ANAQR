import { OrganDimensions, OrganType } from './types';

/**
 * Clinically normalized adult dimensions (mm) for the 15 standard organs.
 */
export const DEFAULT_ORGAN_DIMENSIONS: Record<OrganType, OrganDimensions> = {
  heart: { lengthMm: 120, widthMm: 90, heightMm: 60 },
  lungs: { lengthMm: 180, widthMm: 240, heightMm: 280 }, // depth 180, width 240, height 280
  kidney: { lengthMm: 110, widthMm: 60, heightMm: 40 },
  liver: { lengthMm: 160, widthMm: 220, heightMm: 120 },
  brain: { lengthMm: 160, widthMm: 140, heightMm: 120 },
  stomach: { lengthMm: 250, widthMm: 120, heightMm: 80 },
  eye: { lengthMm: 40, widthMm: 24, heightMm: 24 }, // eye diameter 24mm, optic nerve 40mm
  large_intestine: { lengthMm: 150, widthMm: 200, heightMm: 300 }, // W 200, D 150, H 300
  small_intestine: { lengthMm: 160, widthMm: 180, heightMm: 100 },
  pancreas: { lengthMm: 150, widthMm: 40, heightMm: 25 },
  spleen: { lengthMm: 120, widthMm: 70, heightMm: 40 },
  bladder: { lengthMm: 100, widthMm: 80, heightMm: 70 },
  thyroid: { lengthMm: 50, widthMm: 60, heightMm: 20 },
  femur: { lengthMm: 450, widthMm: 80, heightMm: 80 },
  muscle: { lengthMm: 220, widthMm: 60, heightMm: 50 },
};

/**
 * Normalizes dimension input with fallbacks to clinical defaults.
 */
export function normalizeDimensions(
  organType: OrganType,
  partial?: Partial<OrganDimensions>
): OrganDimensions {
  const defaults = DEFAULT_ORGAN_DIMENSIONS[organType] ?? {
    lengthMm: 120,
    widthMm: 90,
    heightMm: 60,
  };

  return {
    lengthMm: Math.max(10, partial?.lengthMm ?? defaults.lengthMm),
    widthMm: Math.max(10, partial?.widthMm ?? defaults.widthMm),
    heightMm: Math.max(10, partial?.heightMm ?? defaults.heightMm),
  };
}

/**
 * Converts millimeters to normalized Three.js scene units (meters scale).
 */
export function mmToThreeUnits(mm: number, scaleFactor = 0.001): number {
  return mm * scaleFactor;
}
