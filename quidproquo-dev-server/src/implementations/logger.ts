import { filterLogHistoryByActionTypes, LogActionType, QPQConfig, qpqCoreUtils, QpqLogger, StoryResult, StorySession } from 'quidproquo-core';

import * as fs from 'fs/promises';
import * as path from 'path';

import { ResolvedDevServerConfig } from '../types';

export const getDevServerLogger = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig, storySession?: StorySession): QpqLogger => {
  // Check if we're processing a storage event from the qpq-logs drive
  const isProcessingLogDriveEvent = storySession?.context?.storageEvent?.drive === 'qpq-logs';
  
  // If we have no log service, or we're processing logs drive events, return a no-op logger
  if (!devServerConfig.logServiceName || isProcessingLogDriveEvent || process.env.storageDriveName === 'qpq-logs') {
    return {
      enableLogs: async () => {},
      log: async () => {},
      waitToFinishWriting: async () => {},
      moveToPermanentStorage: async () => {},
    };
  }

  const logServiceName = devServerConfig.logServiceName;
  const storagePath = devServerConfig.fileStorageConfig.storagePath;
  
  // Construct the log directory path: {storagePath}/{logServiceName}/qpq-logs/
  const logDirectory = path.join(storagePath, logServiceName, 'qpq-logs');
  
  const logs: Promise<void>[] = [];
  let disabledLogCorrelations: string[] = [];

  // Helper function to write a log file
  const writeLogFile = async (result: StoryResult<any>): Promise<void> => {
    try {
      // Ensure the log directory exists
      await fs.mkdir(logDirectory, { recursive: true });
      
      // Write the log file
      const logFilePath = path.join(logDirectory, `${result.correlation}.json`);
      await fs.writeFile(logFilePath, JSON.stringify(result, null, 2), 'utf8');
      
      console.log(`Story result logged to file [${logFilePath}]`);
    } catch (error) {
      console.error(`Failed to log story result to file [${result.correlation}]:`, error);
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

    log: async (result: StoryResult<any>) => {
      let modifiableResult = !disabledLogCorrelations.includes(result.correlation)
        ? result
        : {
            ...result,
            history: filterLogHistoryByActionTypes(result.history, [
              LogActionType.Create,
              LogActionType.TemplateLiteral,
              LogActionType.DisableEventHistory,
            ]),
          };

      // Create a promise for this log write and add it to the array
      const promise = writeLogFile(modifiableResult).catch((e) => {
        console.log('Failed to log story result', JSON.stringify(e, null, 2));
      });

      logs.push(promise);
    },

    waitToFinishWriting: async () => {
      await Promise.all(logs);
    },

    moveToPermanentStorage: async () => {
      // In the dev server, logs are already in permanent storage (file system)
      // This is a no-op, but could be extended if needed
      console.log('Dev server logs are already in permanent storage');
    },
  };
};