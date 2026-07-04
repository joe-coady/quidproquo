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
        // We produce this value ourselves, so we shape it for returnErrors.
        return getSuccessfulEitherActionResultIfRequired(value, action.returnErrors);
      }

      // Not our identifier — relay the action and forward its result verbatim.
      return yield action;
    },

    [ContextActionType.List]: function* (action: ContextListAction) {
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

      // We produce this value ourselves, so we shape it for returnErrors.
      return getSuccessfulEitherActionResultIfRequired(cache, action.returnErrors);
    },

    '*': function* (action) {
      // Local context rides in a separate bag that is stripped at service boundaries.
      const contextKey = contextIdentifier.local ? 'localContext' : 'context';
      // Inject our context onto the action and relay it; the parent's result is already correctly
      // shaped, so we forward it verbatim.
      return yield {
        ...action,
        [contextKey]: {
          [contextIdentifier.uniqueName]: value,
          ...action[contextKey],
        },
      };
    },
  });
}
