import { lazy, Suspense, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import {
  DEFAULT_SCENE_ID,
  getOriginalScene,
  type OriginalSceneConfig,
  type SceneId,
} from './originalSceneConfig';

export type BackdropMode = 'entry-video' | 'entry-scene' | 'flow-video';

const ENTRY_BACKGROUND_VIDEO = '/assets/videos/space-orb-background.mp4';
const CODENEST_HLS_STREAM = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';
const SENTINEL_SPLINE_SCENE = 'https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode';

const SplineScene = lazy(() => import('@splinetool/react-spline'));

function vec3(value: [number, number, number]) {
  return new THREE.Vector3(value[0], value[1], value[2]);
}

function makeGlowTexture(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.36, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function normalizeObject(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const scale = 6 / (Math.max(size.x, size.y, size.z) || 1);
  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
}

function tintMaterials(object: THREE.Object3D, config: OriginalSceneConfig) {
  const fallback = new THREE.Color(config.fallbackMesh.color);
  object.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const standard = material as THREE.MeshStandardMaterial;
      if (!standard?.isMeshStandardMaterial) return;
      const cloned = standard.clone();
      cloned.envMapIntensity = config.env.intensity;
      if (!cloned.map && cloned.color.r > 0.92 && cloned.color.g > 0.92 && cloned.color.b > 0.92) {
        cloned.color.copy(fallback);
        cloned.roughness = config.fallbackMesh.roughness;
        cloned.metalness = config.fallbackMesh.metalness;
      }
      cloned.needsUpdate = true;
      if (Array.isArray(mesh.material)) {
        mesh.material = materials.map((item) => (item === material ? cloned : item));
      } else {
        mesh.material = cloned;
      }
    });
  });
}

function createVolumetric(config: OriginalSceneConfig) {
  const group = new THREE.Group();
  const volumetric = config.volumetric;
  if (!volumetric) return group;

  const anchor = vec3(volumetric.anchor);
  const glowTexture = makeGlowTexture(volumetric.coreGlow?.color ?? volumetric.color);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: volumetric.coreGlow?.color ?? volumetric.color,
      transparent: true,
      opacity: Math.min(0.8, (volumetric.coreGlow?.intensity ?? volumetric.weight) * 0.9),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.position.copy(anchor);
  glow.scale.setScalar(volumetric.coreGlow?.size ?? 1.2);
  group.add(glow);

  if (volumetric.shaft && volumetric.shaft.intensity > 0) {
    const shaft = volumetric.shaft;
    const material = new THREE.MeshBasicMaterial({
      color: shaft.color,
      transparent: true,
      opacity: Math.min(0.32, shaft.intensity * 0.18),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const geometry = new THREE.ConeGeometry(shaft.width, shaft.length, 36, 1, true);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(anchor).add(vec3(shaft.dir).normalize().multiplyScalar(shaft.length * 0.34));
    mesh.lookAt(anchor.clone().add(vec3(shaft.dir)));
    mesh.rotateX(Math.PI / 2);
    group.add(mesh);
  }

  if (volumetric.dust && volumetric.dust.count > 0) {
    const dust = volumetric.dust;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(dust.count * 3);
    for (let i = 0; i < dust.count; i += 1) {
      const radius = Math.sqrt(Math.random()) * dust.radius;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = anchor.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = anchor.y + (Math.random() - 0.5) * dust.height;
      positions[i * 3 + 2] = anchor.z + Math.sin(angle) * radius;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: dust.color,
      size: dust.size,
      transparent: true,
      opacity: Math.min(0.7, dust.opacity),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    group.add(new THREE.Points(geometry, material));
  }

  return group;
}

function createFallbackObject(config: OriginalSceneConfig) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: config.fallbackMesh.color,
    roughness: config.fallbackMesh.roughness,
    metalness: config.fallbackMesh.metalness,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.6, 0.18, 5), material);
  base.position.y = -0.9;
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), material);
  core.position.set(0, 0.05, -1.3);
  group.add(base, core);
  return group;
}

