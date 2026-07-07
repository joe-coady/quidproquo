import { CodeWindow } from './CodeWindow';
import { InstallChip } from './InstallChip';
import { NavBar } from './NavBar';
import { TronGrid } from './TronGrid';

export function Hero() {
  return (
    <section className="hero" id="top">
      <TronGrid />
      <NavBar />

      <div className="hero__inner">
        <div className="hero__copy">
          <span className="hero__badge">
            <span className="hero__badge-pulse" />
            functional · action-based · typescript
          </span>

          <h1 className="hero__title">
            Write pure stories.
            <br />
            <span className="hero__title-glow">Run them anywhere.</span>
          </h1>

          <p className="hero__sub">
            quidproquo is an action-based framework where business logic is a generator function — a{' '}
            <em>story</em> that yields typed actions. The runtime decides how each action executes: AWS
            Lambda in production, Node on your machine, the browser in your app.
          </p>

          <div className="hero__cta">
            <a className="btn btn--primary" href="#stories">
              Get started
              <span className="btn__arrow">→</span>
            </a>
            <InstallChip />
          </div>

          <div className="hero__meta">
            <span>MIT licensed</span>
            <span>zero side effects</span>
            <span>deploys itself with CDK</span>
          </div>
        </div>

        <div className="hero__panel">
          <CodeWindow />
        </div>
      </div>

      <div className="hero__fade" aria-hidden="true" />
    </section>
  );
}
