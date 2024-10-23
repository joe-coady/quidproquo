import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { WebEntryActionType,WebEntryInvalidateCacheActionProcessor } from 'quidproquo-webserver';

import { getCFExportNameDistributionIdArnFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { invalidateCache } from '../../../logic/cloudFront/invalidateCache';

const getProcessInvalidateCache = (qpqConfig: QPQConfig): WebEntryInvalidateCacheActionProcessor => {
  return async ({ paths, webEntryName }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const distributionId = await getExportedValue(getCFExportNameDistributionIdArnFromConfig(webEntryName, qpqConfig), region);

    await invalidateCache(distributionId, region, paths);

    return actionResult(void 0);
  };
};

export const getWebEntryInvalidateCacheActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [WebEntryActionType.InvalidateCache]: getProcessInvalidateCache(qpqConfig),
});
