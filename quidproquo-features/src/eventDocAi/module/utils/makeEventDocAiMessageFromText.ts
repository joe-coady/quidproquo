import type { EventDocAiChatMessage } from '../../models';

export const makeEventDocAiMessageFromText = (
  role: EventDocAiChatMessage['role'],
  text: string
): EventDocAiChatMessage => ({
  role,
  segments: [{ type: 'text', text }],
});
