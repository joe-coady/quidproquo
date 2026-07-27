import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { ResolvedDevServerConfig } from '../../../types';
import { getCryptoDecryptActionProcessor } from './getCryptoDecryptActionProcessor';
import { getCryptoEncryptActionProcessor } from './getCryptoEncryptActionProcessor';

export const getCryptoActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, dynamicModuleLoader: DynamicModuleLoader): Promise<ActionProcessorList> => ({
    ...(await getCryptoEncryptActionProcessor(devServerConfig)(qpqConfig, dynamicModuleLoader)),
    ...(await getCryptoDecryptActionProcessor(devServerConfig)(qpqConfig, dynamicModuleLoader)),
  });
