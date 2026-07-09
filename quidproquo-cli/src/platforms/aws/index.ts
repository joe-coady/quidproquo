import { QpqPlatformDriver } from '../types';
import { awsGo } from './go';
import { awsGoDocker } from './goDocker';
import { awsPrimeDeployIdentity } from './identity';
import { awsPublish, awsPublishBuild, awsPublishDeploy, awsPublishUpload } from './publish';

export const awsPlatformDriver: QpqPlatformDriver = {
  primeDeployIdentity: awsPrimeDeployIdentity,

  go: awsGo,
  goDocker: awsGoDocker,

  publish: awsPublish,
  publishBuild: awsPublishBuild,
  publishUpload: awsPublishUpload,
  publishDeploy: awsPublishDeploy,
};
