// Single-line, TTY-aware progress bar for the workspace runner. Kept dependency-free
// (just ANSI escapes) to match the hand-rolled style of the rest of scripts/.

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const BAR_WIDTH = 28;

export interface ProgressState {
  total: number;
  done: number;
  label: string; // e.g. "quidproquo-features@0.1.7 › build:esm"
  startMs: number;
}

const formatElapsed = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

const renderBar = (ratio: number): string => {
  const filled = Math.min(BAR_WIDTH, Math.round(BAR_WIDTH * ratio));
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
};

// Rough ETA from the average time per completed step. Needs at least one finished
// step to have a rate, so it reads "ETA --" until then.
const formatEta = (state: ProgressState): string => {
  if (state.done === 0) {
    return 'ETA --';
  }
  const avgMs = (Date.now() - state.startMs) / state.done;
  const remainingMs = avgMs * (state.total - state.done);
  return `ETA ${formatElapsed(remainingMs)}`;
};

// One redrawable line. The caller owns the carriage-return / clear-to-EOL so this
// stays a pure string builder.
export const renderLine = (state: ProgressState, frame: number): string => {
  const ratio = state.total === 0 ? 1 : state.done / state.total;
  const pct = String(Math.round(ratio * 100)).padStart(3);
  const spinner = SPINNER[frame % SPINNER.length];
  const counter = `${state.done}/${state.total}`;
  return `${spinner}  [${renderBar(ratio)}] ${pct}%  ${counter}  ${state.label}  · ${formatEta(state)}`;
};

export const clearLine = (): string => '\r\x1b[K';

export { formatElapsed };
