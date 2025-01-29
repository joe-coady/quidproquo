import { QpqFunctionRuntime, StorySession } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { SystemActionType } from './SystemActionType';

// Payload
export interface SystemExecuteStoryActionPayload<StoryInput extends Array<any>> {
  runtime: QpqFunctionRuntime;
  params: StoryInput;
  storySession?: StorySession;
}

// Action
export interface SystemExecuteStoryAction<StoryInput extends Array<any>> extends Action<SystemExecuteStoryActionPayload<StoryInput>> {
  type: SystemActionType.ExecuteStory;
  payload: SystemExecuteStoryActionPayload<StoryInput>;
}

// Functions
export type SystemExecuteStoryActionProcessor<StoryInput extends Array<any>, StoryOutput> = ActionProcessor<
  SystemExecuteStoryAction<StoryInput>,
  StoryOutput
>;
export type SystemExecuteStoryActionRequester<StoryInput extends Array<any>, StoryOutput> = ActionRequester<
  SystemExecuteStoryAction<StoryInput>,
  StoryOutput
>;
