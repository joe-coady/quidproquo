import type { AiStreamPart } from 'quidproquo-core';
import type { Nullable } from 'quidproquo-core';

import type { EventDocAiChatMessage, EventDocAiChatSummary } from '../models';

// Which service/doc-type/document the module talks to comes from the
// eventDocAi QPQ context (provided around the chat UI), not from state.
export type EventDocAiState = {
  chats: EventDocAiChatSummary[];
  activeChatId: Nullable<string>;

  // Finalized messages of the active chat (user + assistant).
  chatMessages: EventDocAiChatMessage[];
  // The in-flight assistant stream; cleared once the reply is finalized.
  streamParts: AiStreamPart[];

  isLoadingChats: boolean;
  isLoadingHistory: boolean;
  isSending: boolean;
  error: Nullable<string>;
};

export const createInitialEventDocAiState = (): EventDocAiState => ({
  chats: [],
  activeChatId: null,
  chatMessages: [],
  streamParts: [],
  isLoadingChats: false,
  isLoadingHistory: false,
  isSending: false,
  error: null,
});
