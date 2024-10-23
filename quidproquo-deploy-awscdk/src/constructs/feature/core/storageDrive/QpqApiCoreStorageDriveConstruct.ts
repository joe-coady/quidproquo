import { aws_lambda, aws_s3, aws_s3_notifications } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { QPQConfig, qpqCoreUtils,StorageDriveQPQConfigSetting } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Function } from '../../../basic/Function';
import { QpqCoreStorageDriveConstruct } from './QpqCoreStorageDriveConstruct';

export interface QpqApiCoreStorageDriveConstructProps extends QpqConstructBlockProps {
  storageDriveConfig: StorageDriveQPQConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqApiCoreStorageDriveConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqApiCoreStorageDriveConstructProps) {
    super(scope, id, props);

    const bucket = QpqCoreStorageDriveConstruct.fromOtherStack(
      scope,
      `bucket-${id}`,
      props.qpqConfig,
      props.storageDriveConfig,
      props.awsAccountId,
    ).bucket;

    if (props.storageDriveConfig.onEvent?.create) {
      const func = new Function(this, 'create', {
        reacreateOnFunctionNameChange: true,
        functionName: this.qpqResourceName(props.storageDriveConfig.storageDrive, 's3Create'),

        functionType: 's3Event_fileEvent',
        executorName: 's3Event_fileEvent',

        qpqConfig: props.qpqConfig,

        apiLayerVersions: props.apiLayerVersions,

        awsAccountId: props.awsAccountId,

        environment: {
          // Never change: storageDriveName ~ Its hard coded to stop logs being recursive
          storageDriveName: props.storageDriveConfig.storageDrive,
          storageDriveEntry: JSON.stringify(props.storageDriveConfig.onEvent?.create),
        },

        role: this.getServiceRole(),
      });

      bucket.addEventNotification(aws_s3.EventType.OBJECT_CREATED, new aws_s3_notifications.LambdaDestination(func.lambdaFunction));
    }

    if (props.storageDriveConfig.onEvent?.delete) {
      const func = new Function(this, 'delete', {
        reacreateOnFunctionNameChange: true,
        functionName: this.qpqResourceName(props.storageDriveConfig.storageDrive, 's3Delete'),

        functionType: 's3Event_fileEvent',
        executorName: 's3Event_fileEvent',

        qpqConfig: props.qpqConfig,

        apiLayerVersions: props.apiLayerVersions,

        awsAccountId: props.awsAccountId,

        environment: {
          // Never change: storageDriveName ~ Its hard coded to stop logs being recursive
          storageDriveName: props.storageDriveConfig.storageDrive,
          storageDriveEntry: JSON.stringify(props.storageDriveConfig.onEvent?.delete),
        },

        role: this.getServiceRole(),
      });

      bucket.addEventNotification(aws_s3.EventType.OBJECT_REMOVED, new aws_s3_notifications.LambdaDestination(func.lambdaFunction));
    }
  }
}
