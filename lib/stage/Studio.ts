import * as THREE from 'three';

// A small product-photography studio, rendered once into the environment map. Bright softboxes
// and strip lights in a dim warm room give metal and gloss crisp light and dark bands, where a
// soft generic room would wash them flat. Values above 1 are fine: the PMREM target is HDR.
export function createStudioScene(): { scene: THREE.Scene; dispose(): void } {
  const scene = new THREE.Scene();
  const disposables: { dispose(): void }[] = [];

  const room = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.12, 0.105, 0.095), side: THREE.BackSide }),
  );
  scene.add(room);
  disposables.push(room.geometry, room.material);

  const panel = (w: number, h: number, intensity: number, tint: string, pos: [number, number, number]) => {
    const color = new THREE.Color(tint).multiplyScalar(intensity);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
    disposables.push(m.geometry, m.material);
  };

  panel(26, 26, 3.2, '#fff6ea', [0, 13, -1]); // ceiling softbox: lids and shoulders mirror the sky, so they read bright
  panel(14, 3, 6, '#ffffff', [0, 12, 4]); // hot overhead bar for the crisp streak across the rim
  panel(2, 14, 9, '#ffffff', [-9, 1, 5]); // key strip, front left: the long hot streak down the wall
  panel(1.4, 14, 6, '#ffe2c4', [9, 1, -3]); // warm rim strip, back right
  panel(10, 3, 1.6, '#fff2e0', [0, -1, 12]); // low front fill so labels keep their color
  panel(8, 8, 0.7, '#f4c79a', [0, -12, 0]); // warm bounce from below
  // A ring of thin strips around the horizon: chrome walls and rims mirror the horizon, and
  // alternating bright and dark bands are what make metal read as metal.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.6;
    panel(2.6, 9, i % 2 === 0 ? 3.2 : 1.8, '#fff8f0', [Math.sin(a) * 11, 0.5, Math.cos(a) * 11]);
  }

  return { scene, dispose: () => disposables.forEach((d) => d.dispose()) };
}
