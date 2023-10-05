import { ContextActionType } from '../context';
import { EventBusActionType } from './EventBusActionType';
import {
  EventBusSendMessageActionRequester,
  EventBusSendMessageOptions,
} from './EventBusSendMessageActionTypes';

export function* askEventBusSendMessages<T>(
  eventBusSendMessageOptions: EventBusSendMessageOptions<T>,
): EventBusSendMessageActionRequester<T> {
   // Read the context so we can send it with the queue message
   const context = (yield {
    type: ContextActionType.List
  })!;

  yield {
    type: EventBusActionType.SendMessages,
    payload: {
      ...eventBusSendMessageOptions,
      context
    },
  };
}
