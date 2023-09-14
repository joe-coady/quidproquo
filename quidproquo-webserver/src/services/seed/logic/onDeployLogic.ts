/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
    AskResponse,
    DeployEventStatusType,
    QpqSourceEntry,
    QueueMessage,
    askConfigGetGlobal,
    askQueueSendMessages
} from 'quidproquo-core';

export function* askProcessOnDeployCreate(): AskResponse<void> {
  const allSeeds = yield* askConfigGetGlobal<QpqSourceEntry[]>('qpqSeeds');

  // For each seed, send a message to the queue to run the seed script
  for (const seed of allSeeds) {
    // Send a message to the queue to run the migration.
    const message: QueueMessage<undefined> = {
      type: seed.src,
      payload: undefined,
    };
  
    yield* askQueueSendMessages('qpqSeeds', message);
  }
}

export function* onDeploy(
  deployEventStatusType: DeployEventStatusType
): AskResponse<void> {
  if (deployEventStatusType === DeployEventStatusType.Create) {
    yield* askProcessOnDeployCreate();
  }
}
