import {
  AiModel,
  defineAi,
  defineKeyValueStore,
  defineQueue,
  defineStorageDrive,
  QPQConfig,
  QpqFunctionRuntimeAdvanced,
  QpqQueueProcessors,
} from 'quidproquo-core';

import {
  EVENT_DOC_EVENT_VALIDATOR_GLOBAL,
  EVENT_DOC_EVENTS_STORE_NAME_GLOBAL,
  EVENT_DOC_RENDERER_GLOBAL,
  EVENT_DOC_STORAGE_DRIVE_GLOBAL,
  EVENT_DOC_STORE_NAME_GLOBAL,
  EVENT_DOC_TYPE_GLOBAL,
  EVENT_DOC_USER_DIRECTORY_GLOBAL,
} from '../../eventDoc';
import { buildEventDocStore } from '../../eventDoc';
import { eventDocAiChatDriveName } from '../constants/eventDocAiChatDriveName';
import { eventDocAiChatListStoreName } from '../constants/eventDocAiChatListStoreName';
import {
  EVENT_DOC_AI_CHAT_DRIVE_GLOBAL,
  EVENT_DOC_AI_CHAT_LIST_STORE_GLOBAL,
  EVENT_DOC_AI_MODEL_GLOBAL,
  EVENT_DOC_AI_NAME_GLOBAL,
  EVENT_DOC_AI_SERVICE_NAME_GLOBAL,
  EVENT_DOC_AI_SYSTEM_PROMPT_GENERATOR_GLOBAL,
  EVENT_DOC_AI_SYSTEM_PROMPT_GLOBAL,
} from '../constants/eventDocAiGlobalNames';
import { eventDocAiQueueName } from '../constants/eventDocAiQueueName';
import type { EventDocAiChatSummary } from '../models';
import {
  buildEventDocAiMethodName,
  EVENT_DOC_AI_METHOD_CHAT_CREATE,
  EVENT_DOC_AI_METHOD_CHAT_HISTORY,
  EVENT_DOC_AI_METHOD_CHAT_LIST,
  EVENT_DOC_AI_METHOD_CHAT_SEND,
} from '../module';
import { EventDocAiOptions } from '../types/EventDocAiOptions';

// AI chats attached to an eventDoc collection — the AI sibling of defineEventDoc.
// Provisions a chat-history drive + chat-list KVS, registers the AI (tools are
// defineInlineFunction names supplied by the caller), and subscribes a
// collection-scoped queue of websocket service-request handlers that ship
// inside this package (per-processor globals carry the wiring, exactly like
// defineEventDocRoutes' controllers).
export const defineEventDocAi = ({
  storeName,
  type,
  serviceName,
  eventBusName,
  userDirectoryName,
  aiName = `${storeName}-ai`,
  model = AiModel.ClaudeSonnet46,
  systemPrompt,
  systemPromptGenerator,
  tools = [],
}: EventDocAiOptions): QPQConfig => {
  const store = buildEventDocStore({ storeName, type });
  const chatDrive = eventDocAiChatDriveName(storeName);
  const chatListStore = eventDocAiChatListStoreName(storeName);

  const globals: Record<string, unknown> = {
    // Full doc-store context so controllers (and future doc-aware helpers)
    // can use the generic eventDoc logic against the collection.
    [EVENT_DOC_STORE_NAME_GLOBAL]: store.storeName,
    [EVENT_DOC_EVENTS_STORE_NAME_GLOBAL]: store.eventsStoreName,
    [EVENT_DOC_TYPE_GLOBAL]: store.type,
    [EVENT_DOC_STORAGE_DRIVE_GLOBAL]: store.storageDriveName,
    [EVENT_DOC_EVENT_VALIDATOR_GLOBAL]: store.eventValidator ?? '',
    [EVENT_DOC_RENDERER_GLOBAL]: store.eventRenderer ?? '',
    [EVENT_DOC_USER_DIRECTORY_GLOBAL]: userDirectoryName,

    [EVENT_DOC_AI_CHAT_DRIVE_GLOBAL]: chatDrive,
    [EVENT_DOC_AI_CHAT_LIST_STORE_GLOBAL]: chatListStore,
    [EVENT_DOC_AI_SERVICE_NAME_GLOBAL]: serviceName,
    [EVENT_DOC_AI_NAME_GLOBAL]: aiName,
    [EVENT_DOC_AI_MODEL_GLOBAL]: model,
    [EVENT_DOC_AI_SYSTEM_PROMPT_GLOBAL]: systemPrompt ?? '',
    [EVENT_DOC_AI_SYSTEM_PROMPT_GENERATOR_GLOBAL]: systemPromptGenerator ?? '',
  };

  const runtime = (functionName: string): QpqFunctionRuntimeAdvanced => ({
    basePath: __dirname,
    relativePath: `../wsControllers/${functionName}`,
    functionName,
    globals,
  });

  const processorKey = (method: string): string => `qpq/serviceRequest/${serviceName}/${buildEventDocAiMethodName(type, method)}`;

  const processors: QpqQueueProcessors = {
    [processorKey(EVENT_DOC_AI_METHOD_CHAT_CREATE)]: runtime('onChatCreate'),
    [processorKey(EVENT_DOC_AI_METHOD_CHAT_LIST)]: runtime('onChatList'),
    [processorKey(EVENT_DOC_AI_METHOD_CHAT_HISTORY)]: runtime('onChatHistory'),
    [processorKey(EVENT_DOC_AI_METHOD_CHAT_SEND)]: runtime('onChatSend'),
  };

  return [
    defineKeyValueStore<EventDocAiChatSummary>(chatListStore, 'docId', ['chatId']),
    defineStorageDrive(chatDrive),
    defineAi(aiName, { tools }),
    defineQueue(eventDocAiQueueName(storeName), processors, {
      eventBusSubscriptions: [eventBusName],
    }),
  ];
};
