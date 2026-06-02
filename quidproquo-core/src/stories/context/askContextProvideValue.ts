import { ContextActionType, ContextReadActionPayload } from '../../actions/context';
import { ContextListAction } from '../../actions/context/ContextListActionTypes';
import { ContextReadAction } from '../../actions/context/ContextReadActionTypes';
import { AskResponse, AskResponseReturnType, EitherActionResult, QpqContext, QpqContextIdentifier } from '../../types';
import { askOverrideActions, getSuccessfulEitherActionResultIfRequired } from '../system/askOverrideActions';

export function* askContextProvideValue<R, T extends AskResponse<any>>(
  contextIdentifier: QpqContextIdentifier<R>,
  value: R,
  storyIterator: T,
): AskResponse<AskResponseReturnType<T>> {
  let cache: QpqContext<any> | null = null;

  return yield* askOverrideActions(storyIterator, {
    [ContextActionType.Read]: function* (action: ContextReadAction<any>) {
      const payload = action.payload as ContextReadActionPayload<any>;
      if (payload.contextIdentifier.uniqueName === contextIdentifier.uniqueName) {
        return getSuccessfulEitherActionResultIfRequired(value, action.returnErrors);
      }

      return yield action;
    },

    [ContextActionType.List]: function* (action:  ContextListAction) {
      // Local context is not part of the cross-service context list; stay transparent.
      if (contextIdentifier.local) {
        return yield action;
      }

      if (cache === null) {
        const parentContextValues = (yield {
          type: ContextActionType.List,
          returnErrors: true,
        }) as EitherActionResult<QpqContext<any>>;

        cache = {
          ...(parentContextValues.result || {}),
          [contextIdentifier.uniqueName]: value,
        };
      }

      return getSuccessfulEitherActionResultIfRequired(cache, action.returnErrors);
    },

    '*': function* (action) {
      // Local context rides in a separate bag that is stripped at service boundaries.
      const contextKey = contextIdentifier.local ? 'localContext' : 'context';
      return yield {
        ...action,
        [contextKey]: {
          [contextIdentifier.uniqueName]: value,
          ...action[contextKey],
        }
      };
    },
  });
}
