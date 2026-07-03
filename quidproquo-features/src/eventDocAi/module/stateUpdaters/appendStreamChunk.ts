import type { AppendStreamChunkPayload } from '../effects/EventDocAiAppendStreamChunkEffect';
import type { EventDocAiState } from '../EventDocAiState';

export const appendStreamChunk = (
  state: EventDocAiState,
  { part }: AppendStreamChunkPayload
): EventDocAiState => ({
  ...state,
  streamParts: [...state.streamParts, part],
});
