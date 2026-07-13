import { Action, FileActionType, QPQ_LOGS_STORAGE_DRIVE_NAME, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askGetByCorrelation } from './logData';

describe('askGetByCorrelation', () => {
  it('reads the correlation log object from the logs storage drive', () => {
    let captured: Action<any> | undefined;
    const storyResult = { correlation: 'abc', result: 'ok' };

    const result = runStory(askGetByCorrelation('abc'), {
      [FileActionType.ReadObjectJson]: (action: Action<any>) => {
        captured = action;
        return storyResult;
      },
    });

    expect(captured?.payload).toEqual({ drive: QPQ_LOGS_STORAGE_DRIVE_NAME, filepath: 'abc.json' });
    expect(result).toBe(storyResult);
  });
});
