import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export interface ExportGLBOptions {
  binary?: boolean;
  maxTextureSize?: number;
}

/**
 * Serializes a Three.js scene/group into a binary .glb Blob for web & mobile AR.
 */
export async function exportOrganToGLB(
  scene: THREE.Object3D,
  options: ExportGLBOptions = { binary: true }
): Promise<Blob> {
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: 'model/gltf-binary' });
          resolve(blob);
        } else {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: 'application/json' });
          resolve(blob);
        }
      },
      (error) => reject(error),
      {
        binary: options.binary ?? true,
        onlyVisible: true,
        embedImages: true,
      }
    );
  });
}

/**
 * Triggers a direct browser download of the generated .glb file.
 */
export function downloadGLBBlob(blob: Blob, filename = 'organ-model.glb'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
