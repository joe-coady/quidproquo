import { EventResolveCaughtErrorActionRequester } from './EventResolveCaughtErrorActionTypes';
import { EventActionType } from './EventActionType';
import { QPQError } from '../../types';

export function* askEventResolveCaughtError<TransformedEventParams>(error: QPQError): EventResolveCaughtErrorActionRequester<TransformedEventParams> {
  return yield {
    type: EventActionType.ResolveCaughtError,
    payload: { error },
  };
}
