import type { AiModel, AiToolDefinition } from 'quidproquo-core';

export type EventDocAiOptions = {
  // The eventDoc collection this AI works with (chats are scoped per document).
  storeName: string;
  type: string;
  // The service the ws requests route through — must match the serviceName the
  // frontend passes to askEventDocAiInit.
  serviceName: string;
  // The websocket events bus the chat queue subscribes to (app-specific).
  eventBusName: string;
  userDirectoryName: string;
  // Defaults to `${storeName}-ai`.
  aiName?: string;
  // Defaults to AiModel.ClaudeSonnet46.
  model?: AiModel;
  systemPrompt?: string;
  // A defineInlineFunction name invoked on every turn to build the system
  // prompt (receives EventDocAiSystemPromptInput, returns the prompt string).
  // Lets the prompt carry live document state. A non-empty result overrides
  // `systemPrompt`; an empty result falls back to it.
  systemPromptGenerator?: string;
  // Tool executors are defineInlineFunction names registered by the caller.
  tools?: AiToolDefinition[];
  // Extended-thinking token budget. Defaults to 4096; pass 0 to disable
  // reasoning entirely. Thinking streams to the chat as reasoning segments so
  // the user sees progress instead of a silent wait.
  reasoningBudgetTokens?: number;
};
