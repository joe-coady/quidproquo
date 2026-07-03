import { type AiModel, askAiPromptStream, askConfigGetGlobal, AskResponse, askStreamMap } from 'quidproquo-core';

import {
  EVENT_DOC_AI_MODEL_GLOBAL,
  EVENT_DOC_AI_NAME_GLOBAL,
  EVENT_DOC_AI_SYSTEM_PROMPT_GLOBAL,
} from '../constants/eventDocAiGlobalNames';
import { askEventDocAiChatHistoryLoad } from '../data/askEventDocAiChatHistoryLoad';
import { askEventDocAiChatHistorySave } from '../data/askEventDocAiChatHistorySave';
import { askEventDocAiChatTouch } from '../data/askEventDocAiChatTouch';
import type { EventDocAiChatMessage, EventDocAiChatSendResult } from '../models';
import {
  askUIEventDocAiAppendChatMessage,
  askUIEventDocAiAppendStreamChunk,
  askUIEventDocAiClearStream,
  chatMessagesToAiMessages,
  makeEventDocAiMessageFromText,
  mergeStreamParts,
} from '../module';

const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful assistant. Use tools when appropriate.';

// One conversational turn. Stream parts are a TRANSPORT-ONLY concept: each part
// is dispatched to the UI as it arrives (the live typing view), then the
// completed reply is folded into durable segments, saved, dispatched as the
// finalized message, and the UI's part buffer is cleared.
export function* askEventDocAiProcessSend(
  docId: string,
  chatId: string,
  message: string
): AskResponse<EventDocAiChatSendResult> {
  const aiName = yield* askConfigGetGlobal<string>(EVENT_DOC_AI_NAME_GLOBAL);
  const model = yield* askConfigGetGlobal<AiModel>(EVENT_DOC_AI_MODEL_GLOBAL);
  const configuredPrompt = yield* askConfigGetGlobal<string>(
    EVENT_DOC_AI_SYSTEM_PROMPT_GLOBAL
  );

  const fullHistory = [
    ...(yield* askEventDocAiChatHistoryLoad(docId, chatId)),
    makeEventDocAiMessageFromText('user', message),
  ];

  yield* askEventDocAiChatHistorySave(docId, chatId, fullHistory);

  // Tools do NOT receive the docId from the model — executors inherit the
  // session context (provided in eventDocAiServiceRequest) and read the
  // trusted id there.
  const streamHandle = yield* askAiPromptStream(model, message, {
    system: configuredPrompt || DEFAULT_SYSTEM_PROMPT,
    aiName,
    messages: chatMessagesToAiMessages(fullHistory),
  });

  const assistantParts = yield* askStreamMap(
    streamHandle,
    function* askMap(part) {
      yield* askUIEventDocAiAppendStreamChunk(part);
      return part;
    }
  );

  // Fold the transport parts into durable segments; a stream that produced no
  // content (e.g. it errored before any text) saves no assistant message.
  const segments = mergeStreamParts(assistantParts);

  if (segments.length > 0) {
    const assistantMessage: EventDocAiChatMessage = {
      role: 'assistant',
      segments,
    };

    // Persist the folded reply, hand the finalized message to the UI, then
    // clear its (now superseded) live-stream buffer.
    yield* askEventDocAiChatHistorySave(docId, chatId, [
      ...fullHistory,
      assistantMessage,
    ]);

    yield* askUIEventDocAiAppendChatMessage(assistantMessage);
  }

  yield* askUIEventDocAiClearStream();

  yield* askEventDocAiChatTouch(docId, chatId);

  return { complete: true };
}
