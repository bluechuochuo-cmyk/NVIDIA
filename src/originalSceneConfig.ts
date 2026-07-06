export type SceneId = 'forest' | 'ocean' | 'cave' | 'rocky-desert';

export type Vector3Tuple = [number, number, number];

export type OriginalSceneConfig = {
  id: SceneId;
  theme: string;
  optionLabel: string;
  optionDetail: string;
  glbPath: string;
  background: { top: string; bottom: string };
  fog: { color: string; near: number; far: number };
  lights: {
    ambient: { color: string; intensity: number };
    hemi: { sky: string; ground: string; intensity: number };
    key: { color: string; intensity: number; position: Vector3Tuple };
    fill: { color: string; intensity: number; position: Vector3Tuple };
  };
  env: { top: string; bottom: string; intensity: number };
  fallbackMesh: { color: string; roughness: number; metalness: number };
  camera: {
    position: Vector3Tuple;
    target: Vector3Tuple;
    fov: number;
    yawSpeed: number;
    yawAmplitude: number;
    dollySpeed: number;
    dollyAmplitude: number;
    bobSpeed: number;
    bobAmplitude: number;
    ambientMotion?: { style: 'forwardDolly'; speed: number; distance: number; loop?: boolean; bob?: number; keepTargetFixed?: boolean };
    pointerFollow?: { yaw: number; pitch: number; damping: number };
  };
  moodOverlay: string;
  accent: string;
  volumetric?: {
    anchor: Vector3Tuple;
    color: string;
    density: number;
    weight: number;
    decay: number;
    exposure: number;
    threshold: number;
    shaft?: { dir: Vector3Tuple; length: number; width: number; color: string; intensity: number; softness: number; taper: number };
    coreGlow?: { color: string; size: number; intensity: number };
    dust?: { count: number; color: string; size: number; radius: number; height: number; opacity: number };
  };
};

export const DEFAULT_SCENE_ID: SceneId = 'rocky-desert';
export const FLOW_SCENE_ID: SceneId = 'ocean';
export const NVIDIA_ACCENT = '#76B900';

