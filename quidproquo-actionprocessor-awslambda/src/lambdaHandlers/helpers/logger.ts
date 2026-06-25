import { LogActionType, QPQ_LOGS_STORAGE_DRIVE_NAME, QPQConfig, qpqCoreUtils, QpqLogger, StoryResult } from 'quidproquo-core';

import fs from 'fs';
import path from 'path';
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

import { getConfigRuntimeResourceName } from '../../awsNamingUtils';

const tempDirectory = '/tmp/qpqlogs';

import { getAwsServiceAccountInfoByDeploymentInfo, getAwsServiceAccountInfoConfig } from 'quidproquo-config-aws';
import { filterLogHistoryByActionTypes } from 'quidproquo-core';

import { randomUUID } from 'crypto';

export const storyLogger = async (result: StoryResult<any>, bucketName: string, s3Client: S3Client): Promise<void> => {
  try {
    const commandParams: PutObjectCommandInput = {
      Key: `${result.correlation}.json`,
      Bucket: bucketName,
      Body: JSON.stringify(result),
      StorageClass: 'INTELLIGENT_TIERING',
    };

    await s3Client.send(new PutObjectCommand(commandParams));
  } catch (error) {
    console.log(`Failed to log story result to S3 [${result.correlation}]:`, error);
  }
};

export const storyLoggerFs = async (result: StoryResult<any>): Promise<void> => {
  try {
    await fs.promises.mkdir(tempDirectory, { recursive: true });

    const filePath = path.join(tempDirectory, `${result.correlation}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(result));
    console.log(`Story result logged to temporary file [${filePath}]`);
  } catch (error) {
    console.log(`Failed to log story result to temporary file [${result.correlation}]`);
    console.error(error);
  }
};

export const moveLogsToPerminateStorage = async (bucketName: string, region: string): Promise<void> => {
  try {
    await fs.promises.mkdir(tempDirectory, { recursive: true });
    const files = await fs.promises.readdir(tempDirectory);

    const s3Client = new S3Client({ region });

    for (const file of files) {
      const filePath = path.join(tempDirectory, file);
      const data = await fs.promises.readFile(filePath, 'utf-8');
      const result: StoryResult<any> = JSON.parse(data);

      await storyLogger(result, bucketName, s3Client);

      await fs.promises.unlink(filePath);
      console.log(`Moved log file [${file}] to S3 and deleted from temporary directory`);
    }
  } catch (error) {
    console.error('Failed to move logs to permanent storage');
    console.error(error);
  }
};

export const getLogger = (qpqConfig: QPQConfig): QpqLogger => {
  const awsSettings = getAwsServiceAccountInfoConfig(qpqConfig);

  // If we have no log service, just return nothing.
  if (!awsSettings.logServiceName || awsSettings.disableLogs || process.env.storageDriveName === QPQ_LOGS_STORAGE_DRIVE_NAME) {
    return {
      enableLogs: async () => {},
      log: () => {},
      waitToFinishWriting: async () => {},
      moveToPermanentStorage: async () => {},
    };
  }

  const service = awsSettings.logServiceName;
  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  // Workout the bucket name.
  const bucketName = getConfigRuntimeResourceName(QPQ_LOGS_STORAGE_DRIVE_NAME, application, service, environment, feature);

  // Where is this bucket?
  const regionForBucket = getAwsServiceAccountInfoByDeploymentInfo(qpqConfig, service, environment, feature, application).awsRegion;

  const s3Client = new S3Client({ region: regionForBucket });
  const logs: Promise<void>[] = [];
  let disabledLogCorrelations: string[] = [];

  // When the qpq-log-extension layer is attached, the deploy sets this env var.
  // We then hand the log to the extension (a fast local POST) instead of awaiting
  // the S3 PutObject, so the function response is not blocked on S3.
  const extensionPort = process.env.QPQ_LOG_EXTENSION_PORT;

  const sendToExtension = async (result: StoryResult<any>): Promise<void> => {
    const res = await fetch(`http://127.0.0.1:${extensionPort}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bucketName,
        region: regionForBucket,
        key: `${result.correlation}.json`,
        body: JSON.stringify(result),
        storageClass: 'INTELLIGENT_TIERING',
      }),
    });

    if (!res.ok) {
      throw new Error(`extension responded ${res.status}`);
    }
  };

  const writeLog = async (result: StoryResult<any>): Promise<void> => {
    if (!extensionPort) {
      await storyLogger(result, bucketName, s3Client);
      return;
    }

    // Extension present: hand off the log; fall back to direct S3 if it is
    // unreachable so we never silently drop a log.
    try {
      await sendToExtension(result);
    } catch (error) {
      console.log(`qpq-log-extension unreachable, writing [${result.correlation}] to S3 directly:`, error);
      await storyLogger(result, bucketName, s3Client);
    }
  };

  return {
    enableLogs: async (enable: boolean, reason: string, correlation: string) => {
      if (!enable) {
        disabledLogCorrelations = [...disabledLogCorrelations, correlation];
      } else {
        disabledLogCorrelations = disabledLogCorrelations.filter((dlc) => dlc !== correlation);
      }
    },

    log: (result: StoryResult<any>) => {
      // Defer all work (including JSON.stringify) to a microtask so the caller is not blocked.
      // The promise is tracked in `logs` and awaited by waitToFinishWriting at the end.
      const promise = Promise.resolve()
        .then(async () => {
          const modifyableResult = !disabledLogCorrelations.includes(result.correlation)
            ? result
            : {
                ...result,
                history: filterLogHistoryByActionTypes(result.history, [
                  LogActionType.Create,
                  LogActionType.TemplateLiteral,
                  LogActionType.DisableEventHistory,
                ]),
              };

          await writeLog(modifyableResult);
        })
        .catch((e) => {
          console.log('Failed to log story result to S3', JSON.stringify(e, null, 2));
        });

      logs.push(promise);
    },

    waitToFinishWriting: async () => {
      await Promise.all(logs);
    },

    moveToPermanentStorage: async () => {
      await moveLogsToPerminateStorage(bucketName, regionForBucket);
    },
  };
};
