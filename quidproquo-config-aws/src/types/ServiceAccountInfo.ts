export type ServiceAccountInfo = {
  moduleName: string;

  applicationName?: string;
  environment?: string;
  feature?: string;

  awsAccountId: string;
  awsRegion: string;
};
