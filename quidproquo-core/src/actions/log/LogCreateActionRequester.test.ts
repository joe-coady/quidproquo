import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { LogLevelEnum } from '../../types/LogLevelEnum';
import { LogActionType } from './LogActionType';
import { askLogCreate } from './LogCreateActionRequester';

describe('askLogCreate', () => {
  it('yields a Create action with the level, message and data', () => {
    const { action } = captureRequester(askLogCreate(LogLevelEnum.Info, 'hello', { extra: true }));

    expect(action).toEqual({
      type: LogActionType.Create,
      payload: {
        logLevel: LogLevelEnum.Info,
        msg: 'hello',
        data: { extra: true },
      },
    });
  });

  it('maps data to undefined when omitted', () => {
    const { action } = captureRequester(askLogCreate(LogLevelEnum.Error, 'boom'));

    expect(action).toEqual({
      type: LogActionType.Create,
      payload: {
        logLevel: LogLevelEnum.Error,
        msg: 'boom',
        data: undefined,
      },
    });
  });
});
