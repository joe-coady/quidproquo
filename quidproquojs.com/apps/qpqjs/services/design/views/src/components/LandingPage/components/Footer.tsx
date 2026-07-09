import { useRef } from 'react';

import { InstallChip } from './InstallChip';
import { TronGrid } from './TronGrid';

export function Footer() {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <footer className="footer">
      <div className="footer__cta">
        <TronGrid avoidRef={panelRef} />
        <div className="footer__cta-content" ref={panelRef}>
          <p className="section__kicker">get started</p>
          <h2 className="footer__cta-title">
            Ready to write
            <br />
            <span className="hero__title-glow">your first story?</span>
          </h2>
          <p className="footer__cta-sub">
            Install the core, yield an action, and let the runtime handle the rest.
          </p>
          <div className="footer__cta-actions">
            <InstallChip />
            <a
              className="btn btn--ghost"
              href="https://github.com/joe-coady/quidproquo"
              target="_blank"
              rel="noreferrer"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="footer__base">
        <div className="footer__base-inner">
          <span>quidproquo · MIT license</span>
          <span>built as a qpq story, naturally</span>
        </div>
      </div>
    </footer>
  );
}
