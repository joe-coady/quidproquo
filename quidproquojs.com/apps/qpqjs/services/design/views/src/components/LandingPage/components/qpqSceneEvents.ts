/**
 * Contract between the hero backdrop and the DOM it choreographs with.
 * The canvas engine never touches React state — it emits these window
 * CustomEvents and the CodeWindow listens, so the two stay decoupled.
 */

export enum QpqRuntime {
  lambda = 'lambda',
  node = 'node',
  browser = 'browser',
}

export enum QpqSceneEvent {
  /** An action pulse left a yield line. detail: { line: 0 | 1 | 2 } */
  dispatched = 'qpq:dispatched',
  /** A pulse landed in a runtime well. detail: { runtime: QpqRuntime } */
  executed = 'qpq:executed',
  /** A result pulse arrived back at its yield line. detail: { line, runtime } */
  returned = 'qpq:returned',
}

export interface QpqDispatchedDetail {
  line: number;
}

export interface QpqExecutedDetail {
  runtime: QpqRuntime;
}

export interface QpqReturnedDetail {
  line: number;
  runtime: QpqRuntime;
}
