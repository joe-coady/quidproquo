import { AiStreamPartType } from './AiStreamPartType';
import { AiStreamUsage } from './AiStreamUsage';

/**
 * The current generation step ended.
 *
 * For total-response accounting use {@link AiStreamFinish}; this carries the per-step slice only.
 */
export interface AiStreamFinishStep {
  type: AiStreamPartType.FinishStep;
  /** Why this step stopped — e.g. `'tool-calls'` between steps, `'stop'` on the final step. */
  finishReason: string;
  /** Token usage for this step only. */
  usage: AiStreamUsage;
}
