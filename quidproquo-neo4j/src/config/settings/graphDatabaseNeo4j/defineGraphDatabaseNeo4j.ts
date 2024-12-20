import { defineActionProcessors, defineParameter, defineRecurringSchedule, defineSecret, QPQConfig } from 'quidproquo-core';

import path from 'path';

// export interface QPQConfigAdvancedGraphDatabaseNeo4jSettings extends QPQConfigAdvancedSettings {
//   owner?: CrossModuleOwner<'graphDatabaseName'>;
// }

// export interface GraphDatabaseNeo4jQPQConfigSetting extends QPQConfigSetting {
//   name: string;
// }

export enum Neo4jVersion {
  Version5 = 'version5',
}

export const defineGraphDatabaseNeo4j = (databaseName: string, version: Neo4jVersion = Neo4jVersion.Version5): QPQConfig => [
  defineParameter(`neo4j-${databaseName}-instance`),
  defineSecret(`neo4j-${databaseName}-password`),

  defineActionProcessors(
    `full@${path.join(__dirname, `../../../actionProcessor/graphDatabaseOverride/${version}`)}::getGraphDatabaseActionProcessor`,
  ),

  defineRecurringSchedule(
    '0 0 * * ? *', // 12am every day (UTC)
    // '* * * * ? *', // every min (for testing)
    `full@${path.join(__dirname, '../../../entry/scheduledEvents/keepAlive')}::keepAlive`,
    {
      metadata: {
        databaseName: databaseName,
      },
    },
  ),
];
