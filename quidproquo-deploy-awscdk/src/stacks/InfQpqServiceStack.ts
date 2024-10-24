import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { Construct } from 'constructs';

import {
  InfQpqWebserverServiceDomainsConstruct,
  QpqCoreApiGraphDatabaseConstruct,
  QpqCoreEventBusConstruct,
  QpqCoreKeyValueStoreConstruct,
  QpqCoreParameterConstruct,
  QpqCoreQueueConstruct,
  QpqCoreSecretConstruct,
  QpqCoreStorageDriveConstruct,
  QpqInfCoreUserDirectoryConstruct,
  QpqWebserverApiKeyConstruct,
  QpqWebserverCertificateConstruct,
  QpqWebserverWebsocketConstruct,
} from '../constructs';
import { WebserverRoll } from '../constructs/basic/WebserverRoll';
import { QpqWebServerCacheConstruct } from '../constructs/feature/webserver/cache/QpqWebServerCacheConstruct';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

export interface InfQpqServiceStackProps extends QpqServiceStackProps {}

export class InfQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: InfQpqServiceStackProps) {
    super(scope, id, props);

    // Build the role for this service.
    const webserverRole = new WebserverRoll(this, 'webserverRoll', {
      qpqConfig: props.qpqConfig,
    }).role;

    // Web entry foundations
    new InfQpqWebserverServiceDomainsConstruct(this, 'serviceDomains', {
      qpqConfig: props.qpqConfig,
    });

    // Build the storage drives
    const storageDrives = qpqCoreUtils.getOwnedStorageDrives(props.qpqConfig).map(
      (setting) =>
        new QpqCoreStorageDriveConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          storageDriveConfig: setting,
        }),
    );
    QpqCoreStorageDriveConstruct.authorizeActionsForRole(webserverRole, storageDrives);
    // end storage drives

    // Build the parameters
    const parameters = qpqCoreUtils.getOwnedParameterConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqCoreParameterConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          parameterConfig: setting,
        }),
    );
    QpqCoreParameterConstruct.authorizeActionsForRole(webserverRole, qpqCoreUtils.getAllParameterConfigs(props.qpqConfig), props.qpqConfig);
    // end parameters

    // Secrets
    const secrets = qpqCoreUtils.getOwnedSecrets(props.qpqConfig).map(
      (setting) =>
        new QpqCoreSecretConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          secretConfig: setting,
        }),
    );
    QpqCoreSecretConstruct.authorizeActionsForRole(webserverRole, qpqCoreUtils.getAllSecretConfigs(props.qpqConfig), props.qpqConfig);
    // end secrets

    // Queues
    const queues = qpqCoreUtils.getQueues(props.qpqConfig).map(
      (setting) =>
        new QpqCoreQueueConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          queueConfig: setting,
        }),
    );
    QpqCoreQueueConstruct.authorizeActionsForRole(webserverRole, queues);
    // end queues

    // User Directories
    const ownedUserDirectoriesConfigs = qpqCoreUtils.getOwnedUserDirectories(props.qpqConfig);
    const userDirectories = ownedUserDirectoriesConfigs.map(
      (setting) =>
        new QpqInfCoreUserDirectoryConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          userDirectoryConfig: setting,
        }),
    );
    QpqInfCoreUserDirectoryConstruct.authorizeActionsForRole(webserverRole, ownedUserDirectoriesConfigs, userDirectories, props.qpqConfig);

    // Api Keys
    const apiKeys = qpqWebServerUtils.getAllApiKeyConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqWebserverApiKeyConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          apiKeyConfig: setting,
        }),
    );

    // Event Busses
    const eventBusses = qpqCoreUtils.getOwnedEventBusConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqCoreEventBusConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          eventBusConfig: setting,
        }),
    );

    // key value store
    const keyValueStores = qpqCoreUtils.getOwnedKeyValueStores(props.qpqConfig).map(
      (setting) =>
        new QpqCoreKeyValueStoreConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          keyValueStoreConfig: setting,
        }),
    );
    QpqCoreKeyValueStoreConstruct.authorizeActionsForRole(webserverRole, keyValueStores);
    // end key value store

    // Graph Databases
    const allGraphDatabaseConfigs = qpqCoreUtils.getAllGraphDatabaseConfigs(props.qpqConfig);
    const graphDatabases = qpqCoreUtils.getOwnedGraphDatabases(props.qpqConfig).map(
      (setting) =>
        new QpqCoreApiGraphDatabaseConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          graphDatabaseConfig: setting,
        }),
    );
    QpqCoreApiGraphDatabaseConstruct.authorizeActionsForRole(webserverRole, allGraphDatabaseConfigs, props.qpqConfig);
    // end key value store

    // Build websocket apis
    const websockets = qpqWebServerUtils.getOwnedWebsocketSettings(props.qpqConfig).map(
      (setting) =>
        new QpqWebserverWebsocketConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          websocketConfig: setting,
        }),
    );

    // Cache settings
    const cache = qpqWebServerUtils.getAllOwnedCacheConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqWebServerCacheConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          cacheConfig: setting,
        }),
    );

    // Certifcates
    const certifcates = qpqWebServerUtils.getAllOwnedCertifcateConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqWebserverCertificateConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          certificateConfig: setting,
        }),
    );
  }
}
