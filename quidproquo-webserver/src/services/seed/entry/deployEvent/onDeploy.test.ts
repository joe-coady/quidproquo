import { ConfigActionType, DeployEvent, DeployEventStatusType, DeployEventType, QueueActionType, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { onDeploy } from './onDeploy';

describe('seed deployEvent onDeploy', () => {
  it('delegates the deploy event to the seed logic', () => {
    const event: DeployEvent = { deployEventType: DeployEventType.Api, deployEventStatusType: DeployEventStatusType.Create };

    const messages: any[] = [];

    runStory(onDeploy(event), {
      [ConfigActionType.GetGlobal]: ['seed/a::run'],
      [QueueActionType.SendMessages]: (action: any) => {
        messages.push(action.payload);
        return undefined;
      },
    });

    expect(messages).toEqual([{ queueName: 'qpqSeeds', queueMessages: [{ type: 'seed/a::run', payload: undefined }] }]);
  });
});
