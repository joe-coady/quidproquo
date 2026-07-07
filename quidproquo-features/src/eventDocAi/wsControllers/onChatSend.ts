import { createServiceRequester } from 'quidproquo-webserver';

import { askEventDocAiProcessSend } from '../logic/askEventDocAiProcessSend';
import type { EventDocAiChatSendPayload, EventDocAiChatSendResult } from '../models';
import { askEventDocAiContextRead } from '../module';
import { eventDocAiServiceRequest } from './eventDocAiServiceRequest';

const askChatSendRequest = createServiceRequester<EventDocAiChatSendPayload, EventDocAiChatSendResult>('eventDocAi', 'ChatSend');

export const onChatSend = eventDocAiServiceRequest(askChatSendRequest, function* askOnChatSend(payload) {
  const { docId } = yield* askEventDocAiContextRead();

  return yield* askEventDocAiProcessSend(docId, payload.chatId, payload.message, payload.attachments);
});
