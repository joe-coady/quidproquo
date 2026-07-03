import type { AiMessage } from 'quidproquo-core';

import type { EventDocAiChatMessage } from '../../models';
import { segmentsToText } from './segmentsToText';

export const chatMessagesToAiMessages = (
  messages: EventDocAiChatMessage[]
): AiMessage[] =>
  messages.map((message) => ({
    role: message.role,
    content: segmentsToText(message.segments),
  }));
