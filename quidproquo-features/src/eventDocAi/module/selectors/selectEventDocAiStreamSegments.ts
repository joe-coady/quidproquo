import type { EventDocAiMessageSegment } from '../../models';
import type { EventDocAiState } from '../EventDocAiState';
import { mergeStreamParts } from '../utils/mergeStreamParts';

// The in-flight assistant reply, merged for rendering.
export const selectEventDocAiStreamSegments = (
  state: EventDocAiState
): EventDocAiMessageSegment[] => mergeStreamParts(state.streamParts);
