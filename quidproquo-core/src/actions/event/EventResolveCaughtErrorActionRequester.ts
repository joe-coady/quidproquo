import { QPQError } from '../../types';
import { EventActionType } from './EventActionType';
import { EventResolveCaughtErrorActionRequester } from './EventResolveCaughtErrorActionTypes';

export function* askEventResolveCaughtError<TransformedEventParams>(error: QPQError): EventResolveCaughtErrorActionRequester<TransformedEventParams> {
  return yield {
    type: EventActionType.ResolveCaughtError,
    payload: { error },
  };
}
