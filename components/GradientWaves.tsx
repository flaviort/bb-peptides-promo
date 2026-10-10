'use client';

import { useEffect, useRef } from 'react';
import { FLAVORS } from '@/lib/flavors';
import { store } from '@/lib/store';

// Soft raymarched wave field behind the stage, after React Bits' GradientWaves, written
// against raw WebGL2 so it needs no extra package. It is all smooth gradients, so it renders
// at a fraction of the screen resolution and the browser scales it up.
const SCALE = 0.4;
const CREAM: [number, number, number] = [0xf6 / 255, 0xed / 255, 0xdc / 255];

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uHorizon;
uniform vec3 uWave;
uniform vec3 uCrest;
uniform float uOpacity;
out vec4 fragColor;

const float AMP = 2.4;
const float SWELL = 35.0;
const float TURB = 20.0;
const float HEIGHT = 5.5;
const float FOG = 48.0;
const float TILT = 1.16;

float field(vec3 r, vec2 f, vec4 tc) {
  float mx = r.x + tc.x;
  mx += SWELL * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += TURB * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * f.x) * AMP + sin(my * f.y) * AMP + HEIGHT);
}

void main() {
  float T = uTime;
  vec2 f = vec2(0.6 / 7.0, (0.6 * 0.9) / 3.0);
  vec4 tc = vec4(T / 0.13, T / 0.81, T / 0.2, T / 0.71);
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  uv.x *= uRes.x / uRes.y;
  uv.y *= -1.0;

  float len = length(uv);
  float a = (3.14159 / 2.3) * len;
  vec3 dir = mat3(1.0, 0.0, 0.0, 0.0, cos(a), -sin(a), 0.0, sin(a), cos(a)) * vec3(0.0, 0.0, -1.0);
  vec2 n = len > 1e-5 ? uv / len : vec2(1.0, 0.0);
  dir = mat3(n.x, -n.y, 0.0, n.y, n.x, 0.0, 0.0, 0.0, 1.0) * dir;
  dir = mat3(cos(TILT), 0.0, sin(TILT), 0.0, 1.0, 0.0, -sin(TILT), 0.0, cos(TILT)) * dir;
  float yaw = (uMouse.x - 0.5) * 0.12;
  float pitch = (uMouse.y - 0.5) * 0.12;
  dir = mat3(cos(yaw), 0.0, sin(yaw), 0.0, 1.0, 0.0, -sin(yaw), 0.0, cos(yaw)) * dir;
  dir = mat3(1.0, 0.0, 0.0, 0.0, cos(pitch), -sin(pitch), 0.0, sin(pitch), cos(pitch)) * dir;

  vec3 cam = vec3(0.0, 0.0, 30.0);
  float d = 0.0;
  for (int i = 0; i < 56; i++) {
    float s = field(cam + d * dir, f, tc);
    if (abs(s) < 0.1) break;
    d += 0.9 * s;
    if (abs(d) > 20000.0) { d = 20000.0; break; }
  }
  vec3 p = cam + d * dir;
  float t = clamp(FOG / max(d, 0.001), 0.0, 1.0);
  vec3 body = mix(uWave, uCrest, smoothstep(0.35, 1.0, p.z * 0.08 + 0.5));
  vec3 col = mix(uHorizon, body, t);
  float alpha = t * uOpacity;
  fragColor = vec4(col * alpha, alpha);
}
`;

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
// Washes a flavor color toward cream so the waves stay a backdrop.
const mix = (a: [number, number, number], b: [number, number, number], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
const soften = (c: [number, number, number], k: number) => c.map((v, i) => v + (CREAM[i] - v) * k) as [number, number, number];

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
  return s;
}

// speed scales the swell's motion: the hero drifts slowly, the statement screen rolls fast.
export function GradientWaves({ visible, speed = 0.18, bold = false }: { visible: boolean; speed?: number; bold?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visibleRef = useRef(visible);
  const speedRef = useRef(speed);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    visibleRef.current = visible;
    speedRef.current = speed;
    kick.current();
  }, [visible, speed]);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    } catch {
      return;
    }
    gl.useProgram(program);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u('uRes');
    const uTime = u('uTime');
    const uMouse = u('uMouse');
    const uHorizon = u('uHorizon');
    const uWave = u('uWave');
    const uCrest = u('uCrest');
    const uOpacity = u('uOpacity');
    gl.uniform3fv(uHorizon, CREAM);
    gl.clearColor(0, 0, 0, 0);

    const target = { wave: [0, 0, 0] as number[], crest: [0, 0, 0] as number[] };
    const wave = [0, 0, 0];
    const crest = [0, 0, 0];
    const setFlavor = (snap: boolean) => {
      const c = FLAVORS[store.get().flavor].colors;
      // Saturated troughs with pale crests, the contrast that makes the swell readable.
      // Bold keeps the whole swell in the flavor's own colors, for the saturated statement screen.
      target.wave = bold ? mix(hex(c.d), hex(c.p), 0.55) : hex(c.p);
      target.crest = bold ? soften(hex(c.s), 0.2) : soften([1, 0.98, 0.94], 0);
      if (snap) {
        wave.splice(0, 3, ...target.wave);
        crest.splice(0, 3, ...target.crest);
      }
    };
    setFlavor(true);
    const unsubscribe = store.subscribe(() => setFlavor(false));

    const resize = () => {
      canvas.width = Math.max(1, Math.round(innerWidth * SCALE));
      canvas.height = Math.max(1, Math.round(innerHeight * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    addEventListener('resize', resize);

    const mouse = [0.5, 0.5];
    const mouseTarget = [0.5, 0.5];
    const onMove = (e: PointerEvent) => {
      mouseTarget[0] = e.clientX / innerWidth;
      mouseTarget[1] = 1 - e.clientY / innerHeight;
    };
    addEventListener('pointermove', onMove, { passive: true });

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let opacity = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!reduced) time += dt * speedRef.current;
      const k = 1 - Math.exp(-dt * 3);
      for (let i = 0; i < 3; i++) {
        wave[i] += (target.wave[i] - wave[i]) * k;
        crest[i] += (target.crest[i] - crest[i]) * k;
      }
      mouse[0] += (mouseTarget[0] - mouse[0]) * 0.04;
      mouse[1] += (mouseTarget[1] - mouse[1]) * 0.04;
      opacity += ((visibleRef.current ? 1 : 0) - opacity) * (1 - Math.exp(-dt * 4));
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.uniform3fv(uWave, wave);
      gl.uniform3fv(uCrest, crest);
      gl.uniform1f(uOpacity, opacity);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // Idle once faded out, or after the single still frame under reduced motion.
      const settled = !visibleRef.current && opacity < 0.005;
      raf = settled || (reduced && Math.abs(opacity - 1) < 0.005) ? 0 : requestAnimationFrame(frame);
    };
    // Browsers already pause requestAnimationFrame in hidden tabs.
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    kick.current = start;
    start();

    return () => {
      cancelAnimationFrame(raf);
      kick.current = () => {};
      unsubscribe();
      removeEventListener('resize', resize);
      removeEventListener('pointermove', onMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [bold]);

  return <canvas ref={ref} aria-hidden="true" className="backdrop-waves" />;
}
