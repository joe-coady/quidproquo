import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { QpqSceneEvent } from './qpqSceneEvents';
import type { EngineAnchors } from './runtimeBelowEngine';
import { createRuntimeBelowEngine } from './runtimeBelowEngine';

interface RuntimeBelowProps {
  /**
   * Element containing the CodeWindow; action pulses launch from its
   * [data-yield-line] rows so canvas and DOM read as one object.
   */
  anchorRootRef?: RefObject<HTMLElement | null>;
}

/**
 * Hero backdrop: "The Runtime Below". A thin React shell around the WebGL
 * engine — it owns the DOM concerns (anchor rects, observers, CustomEvents)
 * and copies TronGrid's pause discipline: stop offscreen, stop when hidden,
 * resize with the wrapper.
 */
export function RuntimeBelow({ anchorRootRef }: RuntimeBelowProps = {}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // honor a mid-session toggle of the OS motion preference
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const getAnchors = (): EngineAnchors | null => {
      const wrapRect = wrap.getBoundingClientRect();
      // no usable DOM anchor: spawn from just under the horizon (0.62 of the
      // wrap on narrow layouts), center-right — clear of the stacked copy
      const virtual = (): EngineAnchors => ({
        yieldPoints: [0, 1, 2].map(() => ({
          x: wrapRect.width * 0.8,
          y: wrapRect.height * 0.62 + 20,
        })),
        panel: null,
      });
      const codeWindow = anchorRootRef?.current?.querySelector('.code-window');
      if (!codeWindow || window.innerWidth <= 960) return virtual();
      const codeRect = codeWindow.getBoundingClientRect();
      const yieldPoints: EngineAnchors['yieldPoints'] = [];
      for (let line = 0; line < 3; line += 1) {
        const el = codeWindow.querySelector(`[data-yield-line="${line}"]`);
        if (!el) return virtual();
        const lineRect = el.getBoundingClientRect();
        yieldPoints.push({
          x: codeRect.left - wrapRect.left + 2,
          y: lineRect.top + lineRect.height / 2 - wrapRect.top,
        });
      }
      return {
        yieldPoints,
        panel: {
          x0: codeRect.left - wrapRect.left,
          y0: codeRect.top - wrapRect.top,
          x1: codeRect.right - wrapRect.left,
          y1: codeRect.bottom - wrapRect.top,
        },
      };
    };

    const emit = (name: QpqSceneEvent, detail: unknown) => {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    };

    const engine = createRuntimeBelowEngine(canvas, {
      reducedMotion,
      getAnchors,
      onDispatched: (line) => emit(QpqSceneEvent.dispatched, { line }),
      onExecuted: (runtime) => emit(QpqSceneEvent.executed, { runtime }),
      onReturned: (line, runtime) =>
        emit(QpqSceneEvent.returned, { line, runtime }),
    });
    if (!engine) {
      setFallback(true);
      return;
    }

    let inView = true;

    const syncRunning = () => {
      if (reducedMotion) return;
      if (inView && !document.hidden) engine.start();
      else engine.stop();
    };

    const refresh = () => {
      engine.resize();
      if (reducedMotion) engine.renderStaticFrame();
    };

    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(wrap);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncRunning();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(wrap);

    document.addEventListener('visibilitychange', syncRunning);
    // yield-line anchors shift when the webfonts land — re-solve them
    document.fonts?.ready.then(() => {
      refresh();
    });

    if (reducedMotion) engine.renderStaticFrame();
    else engine.start();

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', syncRunning);
      engine.destroy();
    };
  }, [anchorRootRef, reducedMotion]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`runtime-below${fallback ? ' runtime-below--fallback' : ''}`}
    >
      <canvas ref={canvasRef} />
      <div className="runtime-below__horizon" />
      <div className="runtime-below__vignette" />
    </div>
  );
}
