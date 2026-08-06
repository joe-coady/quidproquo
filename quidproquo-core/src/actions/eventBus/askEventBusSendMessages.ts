import { AskResponse } from '../../types/StorySession';
import { createActionRequester } from '../../types/utils/createActionRequester';
import { EventBusActionType } from './EventBusActionType';
import { EventBusSendMessageOptions } from './EventBusSendMessageActionTypes';

export const askEventBusSendMessagesBase = createActionRequester<void>()({
  actionType: EventBusActionType.SendMessages,
  errorTypes: [
    'AccessDenied', // caller lacks permission to publish to the topic
    'TopicNotFound', // the SNS topic does not exist
    'ServiceUnavailable', // SNS internal error / throttling
  ],
  getPayload: (eventBusSendMessageOptions: EventBusSendMessageOptions<unknown>) => eventBusSendMessageOptions,
});

// Generic so callers can pin the message body shape at the call site.
export function* askEventBusSendMessages<T>(eventBusSendMessageOptions: EventBusSendMessageOptions<T>): AskResponse<void> {
  return yield* askEventBusSendMessagesBase(eventBusSendMessageOptions as EventBusSendMessageOptions<unknown>);
}
