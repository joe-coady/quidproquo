import { Construct } from 'constructs';
import { aws_iam, aws_s3, aws_s3_deployment } from 'aws-cdk-lib';
import * as cdk from "aws-cdk-lib";

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { qpqCoreUtils } from 'quidproquo-core';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';

export interface ApiCodeStorageProps extends QpqConstructBlockProps {}

export class ApiCodeStorage extends QpqConstructBlock {
  bucket: aws_s3.IBucket;

  constructor(scope: Construct, id: string, props: ApiCodeStorageProps) {
    super(scope, id, props);

    this.bucket = new aws_s3.Bucket(this, 'bucket', {
      bucketName: this.qpqResourceName('code', 'api'),
      // Enable public access to this bucket
      publicReadAccess: true,
    
      // Allow bucket to auto delete upon cdk:Destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    
    // Optionally, add a bucket policy to allow public read access
    this.bucket.addToResourcePolicy(new aws_iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [`${this.bucket.bucketArn}/*`],
      principals: [new aws_iam.AnyPrincipal()],
    }));

    // const buildPath = qpqConfigAwsUtils.getApiBuildPath(props.qpqConfig);
    // new aws_s3_deployment.BucketDeployment(this, 'bucket-deploy', {
    //   sources: [aws_s3_deployment.Source.asset(buildPath)],
    //   destinationBucket: this.bucket,
    // });
  }

  public static authorizeActionsForRole(
    role: aws_iam.IRole,
    apiCodeStorage: ApiCodeStorage
  ) {
    role.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ['s3:GetObject', 's3:ListBucket'],
        resources: [
          apiCodeStorage.bucket.bucketArn,
          apiCodeStorage.bucket.arnForObjects('*'),
        ],
      }),
    );
  }
}
