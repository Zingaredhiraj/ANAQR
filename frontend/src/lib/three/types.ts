import * as THREE from 'three';

export type OrganType =
  | 'heart'
  | 'lungs'
  | 'kidney'
  | 'liver'
  | 'brain'
  | 'stomach'
  | 'eye'
  | 'large_intestine'
  | 'small_intestine'
  | 'pancreas'
  | 'spleen'
  | 'bladder'
  | 'thyroid'
  | 'femur'
  | 'muscle';

export interface OrganDimensions {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
}

export interface OrganRenderOptions {
  xray?: boolean;
  wireframe?: boolean;
  colorOverrides?: Record<string, string>;
}

export interface AnatomicalHotspot {
  id: string;
  name: string;
  normalizedPosition: [number, number, number]; // [nx, ny, nz] between -1.0 and 1.0
  description: string;
  clinicalFunction: string;
  system: string;
}

export type OrganGeneratorFn = (
  dimensions: OrganDimensions,
  options?: OrganRenderOptions
) => THREE.Group;
