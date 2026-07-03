import type { EventDocAiState } from '../EventDocAiState';

export const selectEventDocAiIsStreaming = (
  state: EventDocAiState
): boolean => state.streamParts.length > 0;
