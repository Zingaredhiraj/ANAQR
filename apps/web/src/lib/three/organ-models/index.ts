import { OrganGeneratorFn, OrganType, AnatomicalHotspot } from '../types';
import { createHeartModel, HEART_HOTSPOTS } from './heart';
import { createLungsModel, LUNGS_HOTSPOTS } from './lungs';
import { createKidneyModel, KIDNEY_HOTSPOTS } from './kidney';
import { createLiverModel, LIVER_HOTSPOTS } from './liver';
import { createBrainModel, BRAIN_HOTSPOTS } from './brain';
import { createStomachModel, STOMACH_HOTSPOTS } from './stomach';
import { createEyeModel, EYE_HOTSPOTS } from './eye';
import { createLargeIntestineModel, LARGE_INTESTINE_HOTSPOTS } from './large-intestine';
import { createSmallIntestineModel, SMALL_INTESTINE_HOTSPOTS } from './small-intestine';
import { createPancreasModel, PANCREAS_HOTSPOTS } from './pancreas';
import { createSpleenModel, SPLEEN_HOTSPOTS } from './spleen';
import { createBladderModel, BLADDER_HOTSPOTS } from './bladder';
import { createThyroidModel, THYROID_HOTSPOTS } from './thyroid';
import { createFemurModel, FEMUR_HOTSPOTS } from './femur';
import { createMuscleModel, MUSCLE_HOTSPOTS } from './muscle';

export const ORGAN_GENERATORS: Record<OrganType, OrganGeneratorFn> = {
  heart: createHeartModel,
  lungs: createLungsModel,
  kidney: createKidneyModel,
  liver: createLiverModel,
  brain: createBrainModel,
  stomach: createStomachModel,
  eye: createEyeModel,
  large_intestine: createLargeIntestineModel,
  small_intestine: createSmallIntestineModel,
  pancreas: createPancreasModel,
  spleen: createSpleenModel,
  bladder: createBladderModel,
  thyroid: createThyroidModel,
  femur: createFemurModel,
  muscle: createMuscleModel,
};

export const ORGAN_HOTSPOTS: Record<OrganType, AnatomicalHotspot[]> = {
  heart: HEART_HOTSPOTS,
  lungs: LUNGS_HOTSPOTS,
  kidney: KIDNEY_HOTSPOTS,
  liver: LIVER_HOTSPOTS,
  brain: BRAIN_HOTSPOTS,
  stomach: STOMACH_HOTSPOTS,
  eye: EYE_HOTSPOTS,
  large_intestine: LARGE_INTESTINE_HOTSPOTS,
  small_intestine: SMALL_INTESTINE_HOTSPOTS,
  pancreas: PANCREAS_HOTSPOTS,
  spleen: SPLEEN_HOTSPOTS,
  bladder: BLADDER_HOTSPOTS,
  thyroid: THYROID_HOTSPOTS,
  femur: FEMUR_HOTSPOTS,
  muscle: MUSCLE_HOTSPOTS,
};

export function getProceduralOrganGenerator(type: string): OrganGeneratorFn | null {
  const normalized = type.toLowerCase().replace(/[-\s]/g, '_') as OrganType;
  return ORGAN_GENERATORS[normalized] ?? null;
}

export function getOrganHotspots(type: string): AnatomicalHotspot[] {
  const normalized = type.toLowerCase().replace(/[-\s]/g, '_') as OrganType;
  return ORGAN_HOTSPOTS[normalized] ?? [];
}
