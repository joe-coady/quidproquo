import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Animated hero backdrop: a faint grid lattice with glowing "light cycle"
 * trails that travel along the grid lines, turning at intersections.
 *
 * Two stacked canvases: a static grid layer (redrawn on resize only) and a
 * trail layer that is fully cleared and redrawn every frame from each snake's
 * recorded polyline — alpha falls off with distance from the head, so tails
 * end cleanly and nothing accumulates on screen.
 */

const CELL = 44;

enum Heading {
  right = 0,
  down = 1,
  left = 2,
  up = 3,
}

const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

interface Tone {
  rgb: string; // "r, g, b" for building rgba() stops
  weight: number;
}

const TONES: Tone[] = [
  { rgb: '141, 246, 255', weight: 6 },
  { rgb: '169, 200, 255', weight: 3 },
  { rgb: '255, 208, 163', weight: 1 },
];

interface Point {
  x: number;
  y: number;
}

interface Snake {
  heading: Heading;
  speed: number;
  distToNode: number;
  tone: Tone;
  lineWidth: number;
  comet: boolean;
  trailLength: number;
  /** Polyline vertices, oldest first; the last element is the moving head. */
  trail: Point[];
}

interface Spark {
  x: number;
  y: number;
  age: number;
  tone: Tone;
}

const SPARK_LIFE = 0.45;

function pickTone(): Tone {
  const total = TONES.reduce((sum, tone) => sum + tone.weight, 0);
  let roll = Math.random() * total;
  for (const tone of TONES) {
    roll -= tone.weight;
    if (roll <= 0) return tone;
  }
  return TONES[0];
}

function spawnSnake(width: number, height: number, comet: boolean): Snake {
  const cols = Math.max(1, Math.floor(width / CELL));
  const rows = Math.max(1, Math.floor(height / CELL));
  const x = Math.round(Math.random() * cols) * CELL;
  const y = Math.round(Math.random() * rows) * CELL;
  const speed = comet ? 420 + Math.random() * 160 : 90 + Math.random() * 150;
  return {
    heading: Math.floor(Math.random() * 4) as Heading,
    speed,
    distToNode: CELL,
    tone: comet ? TONES[0] : pickTone(),
    lineWidth: comet ? 1.2 : 1.7,
    comet,
    trailLength: Math.min(420, Math.max(150, speed * 0.9)),
    trail: [
      { x, y },
      { x, y },
    ],
  };
}

function turnLeftOrRight(heading: Heading): Heading {
  return ((heading + (Math.random() < 0.5 ? 1 : 3)) % 4) as Heading;
}

/** Keep a snake pointed somewhere that stays on the board and off blocked ground. */
function steerInside(
  snake: Snake,
  head: Point,
  width: number,
  height: number,
  blocked: (x: number, y: number) => boolean
): boolean {
  for (let attempts = 0; attempts < 4; attempts += 1) {
    const nextX = head.x + DX[snake.heading] * CELL;
    const nextY = head.y + DY[snake.heading] * CELL;
    const margin = CELL * 1.5;
    if (
      nextX >= -margin &&
      nextX <= width + margin &&
      nextY >= -margin &&
      nextY <= height + margin &&
      !blocked(nextX, nextY)
    ) {
      return true;
    }
    snake.heading = turnLeftOrRight(snake.heading);
  }
  return false;
}

