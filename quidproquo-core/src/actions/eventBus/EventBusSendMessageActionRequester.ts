import { EventBusActionType } from './EventBusActionType';
import {
  EventBusSendMessageActionRequester,
  EventBusMessage,
} from './EventBusSendMessageActionTypes';

export function* askEventBusSendMessages<T extends EventBusMessage<any>>(
  eventBusName: string,
  ...eventBusMessages: T[]
): EventBusSendMessageActionRequester<T> {
  return yield {
    type: EventBusActionType.SendMessages,
    payload: {
      eventBusMessages,
      eventBusName,
    },
  };
}
