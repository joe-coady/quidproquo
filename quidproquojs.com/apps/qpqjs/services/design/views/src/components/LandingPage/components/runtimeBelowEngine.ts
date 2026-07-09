import { QpqRuntime } from './qpqSceneEvents';

/**
 * "The Runtime Below" — the hero backdrop as a raw WebGL scene, no libraries.
 *
 * Composition: the copy lives in near-black sky above a low horizon; beneath
 * it an endless lattice floor recedes into fog, holding three glowing runtime
 * wells (lambda / node / browser). Every few seconds a cyan action pulse
 * leaves one of the code window's real yield lines, dives into the active
 * cycle's well, blooms, and a green result rises back — the same story
 * visibly running on each platform in turn.
 *
 * Rendering: one opaque canvas (alpha:false, clear = page background) with
 * additive blending, three tiny programs — GL_POINTS for dust/pulse trails
 * (screen-space points for pulses so they stay glued to the DOM code window
 * and to the wells no matter how the camera sways), GL_LINES for the fogged
 * floor lattice, and floor-aligned quads for the well and bloom decals so
 * pools genuinely lie IN the floor instead of billboarding at the camera.
 *
 * Camera: fixed orientation (horizon never tilts, verticals stay vertical);
 * parallax comes from translating the eye only — a slow lissajous drift plus
 * heavily damped pointer chase. Depth is sold by translation parallax across
 * dust/floor/wells at genuinely different distances.
 */

const FOV_TAN = Math.tan((55 / 2) * (Math.PI / 180));
const NEAR = 0.1;
const FAR = 120;
const EYE_HEIGHT = 2.2;
const EYE_Z = 8;
const GRID_STEP = 1.25;
const GRID_FAR_Z = -40;
const GRID_NEAR_Z = 4.5;
const GRID_CHUNK = 4;
const LINE_FOG = 0.034;
const MAX_PULSES = 8;
const TRAIL_CAP = 56;
const TRAIL_SPACING_PX = 6;
const POINT_STRIDE = 9; // pos3 + tint4 + (size, kind)

interface PointPx {
  x: number;
  y: number;
}