/** Drop vertices beyond the trail length, sliding the tail vertex smoothly. */
function trimTrail(snake: Snake): void {
  const { trail } = snake;
  let remaining = snake.trailLength;
  for (let i = trail.length - 1; i > 0; i -= 1) {
    const a = trail[i];
    const b = trail[i - 1];
    const segment = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    if (segment >= remaining) {
      const t = remaining / segment;
      b.x = a.x + (b.x - a.x) * t;
      b.y = a.y + (b.y - a.y) * t;
      trail.splice(0, i - 1);
      return;
    }
    remaining -= segment;
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);

  for (let x = 0; x <= width + CELL; x += CELL) {
    const major = Math.round(x / CELL) % 5 === 0;
    ctx.strokeStyle = major
      ? 'rgba(125, 211, 252, 0.12)'
      : 'rgba(125, 211, 252, 0.065)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height + CELL; y += CELL) {
    const major = Math.round(y / CELL) % 5 === 0;
    ctx.strokeStyle = major
      ? 'rgba(125, 211, 252, 0.12)'
      : 'rgba(125, 211, 252, 0.065)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(148, 210, 255, 0.16)';
  for (let x = 0; x <= width + CELL; x += CELL) {
    for (let y = 0; y <= height + CELL; y += CELL) {
      ctx.fillRect(x - 0.5, y - 0.5, 1.5, 1.5);
    }
  }
}

interface TronGridProps {
  /** Element the light cycles must route around instead of passing behind. */
  avoidRef?: RefObject<HTMLElement | null>;
}

export function TronGrid({ avoidRef }: TronGridProps = {}) {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gridCanvas = gridRef.current;
    const trailCanvas = trailRef.current;
    const wrap = wrapRef.current;
    if (!gridCanvas || !trailCanvas || !wrap) return;

    const gridCtx = gridCanvas.getContext('2d');
    const trailCtx = trailCanvas.getContext('2d');
    if (!gridCtx || !trailCtx) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = 0;
    let height = 0;
    let snakes: Snake[] = [];
    let sparks: Spark[] = [];
    let rafId = 0;
    let lastTime = 0;
    let inView = true;
    let avoid: { x0: number; y0: number; x1: number; y1: number } | null = null;

    const blockedAt = (x: number, y: number) =>
      !!avoid && x > avoid.x0 && x < avoid.x1 && y > avoid.y0 && y < avoid.y1;

    const spawnClear = (comet: boolean): Snake => {
      for (let tries = 0; tries < 24; tries += 1) {
        const snake = spawnSnake(width, height, comet);
        if (!blockedAt(snake.trail[0].x, snake.trail[0].y)) return snake;
      }
      return spawnSnake(width, height, comet);
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const avoidEl = avoidRef?.current;
      if (avoidEl) {
        const r = avoidEl.getBoundingClientRect();
        const pad = CELL * 0.5;
        avoid = {
          x0: r.left - rect.left - pad,
          y0: r.top - rect.top - pad,
          x1: r.right - rect.left + pad,
          y1: r.bottom - rect.top + pad,
        };
      } else {
        avoid = null;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      for (const canvas of [gridCanvas, trailCanvas]) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      drawGrid(gridCtx, width, height);

      const target = Math.min(
        13,
        Math.max(6, Math.round((width * height) / 130000))
      );
      snakes = Array.from({ length: target }, (_, index) =>
        spawnClear(index < 2)
      );
      sparks = [];
    };

    const stepSnake = (snake: Snake, dt: number) => {
      let remaining = snake.speed * dt;
      while (remaining > 0) {
        const head = snake.trail[snake.trail.length - 1];
        const step = Math.min(remaining, snake.distToNode);
        head.x += DX[snake.heading] * step;
        head.y += DY[snake.heading] * step;
        snake.distToNode -= step;
        remaining -= step;

        if (snake.distToNode <= 0.001) {
          snake.distToNode = CELL;
          const headingBefore = snake.heading;
          const turnChance = snake.comet ? 0.2 : 0.42;
          if (Math.random() < turnChance) {
            snake.heading = turnLeftOrRight(snake.heading);
          }
          const clear = steerInside(snake, head, width, height, blockedAt);
          // any heading change needs a corner vertex, or the next segment draws diagonally
          if (snake.heading !== headingBefore) {
            snake.trail.push({ x: head.x, y: head.y });
            sparks.push({ x: head.x, y: head.y, age: 0, tone: snake.tone });
          }
          // boxed in (or caught inside a newly-measured avoid zone): derez and respawn
          if (!clear || blockedAt(head.x, head.y)) {
            Object.assign(snake, spawnClear(snake.comet));
            return;
          }
          if (!snake.comet && Math.random() < 0.012) {
            Object.assign(snake, spawnClear(false));
            return;
          }
        }
      }
      trimTrail(snake);
    };

    const drawSnake = (snake: Snake) => {
      const { trail, tone } = snake;
      const maxAlpha = snake.comet ? 0.95 : 0.8;
      let cumulative = 0;

      for (let i = trail.length - 1; i > 0; i -= 1) {
        const near = trail[i];
        const far = trail[i - 1];
        const segment = Math.abs(near.x - far.x) + Math.abs(near.y - far.y);
        if (segment < 0.01) continue;

        const alphaNear =
          maxAlpha * Math.max(0, 1 - cumulative / snake.trailLength);
        const alphaFar =
          maxAlpha *
          Math.max(0, 1 - (cumulative + segment) / snake.trailLength);
        const gradient = trailCtx.createLinearGradient(
          near.x,
          near.y,
          far.x,
          far.y
        );
        gradient.addColorStop(0, `rgba(${tone.rgb}, ${alphaNear})`);
        gradient.addColorStop(1, `rgba(${tone.rgb}, ${alphaFar})`);

        // halo pass then core pass — glow that fades with the trail
        trailCtx.strokeStyle = gradient;
        trailCtx.lineCap = 'round';
        trailCtx.globalAlpha = 0.28;
        trailCtx.lineWidth = snake.lineWidth + 4.5;
        trailCtx.beginPath();
        trailCtx.moveTo(near.x, near.y);
        trailCtx.lineTo(far.x, far.y);
        trailCtx.stroke();

        trailCtx.globalAlpha = 1;
        trailCtx.lineWidth = snake.lineWidth;
        trailCtx.beginPath();
        trailCtx.moveTo(near.x, near.y);
        trailCtx.lineTo(far.x, far.y);
        trailCtx.stroke();

        cumulative += segment;
        if (cumulative >= snake.trailLength) break;
      }

      const head = trail[trail.length - 1];
      trailCtx.fillStyle = '#eaffff';
      trailCtx.shadowColor = `rgba(${tone.rgb}, 0.9)`;
      trailCtx.shadowBlur = 12;
      trailCtx.beginPath();
      trailCtx.arc(head.x, head.y, snake.comet ? 1.4 : 1.8, 0, Math.PI * 2);
      trailCtx.fill();
      trailCtx.shadowBlur = 0;
    };

    const drawSparks = (dt: number) => {
      sparks = sparks.filter((spark) => (spark.age += dt) < SPARK_LIFE);
      for (const spark of sparks) {
        const fade = 1 - spark.age / SPARK_LIFE;
        trailCtx.fillStyle = `rgba(${spark.tone.rgb}, ${0.85 * fade})`;
        trailCtx.beginPath();
        trailCtx.arc(spark.x, spark.y, 1.6 + spark.age * 6, 0, Math.PI * 2);
        trailCtx.fill();
      }
    };

    const frame = (time: number) => {
      rafId = requestAnimationFrame(frame);
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      if (dt <= 0) return;

      trailCtx.clearRect(0, 0, width, height);

      for (const snake of snakes) {
        stepSnake(snake, dt);
        drawSnake(snake);
      }
      drawSparks(dt);
    };

    const start = () => {
      if (rafId || reducedMotion || document.hidden || !inView) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(frame);
    };

    const stop = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(wrap);
    if (avoidRef?.current) resizeObserver.observe(avoidRef.current);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(wrap);

    document.addEventListener('visibilitychange', onVisibility);

    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="tron-grid">
      <canvas ref={gridRef} />
      <canvas ref={trailRef} />
      <div className="tron-grid__vignette" />
    </div>
  );
}
