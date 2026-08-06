import { QPQError } from '../../types';
import { EventActionType } from './EventActionType';

// payload
export interface EventResolveCaughtErrorActionPayload {
  error: QPQError;
}

// action
// Functions
