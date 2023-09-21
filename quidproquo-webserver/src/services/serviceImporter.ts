import { getServiceEntry } from 'quidproquo-core';

const serviceEntryMap = {
  [getServiceEntry(
    'log',
    'controller',
    'logController',
  )]: require('../services/log/entry/controller/logController'),
  [getServiceEntry(
    'log',
    'storageDrive',
    'onCreate',
  )]: require('../services/log/entry/storageDrive/onCreate'),  
  [getServiceEntry(
    'migration', 
    'deployEvent', 
    'onDeploy'
  )]: require('../services/migration/entry/deployEvent/onDeploy'),
  [getServiceEntry(
    'seed', 
    'deployEvent', 
    'onDeploy'
  )]: require('../services/seed/entry/deployEvent/onDeploy'),
};

export const serviceImporter = async (modulePath: string): Promise<any> => {
  return serviceEntryMap[modulePath] || null;
};
