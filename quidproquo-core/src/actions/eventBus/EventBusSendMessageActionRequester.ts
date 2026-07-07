import { createErrorEnumForAction } from '../../types';
import { EventBusActionType } from './EventBusActionType';
import { EventBusSendMessageActionRequester, EventBusSendMessageOptions } from './EventBusSendMessageActionTypes';

export const EventBusSendMessagesErrorTypeEnum = createErrorEnumForAction(EventBusActionType.SendMessages, [
  'AccessDenied', // caller lacks permission to publish to the topic
  'TopicNotFound', // the SNS topic does not exist
  'ServiceUnavailable', // SNS internal error / throttling
]);

export function* askEventBusSendMessages<T>(eventBusSendMessageOptions: EventBusSendMessageOptions<T>): EventBusSendMessageActionRequester<T> {
  yield {
    type: EventBusActionType.SendMessages,
    payload: eventBusSendMessageOptions,
  };
}
