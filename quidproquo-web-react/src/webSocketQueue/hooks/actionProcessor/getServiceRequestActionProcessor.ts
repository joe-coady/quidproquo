/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionProcessorList, actionResult } from 'quidproquo-core';
import { AnyWebSocketQueueEventMessageWithCorrelation, ServiceActionType } from 'quidproquo-webserver';

import { RefObject } from 'react';

export const getServiceRequestActionProcessor = (
  sendEventRef: RefObject<((event: Omit<AnyWebSocketQueueEventMessageWithCorrelation, 'correlationId'>) => void) | null>,
): ActionProcessorList => ({
  [ServiceActionType.Request]: async ({
    serviceName,
    method,
    payload,
  }: {
    serviceName: string;
    method: string;
    payload: any;
  }) => {
    sendEventRef.current?.({ type: `${serviceName}/${method}`, payload } as any);
    return actionResult(undefined);
  },
});
