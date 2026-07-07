import { AiActionType } from 'quidproquo-core';

const coreAiActionComponentMap: Record<string, string[]> = {
  [AiActionType.Prompt]: ['askAiPrompt', 'model', 'prompt', 'messages', 'system', 'aiName'],
  [AiActionType.PromptStream]: ['askAiPromptStream', 'model', 'prompt', 'messages', 'system', 'aiName'],
};

export default coreAiActionComponentMap;
