import { askDelay } from '../actions';
import { AskResponse } from '../types';
import { askCatch } from './system';

export function* askRetry<R>(
  askRunLogic: () => AskResponse<R>,
  maxRetries: number,
  timeToWaitMs: number,
  errorTypeRetryList?: string[],
): ReturnType<typeof askCatch<AskResponse<R>>> {
  let attempt = 0;

  while (true) {
    const result = yield* askCatch(askRunLogic());
    attempt = attempt + 1;

    if (result.success || attempt > maxRetries) {
      return result;
    }

    if (errorTypeRetryList) {
      if (!errorTypeRetryList.includes(result.error.errorType)) {
        return result;
      }
    }

    yield* askDelay(timeToWaitMs);
  }
}
