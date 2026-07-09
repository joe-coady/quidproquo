// Account-level guardrail extras (audit trail, budget + cost anomaly alerts,
// GuardDuty posture), deployed once per AWS account as the statically named
// 'qpq-account' stack. Exactly one repo/config owns this per account, and
// actor deploys must not deploy it — account resources have nothing to do with
// any app's lifecycle. Identity plumbing comes from the workspace CDK app.
import { QPQConfig } from 'quidproquo';
import {
  AwsDataStoreRemovalPolicy,
  defineAccountBudget,
  defineAccountCloudTrail,
  defineAccountSecurityServices,
  defineAwsDataStoreRemovalPolicy,
} from 'quidproquo-config-aws';

export default (): QPQConfig => [
  // Dev account: deleting the account stack takes the CloudTrail bucket
  // (and its audit history) with it.
  defineAwsDataStoreRemovalPolicy(AwsDataStoreRemovalPolicy.destroy),

  defineAccountCloudTrail('main', {
    cloudWatchLogs: {
      retentionDays: 30,
    },
  }),

  defineAccountBudget('main', 30, ['joecoady@gmail.com']),

  defineAccountSecurityServices({
    // GuardDuty is org-managed for this account
    // (delegated admin 816650600287 auto-enables detectors - a stack-created one
    // would collide), and Security Hub is off pending the AWS Config cost decision.
    enableGuardDuty: false,
    enableSecurityHub: false,
    cognitoAuthFailureAlert: {
      emails: ['joecoady@gmail.com'],
      thresholdPer5Minutes: 10,
    },
  }),
];
