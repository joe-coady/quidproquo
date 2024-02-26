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

    const bucket = QpqCoreStorageDriveConstruct.fromOtherStack(
      scope,
      `bucket-${id}`,
      props.qpqConfig,
      props.storageDriveConfig,
      props.awsAccountId,
    ).bucket;

    if (props.storageDriveConfig.onEvent?.create) {
      const func = new Function(this, 'create', {
        buildPath: qpqCoreUtils.getStorageDriveEntryFullPath(
          props.qpqConfig,
          props.storageDriveConfig,
        ),
        functionName: this.resourceName(`${props.storageDriveConfig.storageDrive}-create`),

        functionType: 'lambdaS3FileEvent',
        executorName: 'executeS3FileEvent',

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

      bucket.addEventNotification(
        aws_s3.EventType.OBJECT_CREATED,
        new aws_s3_notifications.LambdaDestination(func.lambdaFunction),
      );
    }

    if (props.storageDriveConfig.onEvent?.delete) {
      const func = new Function(this, 'delete', {
        buildPath: qpqCoreUtils.getStorageDriveEntryFullPath(
          props.qpqConfig,
          props.storageDriveConfig,
        ),
        functionName: this.resourceName(`${props.storageDriveConfig.storageDrive}-delete`),

        functionType: 'lambdaS3FileEvent',
        executorName: 'executeS3FileEvent',

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

      bucket.addEventNotification(
        aws_s3.EventType.OBJECT_REMOVED,
        new aws_s3_notifications.LambdaDestination(func.lambdaFunction),
      );
    }
  }
}
