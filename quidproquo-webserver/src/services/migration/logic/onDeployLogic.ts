/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
    AskResponse,
    DeployEventStatusType,
    DeployEventType,
    QueueMessage,
    askConfigGetGlobal,
    askQueueSendMessages
} from 'quidproquo-core';
import { Migration } from '../../../config/settings/migration';

import * as migrationInfoData from '../data/migrationInfoData';

export function* onDeploy(
    deployEventType: DeployEventType,
    deployEventStatusType: DeployEventStatusType
): AskResponse<void> {
  // Make sure its only for updates
  if (deployEventStatusType !== DeployEventStatusType.Update) {
    return;
  }

  const allMigrations = yield* askConfigGetGlobal<Migration[]>('qpqMigrations');
  const migrationsForThisDeploy = allMigrations.filter(m => m.deployType === deployEventType);

  for (const migration of migrationsForThisDeploy) {
    const migrationInfo = yield* migrationInfoData.askGetMigrationBySrcPath(migration.src.src);

    // Ignore if we have already run it.
    if (migrationInfo) {
      continue;
    }

    // Send a message to the queue to run the migration.
    const message: QueueMessage<undefined> = {
      type: migration.src.src,
      payload: undefined,
    };
  
    yield* askQueueSendMessages('qpqMigrations', message);

    console.log("test");

    // insert the migration into into the database so 
    yield* migrationInfoData.askUpsert({
      deployType: migration.deployType,
      srcPath: migration.src.src,
    });
  }
}
