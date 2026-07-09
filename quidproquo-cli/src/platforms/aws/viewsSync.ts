// Views upload to S3. Bucket names resolve from the shell service's config.
// shell is the module-federation host: its bundle is the root website, so it
// syncs to the 'website' bucket root AND to its prefix in the shared 'views'
// bucket (where every other service's views live).
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { loadServiceQpqConfig } from '../../lib/qpqConfigs';
import { runCommand } from '../../lib/runCommand';
import { getViewsDistDir } from '../../lib/views';

export const getViewsS3Destinations = (appName: string, serviceName: string): string[] => {
  const shellConfig = loadServiceQpqConfig(appName, 'shell');
  const viewsBucketName = awsNamingUtils.getConfigRuntimeResourceNameFromConfig('views', shellConfig);

  const destinations = [`s3://${viewsBucketName}/${serviceName}`];

  if (serviceName === 'shell') {
    const websiteBucketName = awsNamingUtils.getConfigRuntimeResourceNameFromConfig('website', shellConfig);
    destinations.push(`s3://${websiteBucketName}`);
  }

  return destinations;
};

export const syncViewsToS3 = async (appName: string, serviceName: string): Promise<void> => {
  for (const destination of getViewsS3Destinations(appName, serviceName)) {
    console.log(`Copying [${serviceName}] views to [${destination}]`);
    await runCommand('aws', ['s3', 'sync', getViewsDistDir(appName, serviceName), destination]);
  }
};
