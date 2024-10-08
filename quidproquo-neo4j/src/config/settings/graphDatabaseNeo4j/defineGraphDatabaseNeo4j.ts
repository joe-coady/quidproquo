import path from 'path';
import { QPQConfig, defineActionProcessors, defineParameter, defineSecret } from 'quidproquo-core';

// export interface QPQConfigAdvancedGraphDatabaseNeo4jSettings extends QPQConfigAdvancedSettings {
//   owner?: CrossModuleOwner<'graphDatabaseName'>;
// }

// export interface GraphDatabaseNeo4jQPQConfigSetting extends QPQConfigSetting {
//   name: string;
// }

export const defineGraphDatabaseNeo4j = (databaseName: string): QPQConfig => [
  defineParameter(`neo4j-${databaseName}-instance`),
  defineSecret(`neo4j-${databaseName}-password`),
  defineActionProcessors(`full@${path.join(__dirname, '../../../actionProcessor/graphDatabaseOverride')}::getGraphDatabaseActionProcessor`),
];
