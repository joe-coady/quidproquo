import type { EventDocAiMessageSegment } from './EventDocAiMessageSegment';

// A finalized chat message. Stream parts never persist — they're folded into
// segments once the reply completes.
export type EventDocAiChatMessage = {
  role: 'user' | 'assistant';
  segments: EventDocAiMessageSegment[];
};
