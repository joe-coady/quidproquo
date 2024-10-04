import path from 'path';

import { QPQConfig, QPQConfigAdvancedSettings } from 'quidproquo-core';
import { defineServiceFunction } from 'quidproquo-webserver';

export interface QPQConfigAdvancedDevServerSettings extends QPQConfigAdvancedSettings {
  onlyDeploySafe?: boolean;
  vpcList?: string[];
}

export const defineDevServerConfig = (buildPath: string, advancedSettings?: QPQConfigAdvancedDevServerSettings): QPQConfig => {
  const onlyDeploySafe = advancedSettings?.onlyDeploySafe ?? true;
  const vpcList: string[] = advancedSettings?.vpcList || [];

  const pathToRuntime = path.join(__dirname, '../../entry/serviceFunction/runCypherQuery');

  const graphAccessConfigs = vpcList.map((vpcName) =>
    defineServiceFunction(buildPath, `full@${pathToRuntime}::runCypherQuery`, {
      virtualNetworkName: vpcName,
      functionName: `graphQuery${vpcName}`,
    }),
  );

  const alwaysSafeConfigs: QPQConfig = [...graphAccessConfigs];
  const notSafeConfigs: QPQConfig = [];

  return [...(!onlyDeploySafe ? notSafeConfigs : []), ...alwaysSafeConfigs];
};
