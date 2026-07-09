import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import type {
  QpqDispatchedDetail,
  QpqExecutedDetail,
  QpqReturnedDetail,
} from './qpqSceneEvents';
import { QpqRuntime, QpqSceneEvent } from './qpqSceneEvents';

const kw = (text: string) => <span className="tok-kw">{text}</span>;
const fn = (text: string) => <span className="tok-fn">{text}</span>;
const str = (text: string) => <span className="tok-str">{text}</span>;
const ty = (text: string) => <span className="tok-ty">{text}</span>;
const cm = (text: string) => <span className="tok-cm">{text}</span>;
const pr = (text: string) => <span className="tok-pr">{text}</span>;

const LINES: ReactNode[] = [
  <>{cm('// pure business logic — no infrastructure')}</>,
  <>
    {kw('export function')}* {fn('askSendWelcomeEmail')}(
  </>,
  <>
    {'  '}userId: {ty('string')},
  </>,
  <>) {'{'}</>,
  <>
    {'  '}
    {kw('const')} user = {kw('yield')}* {fn('askUserDirectoryGetUser')}(userId);
  </>,
  <>&nbsp;</>,
  <>
    {'  '}
    {kw('yield')}* {fn('askQueueSendMessage')}({str("'email'")}, {'{'}
  </>,
  <>
    {'    '}
    {pr('to')}: user.email,
  </>,
  <>
    {'    '}
    {pr('template')}: {str("'welcome'")},
  </>,
  <>{'  });'}</>,
  <>&nbsp;</>,
  <>
    {'  '}
    {kw('yield')}* {fn('askEventBusPublish')}({str("'welcomed'")}, {'{'} userId{' '}
    {'}'});
  </>,
  <>&nbsp;</>,
  <>
    {'  '}
    {kw('return')} user;
  </>,
  <>{'}'}</>,
];

/** LINES indices of the story's yield expressions, in dispatch order. */
const YIELD_LINE_INDICES = [4, 6, 11];

const RUNTIME_CHIPS: { runtime: QpqRuntime; label: string }[] = [
  { runtime: QpqRuntime.lambda, label: 'λ aws lambda' },
  { runtime: QpqRuntime.node, label: '⬢ node' },
  { runtime: QpqRuntime.browser, label: '◍ browser' },
];

export function CodeWindow() {
  const rootRef = useRef<HTMLDivElement>(null);

  // The hero backdrop announces its choreography via window CustomEvents;
  // the window glints its yield lines and pulses its runtime chips in sync.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const timers = new Map<Element, number>();
    const flash = (el: Element | null, className: string, ms: number) => {
      if (!el) return;
      const pending = timers.get(el);
      if (pending) window.clearTimeout(pending);
      el.classList.remove('is-glint-out', 'is-glint-back', 'is-pulse');
      // reflow so back-to-back flashes restart the css transition
      void (el as HTMLElement).offsetWidth;
      el.classList.add(className);
      timers.set(
        el,
        window.setTimeout(() => {
          el.classList.remove(className);
          timers.delete(el);
        }, ms)
      );
    };

    const onDispatched = (event: Event) => {
      const { line } = (event as CustomEvent<QpqDispatchedDetail>).detail;
      flash(
        root.querySelector(`[data-yield-line="${line}"]`),
        'is-glint-out',
        450
      );
    };
    const onExecuted = (event: Event) => {
      const { runtime } = (event as CustomEvent<QpqExecutedDetail>).detail;
      flash(root.querySelector(`[data-runtime="${runtime}"]`), 'is-pulse', 700);
    };
    const onReturned = (event: Event) => {
      const { line } = (event as CustomEvent<QpqReturnedDetail>).detail;
      flash(
        root.querySelector(`[data-yield-line="${line}"]`),
        'is-glint-back',
        550
      );
    };

    window.addEventListener(QpqSceneEvent.dispatched, onDispatched);
    window.addEventListener(QpqSceneEvent.executed, onExecuted);
    window.addEventListener(QpqSceneEvent.returned, onReturned);

    return () => {
      window.removeEventListener(QpqSceneEvent.dispatched, onDispatched);
      window.removeEventListener(QpqSceneEvent.executed, onExecuted);
      window.removeEventListener(QpqSceneEvent.returned, onReturned);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div ref={rootRef} className="code-window">
      <div className="code-window__bar">
        <span className="code-window__dot code-window__dot--red" />
        <span className="code-window__dot code-window__dot--amber" />
        <span className="code-window__dot code-window__dot--green" />
        <span className="code-window__title">sendWelcomeEmail.story.ts</span>
      </div>
      <pre className="code-window__body">
        <code>
          {LINES.map((line, index) => {
            const yieldIndex = YIELD_LINE_INDICES.indexOf(index);
            return (
              <span
                key={index}
                className="code-line"
                data-yield-line={yieldIndex >= 0 ? yieldIndex : undefined}
              >
                <span className="code-line__num">{index + 1}</span>
                <span className="code-line__text">{line}</span>
              </span>
            );
          })}
        </code>
      </pre>
      <div className="code-window__foot">
        <span className="code-window__runs">runs unchanged on</span>
        {RUNTIME_CHIPS.map(({ runtime, label }) => (
          <span key={runtime} className="runtime-chip" data-runtime={runtime}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
