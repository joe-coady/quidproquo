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
  // Tool executors are defineInlineFunction names registered by the caller.
  tools?: AiToolDefinition[];
};
