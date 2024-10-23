import { QpqContextIdentifier } from '../../types';
import { ContextActionType } from './ContextActionType';
import { ContextReadActionRequester } from './ContextReadActionTypes';

export function* askContextRead<T>(contextIdentifier: QpqContextIdentifier<T>): ContextReadActionRequester<T> {
  return yield { type: ContextActionType.Read, payload: { contextIdentifier } };
}
