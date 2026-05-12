import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { QPQConfig, qpqCoreUtils, StorageDriveLifecycleRule, StorageDriveQPQConfigSetting, StorageDriveTransition } from 'quidproquo-core';

import { aws_iam, aws_kms, aws_s3, aws_s3_deployment } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { qpqAwsCdkPathUtils } from '../../../../utils';
import * as qpqDeployAwsCdkUtils from '../../../../utils/qpqDeployAwsCdkUtils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';
export interface QpqCoreStorageDriveConstructProps extends QpqConstructBlockProps {
  storageDriveConfig: StorageDriveQPQConfigSetting;
}

export abstract class QpqCoreStorageDriveConstructBase extends QpqConstructBlock implements QpqResource {
  abstract bucket: aws_s3.IBucket;

  public grantRead(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.bucket.grantRead(grantee);
  }

  public grantWrite(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.bucket.grantWrite(grantee);
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

const convertStorageDriveTransitionToAwsS3Transition = (storageDriveTransition: StorageDriveTransition): aws_s3.Transition => ({
  storageClass: aws_s3.StorageClass.DEEP_ARCHIVE,
  transitionAfter:
    typeof storageDriveTransition.transitionAfterDays === 'number' ? cdk.Duration.days(storageDriveTransition.transitionAfterDays) : undefined,
  transitionDate: typeof storageDriveTransition.transitionDate === 'string' ? new Date(storageDriveTransition.transitionDate) : undefined,
});

const convertStorageDriveLifecycleRuleToAwsS3LifecycleRule = (lifecycleRule: StorageDriveLifecycleRule): aws_s3.LifecycleRule => ({
  prefix: lifecycleRule.prefix,
  expiration: lifecycleRule.deleteAfterDays ? cdk.Duration.days(lifecycleRule.deleteAfterDays) : undefined,
  objectSizeGreaterThan: lifecycleRule.fileSizeGreaterThan,
  objectSizeLessThan: lifecycleRule.fileSizeLessThan,
  transitions: lifecycleRule.transitions?.map(convertStorageDriveTransitionToAwsS3Transition),
});

export class QpqCoreStorageDriveConstruct extends QpqCoreStorageDriveConstructBase {
  bucket: aws_s3.IBucket;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    storageDriveConfig: StorageDriveQPQConfigSetting,
  ): QpqCoreStorageDriveConstructBase {
    class Import extends QpqCoreStorageDriveConstructBase {
      bucket = aws_s3.Bucket.fromBucketName(scope, `${id}-${storageDriveConfig.uniqueKey}`, this.resourceName(storageDriveConfig.storageDrive));
    }

    return new Import(scope, id, { qpqConfig });
  }

  constructor(scope: Construct, id: string, props: QpqCoreStorageDriveConstructProps) {
    super(scope, id, props);

    let bucketEncryption: aws_s3.BucketEncryption = aws_s3.BucketEncryption.UNENCRYPTED;
    let encryptionKey: aws_kms.IKey | undefined;
    if (props.storageDriveConfig.encryption) {
      const kmsCfg = qpqConfigAwsUtils.getAwsKmsKeyForStorageDrive(props.qpqConfig, props.storageDriveConfig);
      if (kmsCfg) {
        encryptionKey = aws_kms.Key.fromKeyArn(this, 'enc-key', kmsCfg.arn);
        bucketEncryption = aws_s3.BucketEncryption.KMS;
      } else {
        bucketEncryption = aws_s3.BucketEncryption.S3_MANAGED;
      }
    }

    this.bucket = new aws_s3.Bucket(this, 'bucket', {
      bucketName: this.resourceName(props.storageDriveConfig.storageDrive),

      // Disable public access to this bucket, CloudFront will do that
      publicReadAccess: false,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,

      // Allow bucket to auto delete upon cdk:Destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,

      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [aws_s3.HttpMethods.GET, aws_s3.HttpMethods.HEAD],
          allowedHeaders: ['*'],
        },
      ],

      lifecycleRules: props.storageDriveConfig.lifecycleRules?.map(convertStorageDriveLifecycleRuleToAwsS3LifecycleRule),

      encryption: bucketEncryption,
      encryptionKey,
      bucketKeyEnabled: bucketEncryption === aws_s3.BucketEncryption.KMS,
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(this.bucket, props.qpqConfig);

    const awsAccountId = qpqConfigAwsUtils.getApplicationModuleDeployAccountId(props.qpqConfig);

    // TODO: Only do this IF a cloud front dist wants to use it
    // same with cors above.
    this.bucket.addToResourcePolicy(
      new aws_iam.PolicyStatement({
        sid: 'AllowCloudFrontServicePrincipal',
        effect: aws_iam.Effect.ALLOW,
        principals: [new aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [this.bucket.arnForObjects('*')],
        conditions: {
          StringLike: {
            'AWS:SourceArn': `arn:aws:cloudfront::${awsAccountId}:distribution/*`,
          },
        },
      }),
    );

    // if (props.storageDriveConfig.global) {
    //   this.bucket.addToResourcePolicy(
    //     new aws_iam.PolicyStatement({
    //       sid: 'AllowAllEntitiesInAccount',
    //       effect: aws_iam.Effect.ALLOW,
    //       principals: [new aws_iam.AccountPrincipal(props.awsAccountId)],
    //       actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket', 's3:DeleteObject'],
    //       resources: [this.bucket.arnForObjects('*'), this.bucket.bucketArn],
    //     }),
    //   );
    // }

    if (props.storageDriveConfig.copyPath) {
      const srcDir = qpqAwsCdkPathUtils.getStorageDriveUploadFullPath(props.qpqConfig, props.storageDriveConfig);

      new aws_s3_deployment.BucketDeployment(this, 'bucket-deploy', {
        sources: [aws_s3_deployment.Source.asset(srcDir)],
        destinationBucket: this.bucket,
      });
    }
  }

  public static authorizeActionsForRole(role: aws_iam.IRole, qpqConfig: QPQConfig, ownedStorageDrives: QpqCoreStorageDriveConstruct[]) {
    // CDK-known ARNs for drives created in this stack.
    const ownedArns = ownedStorageDrives.flatMap((sd) => [sd.bucket.bucketArn, sd.bucket.arnForObjects('*')]);

    // Deterministically-computed ARNs for drives declared in this service's
    // config but owned by another service. Uses the same naming path as
    // `resolveStorageDriveBucketName` so no CDK cross-stack ref is created.
    const allDriveConfigs = qpqCoreUtils.getStorageDrives(qpqConfig);
    const ownedDriveConfigs = qpqCoreUtils.getOwnedStorageDrives(qpqConfig);
    const foreignDriveConfigs = allDriveConfigs.filter((cfg) => !ownedDriveConfigs.includes(cfg));

    const foreignArns = foreignDriveConfigs.flatMap((cfg) => {
      const bucketName = awsNamingUtils.getConfigRuntimeResourceNameFromConfigWithServiceOverride(
        cfg.owner?.resourceNameOverride || cfg.storageDrive,
        qpqConfig,
        cfg.owner?.module,
      );
      const bucketArn = `arn:aws:s3:::${bucketName}`;
      return [bucketArn, `${bucketArn}/*`];
    });

    const resources = [...ownedArns, ...foreignArns];
    if (resources.length === 0) return;

    role.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
        resources,
      }),
    );

    // Grant KMS permissions for any encrypted drives (owned or foreign) whose
    // customer-managed key is declared in this service's config.
    const kmsArns = [...ownedDriveConfigs, ...foreignDriveConfigs]
      .filter((cfg) => cfg.encryption)
      .map((cfg) => qpqConfigAwsUtils.getAwsKmsKeyForStorageDrive(qpqConfig, cfg)?.arn)
      .filter((arn): arn is string => Boolean(arn));

    if (kmsArns.length > 0) {
      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: ['kms:Decrypt', 'kms:GenerateDataKey*', 'kms:DescribeKey', 'kms:Encrypt', 'kms:ReEncrypt*'],
          resources: [...new Set(kmsArns)],
        }),
      );
    }
  }
}
