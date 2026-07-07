import { QpqExecutionTrace, StoryResult } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { SystemActionType } from './SystemActionType';

// Replays a recorded StoryResult against the real story code (loaded through the
// dynamic module loader) and records a line-by-line execution trace — every statement
// with its local variable values. Only node runtimes implement a processor (the tracer
// drives the V8 inspector); see trace-replay-plan.md.

// Payload
export interface SystemTraceStoryActionPayload {
  storyResult: StoryResult<any>;

  // Regex sources matched against script urls to trace in addition to the story
  // function's own script (bundles split across chunks).
  scriptPatterns?: string[];
}

// Action
export interface SystemTraceStoryAction extends Action<SystemTraceStoryActionPayload> {
  type: SystemActionType.TraceStory;
  payload: SystemTraceStoryActionPayload;
}

// Functions
export type SystemTraceStoryActionProcessor = ActionProcessor<SystemTraceStoryAction, QpqExecutionTrace>;
export type SystemTraceStoryActionRequester = ActionRequester<SystemTraceStoryAction, QpqExecutionTrace>;
