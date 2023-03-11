import {
  CloudFrontClient,
  CreateInvalidationCommand,
  CreateInvalidationCommandInput,
} from '@aws-sdk/client-cloudfront';

import crypto from 'crypto';

export const getInvalidationCallerReference = (paths: string[]): string => {
  const allPaths = paths.join('');

  // All paths as a hash
  const allPathHash = crypto.createHash('md5').update(allPaths).digest('hex');

  // Unique key is the now time with all paths hash
  return allPathHash + new Date().toISOString();
};

export const invalidateCache = async (
  distributionId: string,
  region: string,
  paths: string[],
): Promise<void> => {
  const cloudformation = new CloudFrontClient({ region });
  const input: CreateInvalidationCommandInput = {
    DistributionId: distributionId,
    InvalidationBatch: {
      Paths: {
        Quantity: paths.length,
        Items: paths,
      },
      CallerReference: getInvalidationCallerReference(paths),
    },
  };

  await cloudformation.send(new CreateInvalidationCommand(input));
};
