import { SystemActionType } from './SystemActionType';
import { Action, ActionRequester, ActionProcessor } from '../../types/Action';
import { StoryResult } from '../../types';

// Payload
export interface SystemExecuteStoryActionPayload<StoryInput extends Array<any>> {
  src: string;
  runtime: string;
  params: StoryInput;
}

// Action
export interface SystemExecuteStoryAction<StoryInput extends Array<any>> extends Action<SystemExecuteStoryActionPayload<StoryInput>> {
  type: SystemActionType.ExecuteStory;
  payload: SystemExecuteStoryActionPayload<StoryInput>;
}

// Functions
export type SystemExecuteStoryActionProcessor<StoryInput extends Array<any>, StoryOutput> = ActionProcessor<
  SystemExecuteStoryAction<StoryInput>,
  StoryResult<StoryInput, StoryOutput>
>;
export type SystemExecuteStoryActionRequester<StoryInput extends Array<any>, StoryOutput> = ActionRequester<
  SystemExecuteStoryAction<StoryInput>,
  StoryResult<StoryInput, StoryOutput>
>;
