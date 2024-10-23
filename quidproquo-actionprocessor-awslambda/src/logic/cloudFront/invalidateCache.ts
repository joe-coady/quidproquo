import crypto from 'crypto';
import { CloudFrontClient, CreateInvalidationCommand, CreateInvalidationCommandInput } from '@aws-sdk/client-cloudfront';

import { createAwsClient } from '../createAwsClient';

export const getInvalidationCallerReference = (paths: string[]): string => {
  const allPaths = paths.join('');

  // All paths as a hash
  const allPathHash = crypto.createHash('md5').update(allPaths).digest('hex');

  // Unique key is the now time with all paths hash
  return allPathHash + new Date().toISOString();
};

export const invalidateCache = async (distributionId: string, region: string, paths: string[]): Promise<void> => {
  const cloudFrontClient = createAwsClient(CloudFrontClient, { region });

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

  await cloudFrontClient.send(new CreateInvalidationCommand(input));
};
