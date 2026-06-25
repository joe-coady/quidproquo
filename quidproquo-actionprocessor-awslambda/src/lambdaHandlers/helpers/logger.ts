import { LogActionType, QPQ_LOGS_STORAGE_DRIVE_NAME, QPQConfig, qpqCoreUtils, QpqLogger, StoryResult } from 'quidproquo-core';

import fs from 'fs';
import path from 'path';
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

import { getConfigRuntimeResourceName } from '../../awsNamingUtils';
import { LOG_EXTENSION_PORT } from '../../lambdaExtensions/logExtensionPort';

const tempDirectory = '/tmp/qpqlogs';

import { getAwsServiceAccountInfoByDeploymentInfo, getAwsServiceAccountInfoConfig } from 'quidproquo-config-aws';
import { filterLogHistoryByActionTypes } from 'quidproquo-core';

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

const noopLogger: QpqLogger = {
  enableLogs: async () => {},
  log: () => {},
  waitToFinishWriting: async () => {},
  moveToPermanentStorage: async () => {},
};

// Resolves which S3 bucket (and its region) story logs go to for this config.
const resolveLogTarget = (qpqConfig: QPQConfig): { bucketName: string; regionForBucket: string } => {
  const service = getAwsServiceAccountInfoConfig(qpqConfig).logServiceName!;
  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  const bucketName = getConfigRuntimeResourceName(QPQ_LOGS_STORAGE_DRIVE_NAME, application, service, environment, feature);
  const regionForBucket = getAwsServiceAccountInfoByDeploymentInfo(qpqConfig, service, environment, feature, application).awsRegion;

  return { bucketName, regionForBucket };
};

// Shared plumbing for both loggers: defers each log to a microtask, applies the
// disabled-correlation history filter, and tracks the promises so
// waitToFinishWriting can await them. Only `ship` (how a log reaches S3) differs.
const createBufferedLogger = (bucketName: string, regionForBucket: string, ship: (result: StoryResult<any>) => Promise<void>): QpqLogger => {
  const logs: Promise<void>[] = [];
  let disabledLogCorrelations: string[] = [];

  return {
    enableLogs: async (enable: boolean, reason: string, correlation: string) => {
      disabledLogCorrelations = enable
        ? disabledLogCorrelations.filter((dlc) => dlc !== correlation)
        : [...disabledLogCorrelations, correlation];
    },

    log: (result: StoryResult<any>) => {
      // Defer all work (including JSON.stringify) to a microtask so the caller is not blocked.
      const promise = Promise.resolve()
        .then(() => {
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

          return ship(modifyableResult);
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

// Logs straight to S3: the handler awaits the PutObject itself. Simple and fully
// durable, but the invoke waits on S3. No extension required.
export const getS3Logger = (qpqConfig: QPQConfig): QpqLogger => {
  const { bucketName, regionForBucket } = resolveLogTarget(qpqConfig);
  const s3Client = new S3Client({ region: regionForBucket });

  return createBufferedLogger(bucketName, regionForBucket, (result) => storyLogger(result, bucketName, s3Client));
};

// Logs via the qpq-log-extension: a fast local HTTP POST hands the log off so the
// response is not blocked on S3. Falls back to a direct S3 write if the extension
// is unreachable, so a log is never silently dropped.
export const getS3LoggerViaExtension = (qpqConfig: QPQConfig): QpqLogger => {
  const { bucketName, regionForBucket } = resolveLogTarget(qpqConfig);
  const s3Client = new S3Client({ region: regionForBucket });

  const sendToExtension = async (result: StoryResult<any>): Promise<void> => {
    const res = await fetch(`http://127.0.0.1:${LOG_EXTENSION_PORT}/log`, {
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

  return createBufferedLogger(bucketName, regionForBucket, async (result) => {
    try {
      await sendToExtension(result);
    } catch (error) {
      console.log(`qpq-log-extension unreachable, writing [${result.correlation}] to S3 directly:`, error);
      await storyLogger(result, bucketName, s3Client);
    }
  });
};

export const getLogger = (qpqConfig: QPQConfig): QpqLogger => {
  const awsSettings = getAwsServiceAccountInfoConfig(qpqConfig);

  // If we have no log service, just return nothing.
  if (!awsSettings.logServiceName || awsSettings.disableLogs || process.env.storageDriveName === QPQ_LOGS_STORAGE_DRIVE_NAME) {
    return noopLogger;
  }

  // instantLogs forces the synchronous direct-to-S3 path, bypassing the extension.
  if (awsSettings.instantLogs) {
    return getS3Logger(qpqConfig);
  }

  // Use the off-response-path extension when running inside a real Lambda (where it
  // is always attached); otherwise log directly to S3.
  return process.env.AWS_LAMBDA_RUNTIME_API ? getS3LoggerViaExtension(qpqConfig) : getS3Logger(qpqConfig);
};
