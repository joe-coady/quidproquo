/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AskResponse,
  QueueEvent,
  QueueEventResponse,
  QueueMessage,
} from 'quidproquo-core';

import { ServiceRequester } from './createServiceRequester';

export const serviceRequest = (
  requester: ServiceRequester<any>,
  runtime: (
    event: QueueEvent<QueueMessage<any>>
  ) => AskResponse<QueueEventResponse>
) => {
  const { method } = requester.serviceRequest;

  const wrapper = function* wrapper(event: QueueEvent<QueueMessage<any>>) {
    return yield* runtime(event);
  };

  wrapper.serviceRequest = { method };

  return wrapper;
};
