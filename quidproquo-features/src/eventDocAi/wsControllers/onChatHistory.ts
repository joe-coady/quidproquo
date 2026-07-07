import { createServiceRequester } from 'quidproquo-webserver';

import { askEventDocAiChatHistoryLoad } from '../data/askEventDocAiChatHistoryLoad';
import type { EventDocAiChatHistoryPayload, EventDocAiChatMessage } from '../models';
import { askEventDocAiContextRead } from '../module';
import { eventDocAiServiceRequest } from './eventDocAiServiceRequest';

const askChatHistoryRequest = createServiceRequester<EventDocAiChatHistoryPayload, EventDocAiChatMessage[]>('eventDocAi', 'ChatHistory');

export const onChatHistory = eventDocAiServiceRequest(askChatHistoryRequest, function* askOnChatHistory(payload) {
  const { docId } = yield* askEventDocAiContextRead();

  return yield* askEventDocAiChatHistoryLoad(docId, payload.chatId);
});
