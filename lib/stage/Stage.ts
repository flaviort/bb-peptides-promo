import * as THREE from 'three';
import { PRODUCTS, PRODUCT_COUNT } from '@/lib/products';
import { DEFAULT_VALUES, type SceneValues } from './values';
import { VialModel, createVialGeometries, createVialMaterials, type Quality, type VialGeometries, type VialMaterials } from './Vial';
import { createLabelTexture } from './label';
import { Carousel } from './Carousel';
import { Lights } from './Lights';
import { createStudioScene } from './Studio';
import { lightMix } from './walk';

export type { Quality };

export interface StageOptions {
  canvas: HTMLCanvasElement;
  quality: Quality;
  /** CSS font-family for the canvas labels, already loaded (see labelFont in lib/boot.ts). */
  labelFont: string;
  background: string;
  reduced: boolean;
  onProgress?: (fraction: number) => void;
}

const CATEGORIES_IN_ORDER = PRODUCTS.map((p) => p.category);

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
  private readonly modelOf = new Map<THREE.Object3D, number>();
  private carousel: Carousel | null = null;
  private models: VialModel[] = [];
  private textures: THREE.Texture[] = [];
  private geo: VialGeometries | null = null;
  private mats: VialMaterials | null = null;
  private lastDragSlots = 0;
  private disposed = false;

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
    const aniso = this.renderer.capabilities.getMaxAnisotropy();
    const width = this.opts.quality === 'high' ? 2048 : 1024;
    for (let i = 0; i < PRODUCT_COUNT; i++) {
      this.textures.push(createLabelTexture(PRODUCTS[i], width, this.opts.labelFont, aniso));
      this.opts.onProgress?.((i + 1) / PRODUCT_COUNT);
      // Yield between labels so the preloader counter can paint.
      await new Promise((r) => setTimeout(r, 0));
      if (this.disposed) return;
    }
    this.geo = createVialGeometries();
    this.mats = createVialMaterials(this.opts.quality);
    this.models = PRODUCTS.map((_, i) => new VialModel(this.geo!, this.mats!, this.textures, i));
    this.models.forEach((m, i) => this.modelOf.set(m.group, i));
    this.carousel = new Carousel(this.models, { reduced: this.opts.reduced });
    this.scene.add(this.carousel.group);
    this.renderer.compile(this.scene, this.camera);
  }

  /** The product the visitor is looking at: the label on the focus vial in the walk, else the hero's center. */
  get product(): number {
    if (!this.carousel) return 0;
    return this.values.focus > 0.5 ? this.carousel.centerModel.labelIndex : this.carousel.product;
  }

  setProduct(index: number) {
    this.carousel?.goToProduct(index);
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
    this.aim(clientX, clientY);
    return this.raycaster.intersectObject(this.carousel.centerModel.group, true).length > 0;
  }

  hitProduct(clientX: number, clientY: number): number | null {
    if (!this.carousel) return null;
    this.aim(clientX, clientY);
    const hits = this.raycaster.intersectObjects(this.models.map((m) => m.group), true);
    let o: THREE.Object3D | null = hits[0]?.object ?? null;
    while (o && !this.modelOf.has(o)) o = o.parent;
    return o ? this.modelOf.get(o)! : null;
  }

  setHover(index: number | null) {
    if (this.carousel) this.carousel.hover = index;
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
    // Intro: vials converge from wide spacing, camera dollies back, lights come up.
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
    this.lights.apply(s, dt, lightMix(s.walk, CATEGORIES_IN_ORDER));
    this.carousel.update(dt, s, { mx: this.pointer.x, my: this.pointer.y });
    this.renderer.render(this.scene, this.camera);
  }

  private aim(clientX: number, clientY: number) {
    const r = this.opts.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
  }

  private slotWidthPx(): number {
    const h = 2 * this.values.camZ * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    return (this.values.spacing / (h * this.camera.aspect)) * this.opts.canvas.clientWidth;
  }

  dispose() {
    this.disposed = true;
    this.models.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.geo?.dispose();
    this.mats?.dispose();
    this.envMap.dispose();
    this.renderer.dispose();
  }
}
