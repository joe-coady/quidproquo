import { describe, expect, it } from 'vitest';

import { qpqConsoleLog } from '../types';
import { subscribeToConsoleLogs, unsubscribeFromConsoleLogs } from './consoleLogHook';

describe('consoleLogHook', () => {
  it('captures console.log into a subscribed array and stops after unsubscribe', () => {
    const captured: qpqConsoleLog[] = [];

    subscribeToConsoleLogs(captured);
    try {
      console.log('captured-line');

      expect(captured).toHaveLength(1);
      expect(captured[0].a).toEqual(['captured-line']);
      expect(typeof captured[0].t).toBe('string');
    } finally {
      unsubscribeFromConsoleLogs(captured);
    }

    console.log('after-unsubscribe');
    expect(captured).toHaveLength(1);
  });
});
