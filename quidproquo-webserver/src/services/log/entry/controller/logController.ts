/* eslint-disable @typescript-eslint/no-unused-vars */

import { HTTPEvent } from '../../../../types';
import { toJsonEventResponse } from '../../../../utils/httpEventUtils';

export function* getLogs(event: HTTPEvent, params: {}) {
  return toJsonEventResponse({ hello: 'world!' });
}
