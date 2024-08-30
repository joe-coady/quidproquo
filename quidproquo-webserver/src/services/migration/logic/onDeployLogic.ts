/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AskResponse,
  DeployEventStatusType,
  DeployEventType,
  QpqFunctionRuntime,
  QueueMessage,
  askConfigGetGlobal,
  askQueueSendMessages,
  qpqCoreUtils,
} from 'quidproquo-core';
import { Migration } from '../../../config/settings/migration';

import * as migrationInfoData from '../data/migrationInfoData';

export function* askProcessOnDeployCreate(): AskResponse<void> {
  const allMigrations = yield* askConfigGetGlobal<Migration[]>('qpqMigrations');

  // Insert all migrations into the database
  // we don't need to run any current migrations
  // because database should be ready with seed data.
  for (const migration of allMigrations) {
    // We remove the leading slash for backward compatibility
    yield* migrationInfoData.askUpsert({
      deployType: migration.deployType,
      srcPath: qpqCoreUtils.getSrcPathFromQpqFunctionRuntimeWithoutLeadingSlash(migration.runtime),
    });
  }
}

export function* askProcessOnDeployUpdate(deployEventType: DeployEventType): AskResponse<void> {
  const allMigrations = yield* askConfigGetGlobal<Migration[]>('qpqMigrations');
  const migrationsForThisDeploy = allMigrations.filter((m) => m.deployType === deployEventType);

  for (const migration of migrationsForThisDeploy) {
    const migrationInfo = yield* migrationInfoData.askGetMigrationBySrcPath(
      qpqCoreUtils.getSrcPathFromQpqFunctionRuntimeWithoutLeadingSlash(migration.runtime),
    );

    // Ignore if we have already run it.
    if (migrationInfo) {
      continue;
    }

    // Send a message to the queue to run the migration.
    const message: QueueMessage<undefined> = {
      type: qpqCoreUtils.getSrcPathFromQpqFunctionRuntimeWithoutLeadingSlash(migration.runtime),
      payload: undefined,
    };

    yield* askQueueSendMessages('qpqMigrations', message);

    // Insert the migration into into the database
    yield* migrationInfoData.askUpsert({
      deployType: migration.deployType,
      srcPath: qpqCoreUtils.getSrcPathFromQpqFunctionRuntimeWithoutLeadingSlash(migration.runtime),
    });
  }
}

export function* onDeploy(deployEventType: DeployEventType, deployEventStatusType: DeployEventStatusType): AskResponse<void> {
  if (deployEventStatusType === DeployEventStatusType.Update) {
    yield* askProcessOnDeployUpdate(deployEventType);
  } else if (deployEventStatusType === DeployEventStatusType.Create) {
    yield* askProcessOnDeployCreate();
  }
}
