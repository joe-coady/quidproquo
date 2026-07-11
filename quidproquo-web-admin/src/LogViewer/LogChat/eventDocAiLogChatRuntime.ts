import { createInitialEventDocAiState, eventDocAiReducer, sharedEventDocAiApi } from 'quidproquo-features';
import { createQpqRuntimeDefinition } from 'quidproquo-web-react';

// Named per log correlation (see LogChat.tsx) so each open log dialog gets its
// own isolated chat state instead of sharing one across every log.
export const eventDocAiLogChatRuntime = createQpqRuntimeDefinition(sharedEventDocAiApi, createInitialEventDocAiState(), eventDocAiReducer);
