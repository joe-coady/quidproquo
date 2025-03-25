import {
  CrossModuleOwner,
  defineActionProcessors,
  defineParameter,
  defineRecurringSchedule,
  defineSecret,
  QPQConfig,
  QPQConfigAdvancedSettings,
  QPQConfigSetting,
  QpqFunctionRuntimeAbsolutePath,
} from 'quidproquo-core';

export interface QPQConfigAdvancedGraphDatabaseNeo4jSettings extends QPQConfigAdvancedSettings {
  owner?: CrossModuleOwner<'graphDatabaseName'>;
  version?: Neo4jVersion;
}

export interface GraphDatabaseNeo4jQPQConfigSetting extends QPQConfigSetting {
  name: string;
}

export enum Neo4jVersion {
  Version5 = 'version5',
}

const fullQpqFunctionRuntime = (relativePath: string, functionName: string): QpqFunctionRuntimeAbsolutePath => {
  return {
    basePath: __dirname,
    relativePath: relativePath,
    functionName,
  };
};

export const defineGraphDatabaseNeo4j = (databaseName: string, options?: QPQConfigAdvancedGraphDatabaseNeo4jSettings): QPQConfig => {
  const version = options?.version || Neo4jVersion.Version5;

  return [
    defineParameter(`neo4j-${databaseName}-instance`, {
      owner: options?.owner,
    }),
    defineSecret(`neo4j-${databaseName}-password`, {
      owner: options?.owner,
    }),

    defineActionProcessors(fullQpqFunctionRuntime(`../../../actionProcessor/graphDatabaseOverride/${version}`, 'getGraphDatabaseActionProcessor')),

    defineRecurringSchedule(
      '0 0 * * ? *', // 12am every day (UTC)
      // '* * * * ? *', // every min (for testing)
      fullQpqFunctionRuntime('../../../entry/scheduledEvents/keepAlive', 'keepAlive'),
      {
        metadata: {
          databaseName: databaseName,
        },
        owner: options?.owner,
      },
    ),
  ];
};
