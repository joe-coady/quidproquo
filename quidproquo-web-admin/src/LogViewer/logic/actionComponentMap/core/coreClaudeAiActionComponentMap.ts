import { ClaudeAiActionType } from 'quidproquo-core';

const coreClaudeAiActionComponentMap: Record<string, string[]> = {
  [ClaudeAiActionType.MessagesApi]: ['askClaudeAiMessagesApi', 'body', 'apiKey'],
};

export default coreClaudeAiActionComponentMap;
