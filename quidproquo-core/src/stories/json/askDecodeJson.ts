import { askThrowError } from '../../actions';
import { AskResponse, ErrorTypeEnum } from '../../types';

export function* askDecodeJson<T>(json: string, validateObject?: (item: T) => boolean): AskResponse<T> {
  try {
    const obj: T = JSON.parse(json) as T;

    if (validateObject && !validateObject(obj)) {
      return yield* askThrowError(
        ErrorTypeEnum.Invalid,
        `The provided JSON is valid, but the object structure or content is invalid according to the validation function.`,
      );
    }

    return obj;
  } catch (error) {
    return yield* askThrowError(
      ErrorTypeEnum.Invalid,
      `Failed to parse JSON. Ensure the input is a valid JSON string. Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
