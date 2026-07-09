import { QpqAppDeployEnvironment } from 'quidproquo-deploy-awscdk';

// AWS deploy identity: service configs and the CDK app read
// AWS_DEFAULT_ACCOUNT / AWS_DEFAULT_REGION at load time, so they're primed
// into process.env from the environment's deploy.config.json entry. Already-set
// env vars win, so CI overrides and older setups keep working.
//
// Returns human-readable descriptions of anything still missing — deploys
// treat that as fatal, local dev commands ignore it.
export const awsPrimeDeployIdentity = (target: QpqAppDeployEnvironment | undefined): string[] => {
  if (target?.accountId && !process.env.AWS_DEFAULT_ACCOUNT) {
    process.env.AWS_DEFAULT_ACCOUNT = target.accountId;
  }
  if (target?.region && !process.env.AWS_DEFAULT_REGION) {
    process.env.AWS_DEFAULT_REGION = target.region;
  }

  const missing: string[] = [];
  if (!process.env.AWS_DEFAULT_ACCOUNT) missing.push('"accountId" (or AWS_DEFAULT_ACCOUNT)');
  if (!process.env.AWS_DEFAULT_REGION) missing.push('"region" (or AWS_DEFAULT_REGION)');
  return missing;
};
