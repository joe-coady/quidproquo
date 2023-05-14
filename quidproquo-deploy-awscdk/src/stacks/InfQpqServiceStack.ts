import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { Construct } from 'constructs';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

import {
  QpqCoreStorageDriveConstruct,
  QpqCoreParameterConstruct,
  QpqCoreQueueConstruct,
  QpqCoreSecretConstruct,
  QpqCoreEventBusConstruct,
  QpqWebserverDomainConstruct,
  QpqCoreUserDirectoryConstruct,
  QpqWebserverApiKeyConstruct,
  QpqCoreKeyValueStoreConstruct,
  LogStorage,
} from '../constructs';

export interface InfQpqServiceStackProps extends QpqServiceStackProps {}

export class InfQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: InfQpqServiceStackProps) {
    super(scope, id, props);

    // Build the log storage drive
    // const logBucket = new LogStorage(this, 'logStorage', {
    //   awsAccountId: props.awsAccountId,
    //   qpqConfig: props.qpqConfig,
    // }).bucket;

    // Build the storage drives
    const storageDrives = qpqCoreUtils.getStorageDrives(props.qpqConfig).map(
      (setting) =>
        new QpqCoreStorageDriveConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          storageDriveConfig: setting,
        }),
    );

    // Build the parameters
    const parameters = qpqCoreUtils.getOwnedParameters(props.qpqConfig).map(
      (setting) =>
        new QpqCoreParameterConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          parameterConfig: setting,
        }),
    );

    // Secrets
    const secrets = qpqCoreUtils.getOwnedSecrets(props.qpqConfig).map(
      (setting) =>
        new QpqCoreSecretConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          secretConfig: setting,
        }),
    );

    // Queues
    const queues = qpqCoreUtils.getQueues(props.qpqConfig).map(
      (setting) =>
        new QpqCoreQueueConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          queueConfig: setting,
        }),
    );

    // Domain
    const dns = qpqWebServerUtils.getDnsConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqWebserverDomainConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          dnsConfig: setting,
        }),
    );

    // User Directories
    const userDirectories = qpqCoreUtils.getUserDirectories(props.qpqConfig).map(
      (setting) =>
        new QpqCoreUserDirectoryConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          userDirectoryConfig: setting,
        }),
    );

    // Api Keys
    const apiKeys = qpqWebServerUtils.getAllApiKeyConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqWebserverApiKeyConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          apiKeyConfig: setting,
        }),
    );

    // Event Busses
    const busses = qpqCoreUtils.getAllEventBusConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqCoreEventBusConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          eventBusConfig: setting,
        }),
    );

    // key value store
    const keyValueStores = qpqCoreUtils.getAllKeyValueStores(props.qpqConfig).map(
      (setting) =>
        new QpqCoreKeyValueStoreConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          keyValueStoreConfig: setting,
        }),
    );
  }
}
