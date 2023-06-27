import { CrossModuleMessage } from '../../types';
import { EventBusActionType } from './EventBusActionType';
import {
  EventBusSendMessageActionRequester,
  EventBusSendMessageOptions,
} from './EventBusSendMessageActionTypes';

export function* askEventBusSendMessages<T>(
  eventBusSendMessageOptions: EventBusSendMessageOptions<T>,
): EventBusSendMessageActionRequester<T> {
  return yield {
    type: EventBusActionType.SendMessages,
    payload: eventBusSendMessageOptions,
  };
}
