import * as THREE from 'three';
import { FLAVORS } from '@/lib/flavors';
import { DEFAULT_VALUES, type SceneValues } from './values';
import {
  Can, createCanGeometries, createCanMaterials, prepareLabelTexture, type CanGeometries, type CanMaterials, type Quality,
} from './Can';
import { Carousel } from './Carousel';
import { Lights } from './Lights';
import { createStudioScene } from './Studio';

export type { Quality };

export interface StageOptions {
  canvas: HTMLCanvasElement;
  quality: Quality;
  labels: string[];
  background: string;
  onProgress?: (fraction: number) => void;
}

export class Stage {
  readonly values: SceneValues = { ...DEFAULT_VALUES };
  readonly pointer = { x: 0, y: 0 };
  intro = 0;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  private readonly fog: THREE.Fog;
  private readonly lights: Lights;
  private readonly raycaster = new THREE.Raycaster();
  private readonly scratch: SceneValues = { ...DEFAULT_VALUES };
  private readonly envMap: THREE.Texture;
  private carousel: Carousel | null = null;
  private cans: Can[] = [];
  private textures: THREE.Texture[] = [];
  private geo: CanGeometries | null = null;
  private mats: CanMaterials | null = null;
  private lastDragSlots = 0;

  constructor(private readonly opts: StageOptions) {
    const { canvas, quality } = opts;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.5));
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.setClearColor(0x000000, 0);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const studio = createStudioScene();
    this.envMap = pmrem.fromScene(studio.scene, 0.05).texture;
    studio.dispose();
    pmrem.dispose();
    this.scene.environment = this.envMap;
    this.fog = new THREE.Fog(opts.background, 12, 26);
    this.scene.fog = this.fog;
    this.lights = new Lights(this.scene);
    this.resize();
  }

  async load(): Promise<void> {
    const manager = new THREE.LoadingManager();
    manager.onProgress = (_url, loaded, total) => this.opts.onProgress?.(loaded / total);
    const loader = new THREE.TextureLoader(manager);
    const aniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = await Promise.all(this.opts.labels.map((url) => loader.loadAsync(url)));
    this.textures.forEach((t) => prepareLabelTexture(t, aniso));
    this.geo = createCanGeometries();
    this.mats = createCanMaterials(this.opts.quality);
    const count = this.opts.quality === 'high' ? 16 : 12;
    this.cans = Array.from({ length: count }, (_, i) => new Can(this.geo!, this.mats!, this.textures[i % this.textures.length]));
    this.carousel = new Carousel(this.cans, this.textures.length);
    this.scene.add(this.carousel.group);
    this.renderer.compile(this.scene, this.camera);
  }

  get flavor(): number {
    return this.carousel?.flavor ?? 0;
  }

  setFlavor(index: number) {
    this.carousel?.goToFlavor(index);
    this.setTint(index);
  }

  setTint(index: number) {
    const { s } = FLAVORS[index].colors;
    this.lights.setTint(s);
  }

  step(n: number) {
    this.carousel?.stepBy(n);
  }

  drag(dxPx: number) {
    if (!this.carousel) return;
    const slots = dxPx / this.slotWidthPx();
    this.lastDragSlots = slots;
    this.carousel.dragBy(slots);
  }

  // fling: carry the last drag speed into the snap. Trackpad swipes bring their own inertia, so they skip it.
  release(fling = true) {
    this.carousel?.release(fling ? this.lastDragSlots : 0);
    this.lastDragSlots = 0;
  }

  hitCenter(clientX: number, clientY: number): boolean {
    if (!this.carousel) return false;
    const r = this.opts.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    return this.raycaster.intersectObject(this.carousel.centerCan.group, true).length > 0;
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.opts.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render(dt: number) {
    if (!this.carousel) return;
    const v = this.values;
    const s = this.scratch;
    const k = this.intro;
    Object.assign(s, v);
    // Intro: cans converge from wide spacing, camera dollies back, lights come up.
    s.spacing = v.spacing * (1 + (1 - k) * 1.5);
    s.camZ = v.camZ - (1 - k) * 3;
    s.stageLight = v.stageLight * k;
    s.key = v.key * k;
    s.rim = v.rim * k;

    this.camera.position.set(s.camX, s.camY, s.camZ);
    this.camera.rotation.set(s.camRotX, 0, s.camRotZ);
    if (this.camera.fov !== s.fov) {
      this.camera.fov = s.fov;
      this.camera.updateProjectionMatrix();
    }
    this.fog.near = s.fogNear;
    this.fog.far = s.fogFar;
    this.renderer.toneMappingExposure = s.exposure;
    this.lights.apply(s, dt);
    if (this.mats) {
      this.mats.highlight.uHl.value = s.hl;
      this.mats.highlight.uHlRect.value.set(s.hlU0, s.hlV0, s.hlU1, s.hlV1);
    }
    this.carousel.update(dt, s, { mx: this.pointer.x, my: this.pointer.y });
    this.renderer.render(this.scene, this.camera);
  }

  private slotWidthPx(): number {
    const h = 2 * this.values.camZ * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    return (this.values.spacing / (h * this.camera.aspect)) * this.opts.canvas.clientWidth;
  }

  dispose() {
    this.cans.forEach((c) => c.dispose());
    this.textures.forEach((t) => t.dispose());
    this.geo?.dispose();
    this.mats?.dispose();
    this.envMap.dispose();
    this.renderer.dispose();
  }
}
