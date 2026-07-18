import { describe, expect, it } from 'vitest';

import { sendMessageToWebSocketConnection } from './webSocketConnectionRegistry';

describe('sendMessageToWebSocketConnection', () => {
  it('resolves without throwing when no matching connection is registered', async () => {
    await expect(sendMessageToWebSocketConnection('svc-a', 'api', 'unknown-conn', { hi: true })).resolves.toBeUndefined();
  });
});
