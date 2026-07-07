import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { LogActionType } from './LogActionType';
import { askLogDisableEventHistory } from './LogDisableEventHistoryActionRequester';

describe('askLogDisableEventHistory', () => {
  it('yields a DisableEventHistory action with the enable flag and reason', () => {
    const { action } = captureRequester(askLogDisableEventHistory(true, 'contains secrets'));

    expect(action).toEqual({
      type: LogActionType.DisableEventHistory,
      payload: {
        enable: true,
        reason: 'contains secrets',
      },
    });
  });

  it('passes the enable flag through unchanged', () => {
    const { action } = captureRequester(askLogDisableEventHistory(false, 're-enable'));

    expect(action).toEqual({
      type: LogActionType.DisableEventHistory,
      payload: {
        enable: false,
        reason: 're-enable',
      },
    });
  });
});
