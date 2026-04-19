import { BootstrapCloudTrailQPQConfigSetting, qpqConfigAwsUtils } from 'quidproquo-config-aws';

import * as cdk from 'aws-cdk-lib';
import { aws_cloudtrail, aws_logs, aws_s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

export interface QpqBootstrapConfigCloudTrailConstructProps extends QpqConstructBlockProps {
  cloudTrailConfig: BootstrapCloudTrailQPQConfigSetting;
}

const SUPPORTED_RETENTION_DAYS: aws_logs.RetentionDays[] = [
  aws_logs.RetentionDays.ONE_DAY,
  aws_logs.RetentionDays.THREE_DAYS,
  aws_logs.RetentionDays.FIVE_DAYS,
  aws_logs.RetentionDays.ONE_WEEK,
  aws_logs.RetentionDays.TWO_WEEKS,
  aws_logs.RetentionDays.ONE_MONTH,
  aws_logs.RetentionDays.TWO_MONTHS,
  aws_logs.RetentionDays.THREE_MONTHS,
  aws_logs.RetentionDays.FOUR_MONTHS,
  aws_logs.RetentionDays.FIVE_MONTHS,
  aws_logs.RetentionDays.SIX_MONTHS,
  aws_logs.RetentionDays.ONE_YEAR,
  aws_logs.RetentionDays.THIRTEEN_MONTHS,
  aws_logs.RetentionDays.EIGHTEEN_MONTHS,
  aws_logs.RetentionDays.TWO_YEARS,
  aws_logs.RetentionDays.FIVE_YEARS,
  aws_logs.RetentionDays.TEN_YEARS,
];

const resolveLogRetention = (days?: number): aws_logs.RetentionDays => {
  if (!days) return aws_logs.RetentionDays.ONE_MONTH;
  return SUPPORTED_RETENTION_DAYS.find((v) => v >= days) ?? aws_logs.RetentionDays.TEN_YEARS;
};

export class QpqBootstrapConfigCloudTrailConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqBootstrapConfigCloudTrailConstructProps) {
    super(scope, id, props);

    const {
      name,
      retentionDays = 365,
      enableLogFileValidation = true,
      multiRegion = true,
      includeGlobalServiceEvents = true,
      cloudWatchLogs,
    } = props.cloudTrailConfig;

    const accountId = qpqConfigAwsUtils.getApplicationModuleDeployAccountId(props.qpqConfig);
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(props.qpqConfig);

    const bucket = new aws_s3.Bucket(this, 'logs', {
      bucketName: `qpq-cloudtrail-${accountId}-${region}-${name}`,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      encryption: aws_s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [{ expiration: cdk.Duration.days(retentionDays) }],
    });

    const logGroup = cloudWatchLogs
      ? new aws_logs.LogGroup(this, 'log-group', {
          logGroupName: `/qpq/cloudtrail/${name}`,
          retention: resolveLogRetention(cloudWatchLogs.retentionDays),
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        })
      : undefined;

    new aws_cloudtrail.Trail(this, 'trail', {
      trailName: `${name}-trail`,
      bucket,
      enableFileValidation: enableLogFileValidation,
      isMultiRegionTrail: multiRegion,
      includeGlobalServiceEvents,
      sendToCloudWatchLogs: !!logGroup,
      cloudWatchLogGroup: logGroup,
    });
  }
}
