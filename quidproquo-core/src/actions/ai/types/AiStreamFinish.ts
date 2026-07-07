import { AiStreamPartType } from './AiStreamPartType';
import { AiStreamUsage } from './AiStreamUsage';

/**
 * Emitted once at the very end of the response with the aggregate finish reason and total usage
 * across every step. Use this (not `FinishStep`) for end-of-response accounting.
 */
export interface AiStreamFinish {
  type: AiStreamPartType.Finish;
  /** Why the model stopped — e.g. `'stop'`, `'length'`, `'tool-calls'`. */
  finishReason: string;
  /** Aggregate token usage across all steps. */
  usage: AiStreamUsage;
}