function usePointerTarget() {
  const pointerRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointerRef.current = {
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return pointerRef;
}

function OriginalSceneCanvas({ sceneId }: { sceneId: SceneId }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const activeSceneRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef(0);
  const transitionRef = useRef({ start: performance.now(), fromScene: sceneId, toScene: sceneId });
  const pointerRef = usePointerTarget();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const config = getOriginalScene(sceneId);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(config.fog.color, config.fog.near, config.fog.far);
    const camera = new THREE.PerspectiveCamera(config.camera.fov, renderer.domElement.width / renderer.domElement.height, 0.05, 120);
    const startTime = performance.now();
    const target = vec3(config.camera.target);
    const cameraBase = vec3(config.camera.position);

    const ambient = new THREE.AmbientLight(config.lights.ambient.color, config.lights.ambient.intensity);
    const hemi = new THREE.HemisphereLight(config.lights.hemi.sky, config.lights.hemi.ground, config.lights.hemi.intensity);
    const key = new THREE.DirectionalLight(config.lights.key.color, config.lights.key.intensity);
    key.position.set(...config.lights.key.position);
    const fill = new THREE.DirectionalLight(config.lights.fill.color, config.lights.fill.intensity);
    fill.position.set(...config.lights.fill.position);
    scene.add(ambient, hemi, key, fill);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/webgl/libs/draco/');
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('/webgl/libs/basis/');
    ktx2Loader.detectSupport(renderer);
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.setKTX2Loader(ktx2Loader);

    let disposed = false;
    const installObject = (object: THREE.Object3D, nextConfig: OriginalSceneConfig) => {
      if (disposed) return;
      activeSceneRef.current?.parent?.remove(activeSceneRef.current);
      const group = new THREE.Group();
      group.add(object);
      normalizeObject(object);
      tintMaterials(object, nextConfig);
      group.add(createVolumetric(nextConfig));
      activeSceneRef.current = group;
      scene.add(group);
    };

    gltfLoader
      .loadAsync(config.glbPath)
      .then((gltf) => installObject(gltf.scene, config))
      .catch(() => installObject(createFallbackObject(config), config));

    const resize = () => {
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const current = getOriginalScene(transitionRef.current.toScene);
      const pointer = pointerRef.current;
      const yaw = Math.sin(elapsed * current.camera.yawSpeed) * current.camera.yawAmplitude + pointer.x * (current.camera.pointerFollow?.yaw ?? 0.035);
      const pitch = pointer.y * (current.camera.pointerFollow?.pitch ?? 0.02);
      const bob = Math.sin(elapsed * current.camera.bobSpeed) * current.camera.bobAmplitude;
      const dolly = Math.sin(elapsed * current.camera.dollySpeed) * current.camera.dollyAmplitude;
      const base = vec3(current.camera.position);
      const look = vec3(current.camera.target);
      const direction = look.clone().sub(base).normalize();
      if (current.camera.ambientMotion?.style === 'forwardDolly') {
        const progress = current.camera.ambientMotion.loop ? (Math.sin(elapsed * current.camera.ambientMotion.speed) + 1) / 2 : Math.min(1, elapsed * current.camera.ambientMotion.speed);
        base.add(direction.clone().multiplyScalar(progress * current.camera.ambientMotion.distance));
      }
      camera.position.lerp(new THREE.Vector3(base.x + yaw, base.y + bob - pitch, base.z + dolly), 0.06);
      camera.lookAt(look);
      activeSceneRef.current?.rotation.set(0, yaw * 0.25, 0);
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      activeSceneRef.current?.traverse((node) => {
        const mesh = node as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose?.();
      });
      activeSceneRef.current = null;
      dracoLoader.dispose();
      ktx2Loader.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [pointerRef, sceneId]);

  useEffect(() => {
    transitionRef.current = { start: performance.now(), fromScene: transitionRef.current.toScene, toScene: sceneId };
  }, [sceneId]);

  return <div ref={hostRef} className="original-scene-canvas" aria-hidden="true" />;
}

function BackdropVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const applyPlaybackRate = () => {
      video.playbackRate = 0.5;
    };

    applyPlaybackRate();
    video.addEventListener('loadedmetadata', applyPlaybackRate);
    return () => video.removeEventListener('loadedmetadata', applyPlaybackRate);
  }, []);

  return (
    <video
      ref={videoRef}
      className="deep-backdrop__video deep-backdrop__video--entry"
      src={ENTRY_BACKGROUND_VIDEO}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}

function SplineSecurityBackdrop() {
  return (
    <div className="deep-spline-backdrop">
      <Suspense fallback={<div className="deep-spline-backdrop__fallback" />}>
        <SplineScene scene={SENTINEL_SPLINE_SCENE} className="deep-spline-backdrop__scene" />
      </Suspense>
      <div className="deep-spline-backdrop__ambient" />
      <div className="deep-spline-backdrop__shade" />
    </div>
  );
}

function HlsSceneBackdrop() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let hls: Hls | null = null;
    const play = () => {
      video.playbackRate = 1;
      void video.play().catch(() => {});
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = CODENEST_HLS_STREAM;
      video.addEventListener('loadedmetadata', play);
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: false });
      hls.loadSource(CODENEST_HLS_STREAM);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, play);
    } else {
      video.src = CODENEST_HLS_STREAM;
      video.addEventListener('loadedmetadata', play);
    }

    return () => {
      video.removeEventListener('loadedmetadata', play);
      hls?.destroy();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="deep-backdrop__video deep-backdrop__video--scifi"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}

export function OriginalBackdrop({ mode, sceneId = DEFAULT_SCENE_ID }: { mode: BackdropMode; sceneId?: SceneId }) {
  const isSceneMode = mode === 'entry-scene';
  const isFlowMode = mode === 'flow-video';
  return (
    <div className={`deep-backdrop deep-backdrop--${mode}`} aria-hidden="true">
      {isSceneMode ? <HlsSceneBackdrop /> : isFlowMode ? <SplineSecurityBackdrop /> : <BackdropVideo />}
      {isFlowMode ? <div className="deep-backdrop__flow-depth" /> : null}
      {isSceneMode ? (
        <>
          <svg className="deep-backdrop__scifi-glow" viewBox="0 0 900 260" preserveAspectRatio="none">
            <defs>
              <filter id="scifi-glow-blur" x="-20%" y="-70%" width="140%" height="240%">
                <feGaussianBlur stdDeviation="25" />
              </filter>
            </defs>
            <ellipse cx="450" cy="130" rx="360" ry="58" fill="rgba(94, 210, 156, 0.34)" filter="url(#scifi-glow-blur)" />
          </svg>
          <div className="deep-backdrop__scifi-grid" />
          <div className="deep-backdrop__scifi-gradient" />
        </>
      ) : null}
    </div>
  );
}
