import { getServiceEntry } from '../utils/serviceConfig';

const serviceEntryMap = {
  [getServiceEntry(
    'log',
    'controller',
    'logController',
  )]: require('../services/log/entry/controller/logController'),
  [getServiceEntry(
    'migration', 
    'deployEvent', 
    'onDeploy'
  )]: require('../services/migration/entry/deployEvent/onDeploy'),
};

export const serviceImporter = async (modulePath: string): Promise<any> => {
  return serviceEntryMap[modulePath] || null;
};
