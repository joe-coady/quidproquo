import { EventBusActionType } from 'quidproquo-core';

const coreEventBusActionComponentMap: Record<string, string[]> = {
  [EventBusActionType.SendMessages]: ['askEventBusSendMessages', 'eventBusSendMessageOptions'],
};

export default coreEventBusActionComponentMap;