interface RectPx {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface EngineAnchors {
  /** Canvas-relative px of the three yield lines' left edges, index 0..2. */
  yieldPoints: PointPx[];
  /** Canvas-relative rect of the code window, or null when it is off-scene. */
  panel: RectPx | null;
}

export interface RuntimeBelowEngineOptions {
  reducedMotion: boolean;
  getAnchors: () => EngineAnchors | null;
  onDispatched?: (line: number) => void;
  onExecuted?: (runtime: QpqRuntime) => void;
  onReturned?: (line: number, runtime: QpqRuntime) => void;
}

export interface RuntimeBelowEngine {
  start: () => void;
  stop: () => void;
  resize: () => void;
  renderStaticFrame: () => void;
  destroy: () => void;
}

interface WellSpec {
  runtime: QpqRuntime;
  color: [number, number, number];
  /** Where the pool should sit on screen, as viewport fractions at rest. */
  screenFrac: [number, number];
  /** Half-size of the floor decal quad, world units. */
  quadRadius: number;
}

const WELL_SPECS: WellSpec[] = [
  {
    runtime: QpqRuntime.lambda,
    color: [0.984, 0.573, 0.235],
    screenFrac: [0.34, 0.835],
    quadRadius: 1.9,
  },
  {
    runtime: QpqRuntime.node,
    color: [0.525, 0.937, 0.675],
    screenFrac: [0.49, 0.64],
    quadRadius: 3.2,
  },
  {
    runtime: QpqRuntime.browser,
    color: [0.376, 0.647, 0.98],
    screenFrac: [0.74, 0.84],
    quadRadius: 1.6,
  },
];

interface Well {
  spec: WellSpec;
  world: [number, number]; // x, z on the floor
  dist: number;
  bloom: number; // 0..1 envelope of the landing ring
  bloomT: number;
  hover: number;
  px: PointPx;
  pxW: number;
}

interface Pulse {
  active: boolean;
  outbound: boolean;
  line: number;
  wellIndex: number;
  s: number;
  prevSE: number;
  dur: number;
  scale: number;
  from: PointPx;
  jx: number;
  jy: number;
  trail: Float32Array;
  trailCount: number;
  head: PointPx;
  /** Seconds since the pulse finished; its leftover trail fades out on this. */
  afterglow: number;
}

// ---------------------------------------------------------------------------
// shaders

const QUIET_GLSL = `
  float quietFactor(vec2 ndc) {
    float d = length((ndc - vec2(-0.55, 0.10)) * vec2(1.25, 1.0));
    return mix(0.32, 1.0, smoothstep(0.30, 0.95, d));
  }
`;

const HASH_GLSL = `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
`;

const POINT_VS = `
  attribute vec3 aPos;
  attribute vec4 aTint;
  attribute vec2 aMeta; // x: size in css px (world points: at w=1), y: kind
  uniform mat4 uVP;
  uniform float uTime;
  uniform float uDpr;
  uniform float uFade;
  uniform float uQuiet;
  varying vec4 vTint;
  ${QUIET_GLSL}
  void main() {
    if (aMeta.y < 0.5) {
      // dust: drifted entirely on the GPU so the CPU never touches it
      vec3 p = aPos;
      p.x += 0.40 * sin(uTime * 0.07 + p.z * 0.9);
      p.y += 0.22 * sin(uTime * 0.05 + p.x * 1.3);
      p.z += 0.30 * sin(uTime * 0.06 + p.y * 1.1);
      vec4 clip = uVP * vec4(p, 1.0);
      gl_Position = clip;
      float w = max(clip.w, 0.001);
      vec2 ndc = clip.xy / w;
      float quiet = mix(1.0, quietFactor(ndc), uQuiet);
      float depth = clamp(1.0 - w * 0.024, 0.12, 1.0);
      float near = smoothstep(0.6, 2.0, w);
      vTint = vec4(aTint.rgb, aTint.a * depth * near * quiet * uFade);
      gl_PointSize = clamp(aMeta.x * uDpr / w, 0.0, 64.0 * uDpr);
    } else {
      // pulse trails/heads: already in NDC, sized in css px
      gl_Position = vec4(aPos.xy, 0.0, 1.0);
      vTint = vec4(aTint.rgb, aTint.a * uFade);
      gl_PointSize = min(aMeta.x * uDpr, 64.0 * uDpr);
    }
  }
`;

const POINT_FS = `
  precision mediump float;
  varying vec4 vTint;
  ${HASH_GLSL}
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    // reversed-edge smoothstep is undefined in GLSL ES 1.00 — invert instead
    float m = exp(-r * r * 4.0) * (1.0 - smoothstep(0.7, 1.0, r));
    vec3 c = vTint.rgb * (vTint.a * m);
    c += (hash(gl_FragCoord.xy) - 0.5) * (1.0 / 255.0) * m;
    gl_FragColor = vec4(c, 1.0);
  }
`;

const LINE_VS = `
  attribute vec3 aPos;
  attribute float aAlpha;
  uniform mat4 uVP;
  uniform float uFade;
  uniform float uQuiet;
  varying float vAlpha;
  ${QUIET_GLSL}
  void main() {
    vec4 clip = uVP * vec4(aPos, 1.0);
    gl_Position = clip;
    float w = max(clip.w, 0.001);
    vec2 ndc = clip.xy / w;
    float fog = exp(-w * ${LINE_FOG.toFixed(3)});
    float near = smoothstep(1.0, 3.5, w);
    float quiet = mix(1.0, quietFactor(ndc), uQuiet * 0.7);
    vAlpha = aAlpha * fog * near * quiet * uFade;
  }
`;

const LINE_FS = `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor * vAlpha, 1.0);
  }
`;

const DECAL_VS = `
  attribute vec2 aCorner;
  uniform mat4 uVP;
  uniform vec2 uCenter; // world x, z
  uniform float uRadius;
  varying vec2 vUv;
  void main() {
    vec3 world = vec3(uCenter.x + aCorner.x * uRadius, 0.0, uCenter.y + aCorner.y * uRadius);
    gl_Position = uVP * vec4(world, 1.0);
    vUv = aCorner;
  }
`;

const DECAL_FS = `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uMode;  // 0 well pool, 1 bloom ring
  uniform vec2 uParams; // pool: (breath, boost) bloom: (radius, alpha)
  uniform float uFade;
  varying vec2 vUv;
  ${HASH_GLSL}
  void main() {
    float r = length(vUv);
    float edge = 1.0 - smoothstep(0.9, 1.0, r);
    float a = 0.0;
    if (uMode < 0.5) {
      float fill = exp(-r * r * 3.5) * 0.18;
      float d = (r - 0.62) / 0.10;
      float ring = exp(-d * d) * (0.42 * uParams.x + 0.16);
      a = (fill + ring) * (1.0 + uParams.y);
    } else {
      float d = (r - uParams.x) / 0.07;
      a = exp(-d * d) * uParams.y;
    }
    a *= edge * uFade;
    vec3 c = uColor * a;
    c += (hash(gl_FragCoord.xy) - 0.5) * (1.0 / 255.0) * (a * 4.0 + 0.004);
    gl_FragColor = vec4(c, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// small math helpers

function mat4Multiply(
  out: Float32Array,
  a: Float32Array,
  b: Float32Array
): void {
  for (let col = 0; col < 4; col += 1) {
    const b0 = b[col * 4];
    const b1 = b[col * 4 + 1];
    const b2 = b[col * 4 + 2];
    const b3 = b[col * 4 + 3];
    for (let row = 0; row < 4; row += 1) {
      out[col * 4 + row] =
        a[row] * b0 + a[4 + row] * b1 + a[8 + row] * b2 + a[12 + row] * b3;
    }
  }
}

function mat4Perspective(out: Float32Array, aspect: number): void {
  out.fill(0);
  const f = 1 / FOV_TAN;
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (FAR + NEAR) / (NEAR - FAR);
  out[11] = -1;
  out[14] = (2 * FAR * NEAR) / (NEAR - FAR);
}

function mat4RotX(out: Float32Array, a: number): void {
  out.fill(0);
  const c = Math.cos(a);
  const s = Math.sin(a);
  out[0] = 1;
  out[5] = c;
  out[6] = s;
  out[9] = -s;
  out[10] = c;
  out[15] = 1;
}

function mat4Translate(
  out: Float32Array,
  x: number,
  y: number,
  z: number
): void {
  out.fill(0);
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  out[12] = x;
  out[13] = y;
  out[14] = z;
}

function easeOutCubic(t: number): number {
  const u = 1 - t;
  return 1 - u * u * u;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function cubicBezier(
  out: PointPx,
  t: number,
  p0: PointPx,
  p1: PointPx,
  p2: PointPx,
  p3: PointPx
): void {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  out.x = a * p0.x + b * p1.x + c * p2.x + d * p3.x;
  out.y = a * p0.y + b * p1.y + c * p2.y + d * p3.y;
}

// ---------------------------------------------------------------------------

export function createRuntimeBelowEngine(
  canvas: HTMLCanvasElement,
  opts: RuntimeBelowEngineOptions
): RuntimeBelowEngine | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  // ------------------------------------------------------------- gl objects

  interface ProgramInfo {
    program: WebGLProgram;
    attribs: Record<string, number>;
    uniforms: Record<string, WebGLUniformLocation | null>;
  }

  function buildProgram(
    vsSource: string,
    fsSource: string,
    attribs: string[],
    uniforms: string[]
  ): ProgramInfo | null {
    if (!gl) return null;
    const compile = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }
    const info: ProgramInfo = { program, attribs: {}, uniforms: {} };
    for (const name of attribs)
      info.attribs[name] = gl.getAttribLocation(program, name);
    for (const name of uniforms)
      info.uniforms[name] = gl.getUniformLocation(program, name);
    return info;
  }

  let pointProg: ProgramInfo | null = null;
  let lineProg: ProgramInfo | null = null;
  let decalProg: ProgramInfo | null = null;
  let dustBuffer: WebGLBuffer | null = null;
  let floorBuffer: WebGLBuffer | null = null;
  let pulseBuffer: WebGLBuffer | null = null;
  let quadBuffer: WebGLBuffer | null = null;
  let glReady = false;

  // ------------------------------------------------------------- scene state

  let cssW = 0;
  let cssH = 0;
  let dpr = 1;
  let aspect = 1;
  let pitch = 0;
  let horizonFrac = 0.53;
  let quiet = 1;

  let dustData = new Float32Array(0);
  let dustTotal = 0;
  let floorVertexCount = 0;

  const wells: Well[] = WELL_SPECS.map((spec) => ({
    spec,
    world: [0, -10],
    dist: 10,
    bloom: 0,
    bloomT: 1,
    hover: 0,
    px: { x: 0, y: 0 },
    pxW: 1,
  }));

  const pulses: Pulse[] = Array.from({ length: MAX_PULSES }, () => ({
    active: false,
    outbound: true,
    line: 0,
    wellIndex: 0,
    s: 0,
    prevSE: 0,
    dur: 1.6,
    scale: 1,
    from: { x: 0, y: 0 },
    jx: 0,
    jy: 0,
    trail: new Float32Array(TRAIL_CAP * 2),
    trailCount: 0,
    head: { x: 0, y: 0 },
    afterglow: 0,
  }));
  const pulseData = new Float32Array(
    MAX_PULSES * (TRAIL_CAP + 2) * POINT_STRIDE
  );

  interface Scheduled {
    fireAt: number;
    line: number;
    wellIndex: number;
    outbound: boolean;
    from?: PointPx;
  }
  let scheduled: Scheduled[] = [];

  let anchors: EngineAnchors | null = null;
  let cycleWell = 0;
  let cycleStep = 0;
  let skipSteps = 0;
  let nextDispatchAt = 1.9;
  let lastDoubleAt = 0;

  // camera
  let tAccum = 0;
  let fadeT = 0;
  let camX = 0;
  let camY = 0;
  const pointer = { x: 0, y: 0, px: 0, py: 0, has: false, lastMove: 0 };

  // governor: 0 full, 1 reduced, 2 minimal — steps both down and back up
  let tier = 0;
  let emaDt = 16;
  let badFrames = 0;
  let goodFrames = 0;
  let lastTierChange = 0;

  let rafId = 0;
  let lastNow = 0;
  let running = false;
  let resumeOnRestore = false;
  let staticMode = false;
  let destroyed = false;
  let contextLost = false;
  let canvasDocLeft = 0;
  let canvasDocTop = 0;

  const scratchA = new Float32Array(16);
  const scratchB = new Float32Array(16);
  const scratchC = new Float32Array(16);
  const viewProj = new Float32Array(16);
  const bezOut: PointPx = { x: 0, y: 0 };
  const bez = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };

  // ------------------------------------------------------------- camera math

  function computeViewProj(eyeX: number, eyeY: number): void {
    mat4Perspective(scratchA, aspect);
    mat4RotX(scratchB, -pitch);
    mat4Translate(scratchC, -eyeX, -eyeY, -EYE_Z);
    mat4Multiply(viewProj, scratchB, scratchC); // view
    mat4Multiply(scratchC, scratchA, viewProj); // proj * view
    viewProj.set(scratchC);
  }

  function worldToScreen(
    x: number,
    y: number,
    z: number,
    out: PointPx
  ): number {
    const w =
      viewProj[3] * x + viewProj[7] * y + viewProj[11] * z + viewProj[15];
    if (w <= 0.001) return 0;
    const cx =
      viewProj[0] * x + viewProj[4] * y + viewProj[8] * z + viewProj[12];
    const cy =
      viewProj[1] * x + viewProj[5] * y + viewProj[9] * z + viewProj[13];
    out.x = ((cx / w + 1) / 2) * cssW;
    out.y = ((1 - cy / w) / 2) * cssH;
    return w;
  }

  /** Cast a pixel ray from the rest camera onto the floor plane (y = 0). */
  function screenToFloor(px: number, py: number): [number, number] | null {
    const ndcX = (px / cssW) * 2 - 1;
    const ndcY = 1 - (py / cssH) * 2;
    const vx = ndcX * FOV_TAN * aspect;
    const vy = ndcY * FOV_TAN;
    const c = Math.cos(pitch);
    const s = Math.sin(pitch);
    const dy = c * vy + s;
    const dz = s * vy - c;
    if (dy >= -0.002) return null;
    const t = -EYE_HEIGHT / dy;
    return [vx * t, EYE_Z + dz * t];
  }

  // ------------------------------------------------------------- scene build

  function buildFloor(): void {
    if (!gl || !floorBuffer) return;
    const extentX = Math.min(72, Math.max(42, 26 * aspect));
    const verts: number[] = [];
    const push = (
      x1: number,
      z1: number,
      x2: number,
      z2: number,
      alpha: number
    ) => {
      verts.push(x1, 0, z1, alpha, x2, 0, z2, alpha);
    };
    // lines running away from the camera, chunked so the exponential fog
    // stays honest under linear varying interpolation
    let index = 0;
    for (let x = -extentX; x <= extentX + 0.01; x += GRID_STEP, index += 1) {
      const alpha = index % 5 === 0 ? 0.44 : 0.26;
      for (let z = GRID_NEAR_Z; z > GRID_FAR_Z; z -= GRID_CHUNK) {
        push(x, z, x, Math.max(z - GRID_CHUNK, GRID_FAR_Z), alpha);
      }
    }
    // cross lines
    index = 0;
    for (let z = GRID_NEAR_Z; z > GRID_FAR_Z; z -= GRID_STEP, index += 1) {
      const alpha = index % 5 === 0 ? 0.44 : 0.26;
      for (let x = -extentX; x < extentX; x += GRID_CHUNK) {
        push(x, z, Math.min(x + GRID_CHUNK, extentX), z, alpha);
      }
    }
    const data = new Float32Array(verts);
    floorVertexCount = data.length / 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, floorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  function buildDust(): void {
    if (!gl || !dustBuffer) return;
    const area = cssW * cssH;
    dustTotal = Math.round(
      Math.min(760, Math.max(180, (area / (1440 * 900)) * 620))
    );
    const nearBand = Math.round(dustTotal * 0.08);
    dustData = new Float32Array(dustTotal * POINT_STRIDE);
    for (let i = 0; i < dustTotal; i += 1) {
      const off = i * POINT_STRIDE;
      const near = i < nearBand;
      // near-camera motes carry the strongest parallax; the rest fill the hall
      const z = near ? rand(3.6, 4.6) : rand(-34, 3.2);
      const x =
        rand(-1, 1) * (near ? 7 : Math.min(30, 12 + (EYE_Z - z) * 0.55));
      const y = near ? rand(0.4, 4.2) : rand(0.15, 6.8);
      const blue = Math.random() < 0.3;
      dustData[off] = x;
      dustData[off + 1] = y;
      dustData[off + 2] = z;
      dustData[off + 3] = blue ? 0.376 : 0.553;
      dustData[off + 4] = blue ? 0.647 : 0.965;
      dustData[off + 5] = blue ? 0.98 : 1.0;
      dustData[off + 6] = near ? rand(0.1, 0.2) : rand(0.1, 0.34);
      dustData[off + 7] = rand(16, 46); // css px at w = 1, divided by w in shader
      dustData[off + 8] = 0; // kind: world dust
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, dustBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, dustData, gl.STATIC_DRAW);
  }

  function placeWells(): void {
    computeViewProj(0, EYE_HEIGHT);
    const panel = anchors?.panel;
    for (const well of wells) {
      let px = well.spec.screenFrac[0] * cssW;
      let py = well.spec.screenFrac[1] * cssH;
      // the browser well doubles as the code window's reflection pool — the
      // story on screen already runs in the browser, so its runtime sits
      // directly beneath the panel, half-tucked under its bottom edge
      if (well.spec.runtime === QpqRuntime.browser && panel) {
        px = (panel.x0 + panel.x1) / 2;
        py = Math.min(panel.y1 + (panel.y1 - panel.y0) * 0.08, cssH * 0.96);
      }
      const hit = screenToFloor(px, py);
      if (hit) {
        well.world = hit;
        well.dist = Math.hypot(hit[0], EYE_HEIGHT, hit[1] - EYE_Z);
      }
    }
  }

  function refreshAnchors(): void {
    anchors = opts.getAnchors();
  }

  // ------------------------------------------------------------- pulse logic

  function anchorFor(line: number): PointPx {
    const pt = anchors?.yieldPoints[line];
    if (pt) return { x: pt.x, y: pt.y };
    // no DOM anchor (narrow layout): pulses skim in from just under the
    // horizon, center-right — never over the stacked copy
    return { x: cssW * 0.8, y: cssH * horizonFrac + 20 };
  }

  function pulseCap(): number {
    return tier === 0 ? MAX_PULSES : tier === 1 ? 4 : 3;
  }

  function spawnPulse(
    line: number,
    wellIndex: number,
    outbound: boolean,
    from?: PointPx
  ): void {
    // prefer slots whose afterglow trail has fully faded so we never clip one
    let pulse: Pulse | null = null;
    let activeCount = 0;
    for (const p of pulses) {
      if (p.active) activeCount += 1;
      else if (!pulse || (pulse.trailCount > 0 && p.trailCount === 0))
        pulse = p;
    }
    if (!pulse || activeCount >= pulseCap()) return;
    pulse.active = true;
    pulse.outbound = outbound;
    pulse.line = line;
    pulse.wellIndex = wellIndex;
    pulse.s = 0;
    pulse.prevSE = 0;
    pulse.dur = outbound ? rand(1.5, 2.0) : rand(1.15, 1.4);
    pulse.scale = outbound ? 1 : 0.62;
    pulse.from = from ?? anchorFor(line);
    pulse.jx = rand(-1, 1);
    pulse.jy = rand(-1, 1);
    pulse.trailCount = 0;
    pulse.afterglow = 0;
    if (outbound) opts.onDispatched?.(line);
  }

  /**
   * Control points are re-derived every frame from the live endpoints: the
   * DOM anchor is fixed in canvas space while the well's screen position
   * parallaxes with the camera, so pulses stay glued to both no matter how
   * the camera sways or the viewport resizes mid-flight.
   */
  function shapePath(pulse: Pulse): void {
    const well = wells[pulse.wellIndex];
    if (pulse.outbound) {
      bez.p0.x = pulse.from.x;
      bez.p0.y = pulse.from.y;
      bez.p3.x = well.px.x;
      bez.p3.y = well.px.y;
      const dx = bez.p3.x - bez.p0.x;
      const dy = bez.p3.y - bez.p0.y;
      // launch gently left of the window, then dive angled back toward the
      // origin side — keeps far-left flights out of the CTA column
      bez.p1.x = bez.p0.x + dx * 0.1 - 46 - pulse.jx * 20;
      bez.p1.y = bez.p0.y + dy * 0.08 - 42 - pulse.jy * 18;
      bez.p2.x = bez.p3.x + (bez.p0.x - bez.p3.x) * 0.22 + pulse.jx * 22;
      bez.p2.y = bez.p3.y - Math.max(90, Math.abs(dy) * 0.5);
    } else {
      bez.p0.x = well.px.x;
      bez.p0.y = well.px.y;
      bez.p3.x = pulse.from.x + 4;
      bez.p3.y = pulse.from.y;
      const dist = Math.hypot(bez.p3.x - bez.p0.x, bez.p3.y - bez.p0.y);
      bez.p1.x = bez.p0.x + pulse.jx * 26;
      bez.p1.y = bez.p0.y - Math.max(110, dist * 0.55);
      bez.p2.x = bez.p3.x - 80;
      bez.p2.y = bez.p3.y + 46;
    }
  }

  function pushTrailPoint(pulse: Pulse, x: number, y: number): void {
    const count = pulse.trailCount;
    if (count > 0) {
      const lastIndex = ((count - 1) % TRAIL_CAP) * 2;
      const dx = x - pulse.trail[lastIndex];
      const dy = y - pulse.trail[lastIndex + 1];
      if (dx * dx + dy * dy < TRAIL_SPACING_PX * TRAIL_SPACING_PX) return;
    }
    const slot = (count % TRAIL_CAP) * 2;
    pulse.trail[slot] = x;
    pulse.trail[slot + 1] = y;
    pulse.trailCount = count + 1;
  }

  function advancePulse(pulse: Pulse, dt: number, t: number): void {
    pulse.s = Math.min(pulse.s + dt / pulse.dur, 1);
    const se = easeInOutCubic(pulse.s);
    shapePath(pulse);
    // sample intermediate positions so fast segments never leave trail gaps
    for (let k = pulse.prevSE; k < se; k += 0.016) {
      cubicBezier(bezOut, k, bez.p0, bez.p1, bez.p2, bez.p3);
      pushTrailPoint(pulse, bezOut.x, bezOut.y);
    }
    cubicBezier(bezOut, se, bez.p0, bez.p1, bez.p2, bez.p3);
    pushTrailPoint(pulse, bezOut.x, bezOut.y);
    pulse.head.x = bezOut.x;
    pulse.head.y = bezOut.y;
    pulse.prevSE = se;

    if (pulse.s >= 1) {
      pulse.active = false;
      const well = wells[pulse.wellIndex];
      if (pulse.outbound) {
        well.bloom = 1;
        well.bloomT = 0;
        opts.onExecuted?.(well.spec.runtime);
        scheduled.push({
          fireAt: t + rand(0.4, 0.9),
          line: pulse.line,
          wellIndex: pulse.wellIndex,
          outbound: false,
          from: pulse.from,
        });
      } else {
        opts.onReturned?.(pulse.line, well.spec.runtime);
      }
    }
  }

  /**
   * The conductor: the same three-yield story runs on lambda, then node,
   * then browser — one platform per cycle, every yield line diving into
   * that cycle's well.
   */
  function runScheduler(t: number): void {
    for (let i = scheduled.length - 1; i >= 0; i -= 1) {
      const item = scheduled[i];
      if (item.fireAt <= t) {
        scheduled.splice(i, 1);
        spawnPulse(item.line, item.wellIndex, item.outbound, item.from);
      }
    }
    if (t < nextDispatchAt) return;
    refreshAnchors();
    placeWells();
    if (skipSteps > 0) {
      skipSteps -= 1;
    } else {
      spawnPulse(cycleStep, cycleWell, true);
      // occasional overlapping double-dispatch — a quiet askMapParallel nod
      if (
        cycleStep === 1 &&
        tier === 0 &&
        t - lastDoubleAt > 18 &&
        Math.random() < 0.3
      ) {
        scheduled.push({
          fireAt: t + 0.45,
          line: 2,
          wellIndex: cycleWell,
          outbound: true,
        });
        skipSteps = 1;
        lastDoubleAt = t;
      }
    }
    cycleStep += 1;
    if (cycleStep >= 3) {
      cycleStep = 0;
      cycleWell = (cycleWell + 1) % 3;
      nextDispatchAt = t + rand(2.6, 3.6);
    } else {
      nextDispatchAt = t + rand(1.7, 2.3);
    }
  }

  // ------------------------------------------------------------- rendering

  function fillPulseVBO(): number {
    let n = 0;
    const put = (
      x: number,
      y: number,
      r: number,
      g: number,
      b: number,
      a: number,
      size: number
    ) => {
      const off = n * POINT_STRIDE;
      pulseData[off] = (x / cssW) * 2 - 1;
      pulseData[off + 1] = 1 - (y / cssH) * 2;
      pulseData[off + 2] = 0;
      pulseData[off + 3] = r;
      pulseData[off + 4] = g;
      pulseData[off + 5] = b;
      pulseData[off + 6] = a;
      pulseData[off + 7] = size;
      pulseData[off + 8] = 1; // kind: screen-space
      n += 1;
    };
    for (const pulse of pulses) {
      if (!pulse.active && pulse.trailCount === 0) continue;
      const linger = pulse.active ? 1 : Math.max(0, 1 - pulse.afterglow / 0.5);
      if (linger <= 0) {
        pulse.trailCount = 0;
        continue;
      }
      const stored = Math.min(pulse.trailCount, TRAIL_CAP);
      for (let k = 0; k < stored; k += 1) {
        const slot = ((pulse.trailCount - 1 - k) % TRAIL_CAP) * 2;
        const fade = Math.pow(1 - k / stored, 1.2) * linger;
        const mixK = Math.min(1, k / 10);
        let r = 0.525;
        let g = 0.937;
        let b = 0.675;
        if (pulse.outbound) {
          // head #8df6ff cooling to #22d3ee along the tail
          r = 0.553 - 0.42 * mixK;
          g = 0.965 - 0.14 * mixK;
          b = 1.0 - 0.07 * mixK;
        }
        put(
          pulse.trail[slot],
          pulse.trail[slot + 1],
          r,
          g,
          b,
          1.0 * fade,
          (10 - 6.5 * (k / stored)) * pulse.scale
        );
      }
      if (pulse.active) {
        const halo = pulse.outbound ? 0.553 : 0.66;
        put(
          pulse.head.x,
          pulse.head.y,
          halo,
          pulse.outbound ? 0.965 : 0.98,
          pulse.outbound ? 1.0 : 0.78,
          0.26,
          32 * pulse.scale
        );
        put(
          pulse.head.x,
          pulse.head.y,
          0.92,
          1.0,
          1.0,
          0.95,
          9.5 * pulse.scale
        );
      }
    }
    return n;
  }

  function bindPointAttribs(prog: ProgramInfo): void {
    if (!gl) return;
    const stride = POINT_STRIDE * 4;
    gl.enableVertexAttribArray(prog.attribs.aPos);
    gl.vertexAttribPointer(prog.attribs.aPos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(prog.attribs.aTint);
    gl.vertexAttribPointer(prog.attribs.aTint, 4, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(prog.attribs.aMeta);
    gl.vertexAttribPointer(prog.attribs.aMeta, 2, gl.FLOAT, false, stride, 28);
  }

  function drawDecal(
    world: [number, number],
    radius: number,
    color: [number, number, number],
    colorScale: number,
    mode: number,
    p0: number,
    p1: number,
    fade: number
  ): void {
    if (!gl || !decalProg) return;
    gl.uniform2f(decalProg.uniforms.uCenter, world[0], world[1]);
    gl.uniform1f(decalProg.uniforms.uRadius, radius);
    gl.uniform3f(
      decalProg.uniforms.uColor,
      color[0] * colorScale,
      color[1] * colorScale,
      color[2] * colorScale
    );
    gl.uniform1f(decalProg.uniforms.uMode, mode);
    gl.uniform2f(decalProg.uniforms.uParams, p0, p1);
    gl.uniform1f(decalProg.uniforms.uFade, fade);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function render(t: number, fade: number): void {
    if (!gl || !glReady || !pointProg || !lineProg || !decalProg) return;

    gl.clear(gl.COLOR_BUFFER_BIT);

    // floor lattice
    gl.useProgram(lineProg.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, floorBuffer);
    gl.enableVertexAttribArray(lineProg.attribs.aPos);
    gl.vertexAttribPointer(lineProg.attribs.aPos, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(lineProg.attribs.aAlpha);
    gl.vertexAttribPointer(lineProg.attribs.aAlpha, 1, gl.FLOAT, false, 16, 12);
    gl.uniformMatrix4fv(lineProg.uniforms.uVP, false, viewProj);
    gl.uniform1f(lineProg.uniforms.uFade, fade);
    gl.uniform1f(lineProg.uniforms.uQuiet, quiet);
    gl.uniform3f(lineProg.uniforms.uColor, 0.49, 0.827, 0.988);
    gl.drawArrays(gl.LINES, 0, floorVertexCount);

    // floor decals: well pools and landing bloom rings
    gl.useProgram(decalProg.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(decalProg.attribs.aCorner);
    gl.vertexAttribPointer(decalProg.attribs.aCorner, 2, gl.FLOAT, false, 8, 0);
    gl.uniformMatrix4fv(decalProg.uniforms.uVP, false, viewProj);
    for (let i = 0; i < wells.length; i += 1) {
      const well = wells[i];
      const distFade = Math.exp(-well.dist * 0.022);
      const breath = staticMode
        ? 1
        : 0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / 7 + i * 2.1);
      const boost =
        (cycleWell === i && !staticMode ? 0.16 : 0) +
        well.hover * 0.35 +
        well.bloom * 0.4 +
        (1 - distFade) * 0.5;
      drawDecal(
        well.world,
        well.spec.quadRadius,
        well.spec.color,
        distFade,
        0,
        breath,
        boost,
        fade
      );
      if (well.bloom > 0.015) {
        const ringR =
          0.28 + easeOutCubic(Math.min(well.bloomT / 0.9, 1)) * 0.62;
        drawDecal(
          well.world,
          well.spec.quadRadius * 1.6,
          well.spec.color,
          distFade,
          1,
          ringR,
          well.bloom * 0.5,
          fade
        );
      }
    }

    // dust
    gl.useProgram(pointProg.program);
    gl.uniformMatrix4fv(pointProg.uniforms.uVP, false, viewProj);
    gl.uniform1f(pointProg.uniforms.uTime, t);
    gl.uniform1f(pointProg.uniforms.uDpr, dpr);
    gl.uniform1f(pointProg.uniforms.uFade, fade);
    gl.uniform1f(pointProg.uniforms.uQuiet, quiet);
    gl.bindBuffer(gl.ARRAY_BUFFER, dustBuffer);
    bindPointAttribs(pointProg);
    const dustDraw = Math.round(
      dustTotal * (tier === 0 ? 1 : tier === 1 ? 0.6 : 0.35)
    );
    gl.drawArrays(gl.POINTS, 0, dustDraw);

    // pulses
    const pulsePoints = fillPulseVBO();
    if (pulsePoints > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, pulseBuffer);
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        pulseData.subarray(0, pulsePoints * POINT_STRIDE)
      );
      bindPointAttribs(pointProg);
      gl.drawArrays(gl.POINTS, 0, pulsePoints);
    }
  }

  // ------------------------------------------------------------- frame loop

  function frame(now: number): void {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    if (dt <= 0) return;
    tAccum += dt;
    fadeT = Math.min(fadeT + dt, 1.2);

    // governor: step down on sustained overruns, recover when healthy.
    // thresholds straddle the 60Hz frame budget (16.7ms) so a vsync'd 60fps
    // display can actually reach the recovery band, with a wide hysteresis
    // gap so marginal machines settle instead of oscillating
    emaDt = emaDt * 0.95 + dt * 1000 * 0.05;
    if (emaDt > 25) {
      badFrames += 1;
      goodFrames = 0;
    } else {
      badFrames = 0;
      if (emaDt < 17.5) goodFrames += 1;
    }
    if (badFrames > 90 && tier < 2 && tAccum - lastTierChange > 4) {
      tier += 1;
      badFrames = 0;
      lastTierChange = tAccum;
      if (tier === 2) resize();
    } else if (goodFrames > 600 && tier > 0 && tAccum - lastTierChange > 12) {
      tier -= 1;
      goodFrames = 0;
      lastTierChange = tAccum;
      if (tier === 1) resize();
    }

    // scheduler first — placeWells() borrows viewProj for its rest-camera
    // solve, so the swayed camera below must be computed after it
    runScheduler(tAccum);

    // camera: lissajous drift + damped pointer chase, translation only
    const idleMs = pointer.has ? now - pointer.lastMove : Infinity;
    const idleK = idleMs < 3000 ? 1 : Math.max(0, 1 - (idleMs - 3000) / 2000);
    const targetX =
      0.3 * Math.sin((tAccum * 2 * Math.PI) / 23) + pointer.x * 0.38 * idleK;
    const targetY =
      0.13 * Math.sin((tAccum * 2 * Math.PI) / 26 + 1.7) -
      pointer.y * 0.18 * idleK;
    const chase = 1 - Math.exp(-2.5 * dt);
    camX += (targetX - camX) * chase;
    camY += (targetY - camY) * chase;
    computeViewProj(camX, EYE_HEIGHT + camY);

    for (const well of wells) {
      well.pxW = worldToScreen(well.world[0], 0, well.world[1], well.px);
      well.bloomT += dt;
      well.bloom *= Math.pow(0.02, dt);
      // hover: pools ease brighter when the pointer drifts near them
      let hoverTarget = 0;
      if (pointer.has && idleMs < 4000) {
        const d = Math.hypot(pointer.px - well.px.x, pointer.py - well.px.y);
        if (d < 130) hoverTarget = 1 - d / 130;
      }
      well.hover += (hoverTarget - well.hover) * chase;
    }
    // hovering the code window nudges the next dispatch, as if it noticed
    const panel = anchors?.panel;
    if (
      panel &&
      pointer.has &&
      idleMs < 200 &&
      pointer.px > panel.x0 &&
      pointer.px < panel.x1 &&
      pointer.py > panel.y0 &&
      pointer.py < panel.y1 &&
      !pulses.some((p) => p.active) &&
      nextDispatchAt > tAccum + 0.5
    ) {
      nextDispatchAt = tAccum + 0.45;
    }

    for (const pulse of pulses) {
      if (pulse.active) advancePulse(pulse, dt, tAccum);
      else if (pulse.trailCount > 0) pulse.afterglow += dt;
    }

    render(tAccum, easeOutCubic(Math.min(fadeT / 1.2, 1)));
  }

  // ------------------------------------------------------------- lifecycle

  function initGL(): boolean {
    if (!gl) return false;
    pointProg = buildProgram(
      POINT_VS,
      POINT_FS,
      ['aPos', 'aTint', 'aMeta'],
      ['uVP', 'uTime', 'uDpr', 'uFade', 'uQuiet']
    );
    lineProg = buildProgram(
      LINE_VS,
      LINE_FS,
      ['aPos', 'aAlpha'],
      ['uVP', 'uFade', 'uQuiet', 'uColor']
    );
    decalProg = buildProgram(
      DECAL_VS,
      DECAL_FS,
      ['aCorner'],
      ['uVP', 'uCenter', 'uRadius', 'uColor', 'uMode', 'uParams', 'uFade']
    );
    if (!pointProg || !lineProg || !decalProg) return false;
    dustBuffer = gl.createBuffer();
    floorBuffer = gl.createBuffer();
    pulseBuffer = gl.createBuffer();
    quadBuffer = gl.createBuffer();
    if (!dustBuffer || !floorBuffer || !pulseBuffer || !quadBuffer)
      return false;
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, pulseBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pulseData.byteLength, gl.DYNAMIC_DRAW);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0x03 / 255, 0x06 / 255, 0x09 / 255, 1);
    glReady = true;
    return true;
  }

  function resize(): void {
    if (!gl || !glReady) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const sizeChanged =
      rect.width !== cssW || Math.max(rect.height, 1) !== cssH;
    cssW = rect.width;
    cssH = Math.max(rect.height, 1);
    aspect = cssW / cssH;
    canvasDocLeft = rect.left;
    canvasDocTop = rect.top + window.scrollY;
    // match the css media query (viewport width), not the wrap width — a
    // scrollbar-wide mismatch would double the horizon band
    const isNarrow = window.innerWidth <= 960;
    let cap = Math.min(window.devicePixelRatio || 1, 2);
    if (cssW > 2560 || isNarrow || tier === 2) cap = Math.min(cap, 1.5);
    if (cssW <= 400) cap = Math.min(cap, 1.25);
    dpr = cap;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);

    horizonFrac = isNarrow ? 0.62 : 0.53;
    pitch = Math.atan(-(1 - 2 * horizonFrac) * FOV_TAN);
    quiet = isNarrow ? 0 : 1;

    buildFloor();
    buildDust();
    refreshAnchors();
    placeWells();

    // re-glue in-flight pulses to the reflowed DOM: refresh their origin from
    // the live anchors and drop stale-position trails (the governor's
    // same-size resize() calls skip this so trails aren't blanked for nothing)
    if (sizeChanged && !staticMode) {
      for (const pulse of pulses) {
        if (!pulse.active && pulse.trailCount === 0) continue;
        const fresh = anchorFor(pulse.line);
        pulse.from.x = fresh.x;
        pulse.from.y = fresh.y;
        pulse.trailCount = 0;
      }
      for (const item of scheduled) {
        if (item.from) {
          const fresh = anchorFor(item.line);
          item.from.x = fresh.x;
          item.from.y = fresh.y;
        }
      }
    }
  }

  function start(): void {
    if (rafId || destroyed || contextLost || staticMode || opts.reducedMotion)
      return;
    lastNow = performance.now();
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function stop(): void {
    running = false;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  /**
   * prefers-reduced-motion: one composed long-exposure frame — comets frozen
   * mid-flight with full trails, wells at peak breath — then no RAF at all.
   */
  function renderStaticFrame(): void {
    if (!gl || !glReady || destroyed || contextLost) return;
    staticMode = true;
    stop();
    // callers (engine init, wrapper refresh, context restore) have already
    // run resize(); rebuilding the scene again here would double the work
    refreshAnchors();
    placeWells();
    computeViewProj(0, EYE_HEIGHT);
    for (const well of wells) {
      well.pxW = worldToScreen(well.world[0], 0, well.world[1], well.px);
      well.bloom = 0;
      well.hover = 0;
    }
    for (const pulse of pulses) pulse.active = false;
    const frozenS = [0.3, 0.55, 0.8];
    for (let i = 0; i < 3; i += 1) {
      const pulse = pulses[i];
      pulse.active = true;
      pulse.outbound = true;
      pulse.line = i;
      pulse.wellIndex = i;
      pulse.dur = 1;
      pulse.scale = 1;
      pulse.s = frozenS[i];
      pulse.prevSE = 0;
      pulse.jx = [0.4, -0.6, 0.1][i];
      pulse.jy = [-0.3, 0.5, 0.2][i];
      pulse.from = anchorFor(i);
      pulse.trailCount = 0;
      pulse.afterglow = 0;
      const se = easeInOutCubic(pulse.s);
      shapePath(pulse);
      for (let k = 0; k <= se; k += 0.012) {
        cubicBezier(bezOut, k, bez.p0, bez.p1, bez.p2, bez.p3);
        pushTrailPoint(pulse, bezOut.x, bezOut.y);
      }
      pulse.head.x = bezOut.x;
      pulse.head.y = bezOut.y;
    }
    const ret = pulses[3];
    ret.active = true;
    ret.outbound = false;
    ret.line = 1;
    ret.wellIndex = 1;
    ret.dur = 1;
    ret.scale = 0.62;
    ret.s = 0.5;
    ret.prevSE = 0;
    ret.jx = 0.3;
    ret.jy = 0;
    ret.from = anchorFor(1);
    ret.trailCount = 0;
    shapePath(ret);
    const retSE = easeInOutCubic(ret.s);
    for (let k = 0; k <= retSE; k += 0.012) {
      cubicBezier(bezOut, k, bez.p0, bez.p1, bez.p2, bez.p3);
      pushTrailPoint(ret, bezOut.x, bezOut.y);
    }
    ret.head.x = bezOut.x;
    ret.head.y = bezOut.y;
    render(3.0, 1);
  }

  function onContextLost(event: Event): void {
    event.preventDefault();
    contextLost = true;
    glReady = false;
    // stop() wipes `running`, so snapshot it or restore can never resume
    resumeOnRestore = running;
    stop();
  }

  function onContextRestored(): void {
    contextLost = false;
    if (destroyed) return;
    if (initGL()) {
      resize();
      if (staticMode) {
        staticMode = false;
        renderStaticFrame();
      } else if (resumeOnRestore) {
        start();
      }
    }
    resumeOnRestore = false;
  }

  function onPointerMove(event: PointerEvent): void {
    if (!rafId) return; // paused engines shouldn't pay for pointer tracking
    if (event.pointerType && event.pointerType !== 'mouse') return;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    // canvas-relative via the doc-space origin cached at resize — reading a
    // live getBoundingClientRect() here would force layout on every event
    pointer.px = event.clientX - canvasDocLeft;
    pointer.py = event.clientY - (canvasDocTop - window.scrollY);
    pointer.has = true;
    pointer.lastMove = performance.now();
  }

  function destroy(): void {
    destroyed = true;
    stop();
    window.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    if (gl && glReady) {
      for (const buffer of [dustBuffer, floorBuffer, pulseBuffer, quadBuffer]) {
        if (buffer) gl.deleteBuffer(buffer);
      }
      for (const prog of [pointProg, lineProg, decalProg]) {
        if (prog) gl.deleteProgram(prog.program);
      }
    }
    glReady = false;
  }

  if (!initGL()) return null;
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  if (!opts.reducedMotion)
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  resize();

  return { start, stop, resize, renderStaticFrame, destroy };
}
