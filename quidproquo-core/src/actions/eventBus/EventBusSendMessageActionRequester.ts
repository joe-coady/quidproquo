import { EventBusActionType } from './EventBusActionType';
import { EventBusSendMessageActionRequester, EventBusSendMessageOptions } from './EventBusSendMessageActionTypes';

export function* askEventBusSendMessages<T>(eventBusSendMessageOptions: EventBusSendMessageOptions<T>): EventBusSendMessageActionRequester<T> {
  yield {
    type: EventBusActionType.SendMessages,
    payload: eventBusSendMessageOptions,
  };
}
