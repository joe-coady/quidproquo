import { actionResult, QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { WebEntryInvalidateCacheActionProcessor, WebEntryActionType } from 'quidproquo-webserver';

import { getCFExportNameDistributionIdArnFromConfig } from '../../../awsNamingUtils';

import { invalidateCache } from '../../../logic/cloudFront/invalidateCache';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getWebEntryInvalidteCacheActionProcessor = (
  qpqConfig: QPQConfig,
): WebEntryInvalidateCacheActionProcessor => {
  return async ({ paths, webEntryName }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const distributionId = await getExportedValue(
      getCFExportNameDistributionIdArnFromConfig(webEntryName, qpqConfig),
      region,
    );

    await invalidateCache(distributionId, region, paths);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [WebEntryActionType.InvalidateCache]: getWebEntryInvalidteCacheActionProcessor(qpqConfig),
  };
};
