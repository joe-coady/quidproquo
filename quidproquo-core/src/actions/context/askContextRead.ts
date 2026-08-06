import { QpqContextIdentifier } from '../../types';
import { AskResponse } from '../../types/StorySession';
import { createActionRequester } from '../../types/utils/createActionRequester';
import { ContextActionType } from './ContextActionType';

export const askContextReadBase = createActionRequester<unknown>()({
  actionType: ContextActionType.Read,
  getPayload: (contextIdentifier: QpqContextIdentifier<unknown>) => ({ contextIdentifier }),
});

// The context's value type travels on the identifier, so the base returns unknown and
// this story casts it back to what the identifier declared.
export function* askContextRead<T>(contextIdentifier: QpqContextIdentifier<T>): AskResponse<T> {
  return (yield* askContextReadBase(contextIdentifier as QpqContextIdentifier<unknown>)) as T;
}
