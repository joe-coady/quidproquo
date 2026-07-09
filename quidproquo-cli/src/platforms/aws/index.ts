import { QpqPlatformDriver } from '../types';
import { awsGo } from './go';
import { awsGoDocker } from './goDocker';
import { awsPrimeDeployIdentity } from './identity';
import { awsPublish, awsPublishBuild, awsPublishDeploy, awsPublishUpload } from './publish';
import { awsTeardown } from './teardown';

export const awsPlatformDriver: QpqPlatformDriver = {
  primeDeployIdentity: awsPrimeDeployIdentity,

  go: awsGo,
  goDocker: awsGoDocker,
  teardown: awsTeardown,

  publish: awsPublish,
  publishBuild: awsPublishBuild,
  publishUpload: awsPublishUpload,
  publishDeploy: awsPublishDeploy,
};