export const originalScenes: Record<SceneId, OriginalSceneConfig> = {
  forest: {
    id: 'forest',
    theme: '成长',
    optionLabel: '被自然包裹，慢慢生长',
    optionDetail: '被绿意与光斑环绕，按自己的节奏舒展',
    glbPath: '/webgl/scenes/forest/model.glb',
    background: { top: '#2c4620', bottom: '#0a130a' },
    fog: { color: '#28371c', near: 3.2, far: 12.5 },
    lights: {
      ambient: { color: '#dde4c2', intensity: 0.58 },
      hemi: { sky: '#fbeeba', ground: '#1c2410', intensity: 1.14 },
      key: { color: '#ffe296', intensity: 3.4, position: [-2, 6, -5] },
      fill: { color: '#d8be80', intensity: 1, position: [5, 1.5, 4] },
    },
    env: { top: '#f7e6a4', bottom: '#2e2f18', intensity: 1.08 },
    fallbackMesh: { color: '#3f6b32', roughness: 0.85, metalness: 0.02 },
    camera: { position: [1.72, 0.22, 1.62], target: [0.18, 0.34, -2.1], fov: 45, yawSpeed: 0.05, yawAmplitude: 0.08, dollySpeed: 0.06, dollyAmplitude: 0.22, bobSpeed: 0.35, bobAmplitude: 0.05 },
    moodOverlay: 'radial-gradient(circle at 46% 34%, rgba(255,226,150,.30), transparent 42%), radial-gradient(circle at 50% 8%, rgba(226,255,176,.10), transparent 52%), linear-gradient(180deg, rgba(24,42,16,.05), rgba(5,12,6,.62))',
    accent: '#ffd98a',
    volumetric: { anchor: [-0.55, 2.35, -3.1], color: '#ffdf9e', density: 0.6, weight: 0.5, decay: 0.957, exposure: 0.32, threshold: 0.56, coreGlow: { color: '#ffe9c0', size: 1.6, intensity: 0.32 }, dust: { count: 200, color: '#ffe9c2', size: 0.045, radius: 3.4, height: 3.2, opacity: 0.38 } },
  },
  ocean: {
    id: 'ocean',
    theme: '自由',
    optionLabel: '辽阔、自由，想要远行',
    optionDetail: '海平线尽头，风与浪都在往前推你',
    glbPath: '/webgl/scenes/ocean/model.glb',
    background: { top: '#123458', bottom: '#01040b' },
    fog: { color: '#0a2037', near: 5.5, far: 24 },
    lights: {
      ambient: { color: '#9ebfe2', intensity: 0.24 },
      hemi: { sky: '#afc8ea', ground: '#020a14', intensity: 0.45 },
      key: { color: '#c8d8f3', intensity: 2.85, position: [-4.6, 3.55, -8.2] },
      fill: { color: '#376fa4', intensity: 0.36, position: [2.8, 1.2, 3.2] },
    },
    env: { top: '#7f9fc2', bottom: '#03101c', intensity: 0.48 },
    fallbackMesh: { color: '#2b6f8f', roughness: 0.5, metalness: 0.1 },
    camera: { position: [-0.92, 0.56, 5.08], target: [0.18, 0.12, -2.48], fov: 54, yawSpeed: 0.018, yawAmplitude: 0.018, dollySpeed: 0.025, dollyAmplitude: 0.08, bobSpeed: 0.22, bobAmplitude: 0.008, ambientMotion: { style: 'forwardDolly', speed: 0.072, distance: 2.35, loop: false, bob: 0.006, keepTargetFixed: true } },
    moodOverlay: 'radial-gradient(circle at 34% 28%, rgba(125,165,230,.12), transparent 42%), linear-gradient(180deg, rgba(5,18,36,.02), rgba(1,5,12,.26))',
    accent: '#bcd8ff',
    volumetric: { anchor: [-3, 2.5, -9.2], color: '#c2d2ee', density: 0.5, weight: 0.045, decay: 0.972, exposure: 0.05, threshold: 0.96, coreGlow: { color: '#c9d6f2', size: 0.55, intensity: 0.018 }, dust: { count: 150, color: '#bcd8ff', size: 0.045, radius: 3.4, height: 2.4, opacity: 0.24 } },
  },
  cave: {
    id: 'cave',
    theme: '内省',
    optionLabel: '向内探索，专注而神秘',
    optionDetail: '光束穿过岩壁，安静地照见自己',
    glbPath: '/webgl/scenes/cave/model.glb',
    background: { top: '#141a38', bottom: '#03040a' },
    fog: { color: '#0b1026', near: 3.2, far: 14 },
    lights: {
      ambient: { color: '#8f7ecf', intensity: 0.26 },
      hemi: { sky: '#7c6cff', ground: '#050410', intensity: 0.42 },
      key: { color: '#9fefff', intensity: 1, position: [0.4, 5, -3] },
      fill: { color: '#a98bff', intensity: 0.5, position: [-3, 1, 3] },
    },
    env: { top: '#4a5ad0', bottom: '#0a0c22', intensity: 0.7 },
    fallbackMesh: { color: '#3a3a52', roughness: 0.8, metalness: 0.1 },
    camera: { position: [1.05, 0.5, 3.6], target: [0.3, 0.86, -1.95], fov: 46, yawSpeed: 0.035, yawAmplitude: 0.06, dollySpeed: 0.05, dollyAmplitude: 0.28, bobSpeed: 0.28, bobAmplitude: 0.045, ambientMotion: { style: 'forwardDolly', speed: 0.12, distance: 3.2, loop: false, bob: 0.02 } },
    moodOverlay: 'radial-gradient(ellipse 22% 56% at 54% 32%, rgba(127,230,255,.24), transparent 62%), linear-gradient(180deg, rgba(10,14,40,.04), rgba(3,4,14,.72))',
    accent: '#7fe6ff',
    volumetric: { anchor: [0.35, 1.1, -1.95], color: '#a6ecff', density: 0.72, weight: 0.26, decay: 0.954, exposure: 0.32, threshold: 0.68, shaft: { dir: [0, -0.86, 0.5], length: 3.1, width: 0.9, color: '#bdf1ff', intensity: 1.15, softness: 0.4, taper: 0.3 }, coreGlow: { color: '#cbf3ff', size: 0.42, intensity: 0.22 }, dust: { count: 240, color: '#cbf3ff', size: 0.045, radius: 1.6, height: 3.2, opacity: 0.45 } },
  },
  'rocky-desert': {
    id: 'rocky-desert',
    theme: '韧性',
    optionLabel: '孤独但坚定，极简纯粹',
    optionDetail: '一望无际的荒原，只剩下你和方向',
    glbPath: '/webgl/scenes/rocky-desert/model.glb',
    background: { top: '#241820', bottom: '#080503' },
    fog: { color: '#323644', near: 3.6, far: 14.5 },
    lights: {
      ambient: { color: '#5a6a86', intensity: 0.1 },
      hemi: { sky: '#7f96b6', ground: '#080604', intensity: 0.2 },
      key: { color: '#ffb277', intensity: 0.7, position: [-0.7, 1.6, -9.4] },
      fill: { color: '#6076a0', intensity: 0.12, position: [3.2, 1.2, 3.5] },
    },
    env: { top: '#8296b4', bottom: '#0a0a12', intensity: 0.16 },
    fallbackMesh: { color: '#b5824f', roughness: 0.9, metalness: 0.03 },
    camera: { position: [0, 0.07, 2.55], target: [0, -0.13, -4.55], fov: 62, yawSpeed: 0.03, yawAmplitude: 0.02, dollySpeed: 0.04, dollyAmplitude: 0.3, bobSpeed: 0.24, bobAmplitude: 0.012, ambientMotion: { style: 'forwardDolly', speed: 0.085, distance: 1.28, loop: false, bob: 0.025 }, pointerFollow: { yaw: 0.16, pitch: 0.08, damping: 3 } },
    moodOverlay: 'radial-gradient(ellipse 11% 24% at 50% 60%, rgba(255,198,124,.20), transparent 72%), linear-gradient(180deg, rgba(6,4,3,0) 46%, rgba(5,3,2,.5) 70%, rgba(2,1,1,.72)), radial-gradient(ellipse 104% 62% at 50% 44%, rgba(224,150,66,.40), transparent 78%), radial-gradient(ellipse 72% 20% at 50% 46%, rgba(255,182,112,.22), transparent 72%), radial-gradient(circle at 50% -6%, rgba(12,7,14,.6), transparent 52%)',
    accent: '#ffb867',
    volumetric: { anchor: [0.3, 1, -6.9], color: '#ffb266', density: 0.7, weight: 0.3, decay: 0.973, exposure: 0.22, threshold: 0.82, shaft: { dir: [-0.03, -0.24, 1], length: 6.4, width: 1.85, color: '#ffc487', intensity: 0.28, softness: 0.46, taper: 0.58 }, coreGlow: { color: '#fff2df', size: 1.45, intensity: 0.78 }, dust: { count: 300, color: '#ffd09a', size: 0.05, radius: 4, height: 2.3, opacity: 0.44 } },
  },
};

export function getOriginalScene(id: SceneId) {
  return originalScenes[id] ?? originalScenes[DEFAULT_SCENE_ID];
}
