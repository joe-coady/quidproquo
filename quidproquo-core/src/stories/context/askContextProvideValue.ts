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
      return yield {
        ...action,
        context: {
          [contextIdentifier.uniqueName]: value,
          ...(action.context || {}),
        }
      };
    },
  });
}
