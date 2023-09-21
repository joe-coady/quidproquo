import { StorageDriveQPQConfigSetting, QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { Construct } from 'constructs';
import { aws_lambda, aws_s3, aws_s3_notifications } from 'aws-cdk-lib';
import { QpqCoreStorageDriveConstruct } from './QpqCoreStorageDriveConstruct';
import { Function } from '../../../basic/Function';

export interface QpqApiCoreStorageDriveConstructProps extends QpqConstructBlockProps {
  storageDriveConfig: StorageDriveQPQConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqApiCoreStorageDriveConstruct extends QpqConstructBlock {

  constructor(scope: Construct, id: string, props: QpqApiCoreStorageDriveConstructProps) {
    super(scope, id, props);

    if (props.storageDriveConfig.onEvent?.create) {
      const bucket = QpqCoreStorageDriveConstruct.fromOtherStack(
        scope, 
        'bucket', 
        props.qpqConfig, 
        props.storageDriveConfig, 
        props.awsAccountId
      ).bucket;

      const func = new Function(this, 'api-function', {
        buildPath: qpqCoreUtils.getStorageDriveEntryFullPath(props.qpqConfig, props.storageDriveConfig),
        functionName: this.resourceName(`${props.storageDriveConfig.storageDrive}-onCreate`),
        
        functionType: 'lambdaS3FileEvent',
        executorName: 'executeS3FileEvent',
  
        qpqConfig: props.qpqConfig,
  
        apiLayerVersions: props.apiLayerVersions,
  
        awsAccountId: props.awsAccountId
      });
  
      bucket.addEventNotification(
        aws_s3.EventType.OBJECT_CREATED,
        new aws_s3_notifications.LambdaDestination(func.lambdaFunction),
      );
    }
  }
}
