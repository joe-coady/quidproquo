import { StoryResultMetadataLog } from '../../types';

export function findLogDirectChildren(
  log: StoryResultMetadataLog,
  logArray: StoryResultMetadataLog[],
): StoryResultMetadataLog[] {
  // Filter the log array for logs where the fromCorrelation field matches the correlation field of the given log
  const childLogs = logArray.filter((l) => l.fromCorrelation === log.correlation);

  // Return the array of child logs
  return childLogs;
}
