import { askConfigGetGlobal, askKeyValueStoreUpsert, AskResponse } from 'quidproquo-core';

import { EVENT_DOC_AI_CHAT_LIST_STORE_GLOBAL } from '../constants/eventDocAiGlobalNames';
import type { EventDocAiChatSummary } from '../models';

export function* askEventDocAiChatUpsert(chat: EventDocAiChatSummary): AskResponse<void> {
  const store = yield* askConfigGetGlobal<string>(EVENT_DOC_AI_CHAT_LIST_STORE_GLOBAL);

  yield* askKeyValueStoreUpsert<EventDocAiChatSummary>(store, chat);
}
