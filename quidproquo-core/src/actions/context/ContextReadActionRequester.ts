import { ContextReadActionRequester } from './ContextReadActionTypes';
import { ContextActionType } from './ContextActionType';
import { QpqContextIdentifier } from '../../types';

export function* askContextRead<T>(contextIdentifier: QpqContextIdentifier<T>): ContextReadActionRequester<T> {
  return yield { type: ContextActionType.Read, payload: { contextIdentifier } };
}
