import { AdminSessionEventType } from '../effects/session/AdminSessionEventType';
import { AdminSessionActionType } from './AdminSessionActionType';
import { ApplySessionEventActionRequester } from './ApplySessionEventActionTypes';

// Pure: only yields the declarative ApplyEvent action — the registered
// processor decides HOW (optimistic local append + background flush).
export function* askApplySessionEvent<T>(type: AdminSessionEventType, data: T): ApplySessionEventActionRequester {
  return yield { type: AdminSessionActionType.applyEvent, payload: { type, data } };
}
