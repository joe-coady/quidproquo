import { getProcessCustomImplementation } from 'quidproquo-core';
import { ActionProcessorListResolverFactory } from 'quidproquo-web-react';

import { AdminAppState } from '../AdminAppState';
import { AdminSessionActionType } from './AdminSessionActionType';
import { ApplySessionEventActionProcessor } from './ApplySessionEventActionTypes';
import { askApplySessionEventToLog } from './askApplySessionEventToLog';

// Runs the ApplyEvent story in a sub-runtime that inherits the live processors,
// so it can dispatch into the admin runtime's state like any story.
export const getApplySessionEventActionProcessor: ActionProcessorListResolverFactory<AdminAppState> = () => async (qpqConfig) => ({
  [AdminSessionActionType.applyEvent]: getProcessCustomImplementation<ApplySessionEventActionProcessor>(
    qpqConfig,
    askApplySessionEventToLog,
    'Apply Admin Session Event',
    null,
    () => new Date().toISOString(),
    () => globalThis.crypto.randomUUID(),
  ),
});
