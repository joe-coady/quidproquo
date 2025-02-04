import { DecomposedStringPrimitive } from '../../types';
import { LogActionType } from './LogActionType';
import { LogTemplateLiteralActionRequester } from './LogTemplateLiteralActionTypes';

export function* askLogTemplateLiteral(strings: TemplateStringsArray, ...variables: DecomposedStringPrimitive[]): LogTemplateLiteralActionRequester {
  return yield {
    type: LogActionType.TemplateLiteral,
    payload: {
      messageParts: [[...strings], variables],
    },
  };
}

export const askLog = askLogTemplateLiteral;
