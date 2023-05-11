import { StoryResultMetadataLog } from '../../types';

export function findRootLog(
  log: StoryResultMetadataLog,
  logArray: StoryResultMetadataLog[],
): StoryResultMetadataLog {
  // Base case: if the log does not have a fromCorrelation field, return the log
  if (!log.fromCorrelation) {
    return log;
  }

  // Recursive case: find the parent log in the array and call the function again with the parent log
  const parentLog = logArray.find((l) => l.correlation === log.fromCorrelation);

  // If a parent log is found, make a recursive call with the parent log; otherwise, return the current log
  return parentLog ? findRootLog(parentLog, logArray) : log;
}
