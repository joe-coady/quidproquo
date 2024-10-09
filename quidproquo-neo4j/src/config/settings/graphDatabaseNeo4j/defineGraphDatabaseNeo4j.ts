import path from 'path';
import { QPQConfig, defineActionProcessors, defineParameter, defineRecurringSchedule, defineSecret } from 'quidproquo-core';

// export interface QPQConfigAdvancedGraphDatabaseNeo4jSettings extends QPQConfigAdvancedSettings {
//   owner?: CrossModuleOwner<'graphDatabaseName'>;
// }

// export interface GraphDatabaseNeo4jQPQConfigSetting extends QPQConfigSetting {
//   name: string;
// }

export const defineGraphDatabaseNeo4j = (databaseName: string, apiBuildPath: string): QPQConfig => [
  defineParameter(`neo4j-${databaseName}-instance`),
  defineSecret(`neo4j-${databaseName}-password`),
  defineActionProcessors(`full@${path.join(__dirname, '../../../actionProcessor/graphDatabaseOverride')}::getGraphDatabaseActionProcessor`),
  defineRecurringSchedule(
    '0 0 * * ? *', // 12am every day (UTC)
    // '* * * * ? *', // every min (for testing)
    `full@${path.join(__dirname, '../../../entry/scheduledEvents/keepAlive')}::keepAlive`,
    apiBuildPath,
    {
      metadata: {
        databaseName: databaseName,
      },
    },
  ),
];
