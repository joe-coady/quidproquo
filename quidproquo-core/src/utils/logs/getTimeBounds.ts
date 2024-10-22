import { StoryResultMetadataWithChildren } from '../../types';

export const getTimeBounds = (logs: StoryResultMetadataWithChildren[]): { earliestStartedAt: string; latestFinishedAt: string } => {
  let earliestStartedAt = '';
  let latestFinishedAt = '';

  const traverse = (node: StoryResultMetadataWithChildren) => {
    if (node.startedAt && (!earliestStartedAt || node.startedAt < earliestStartedAt)) {
      earliestStartedAt = node.startedAt;
    }

    const finishedAt = new Date(new Date(node.startedAt).getTime() + node.executionTimeMs).toISOString();
    if (!latestFinishedAt || finishedAt > latestFinishedAt) {
      latestFinishedAt = finishedAt;
    }

    for (const child of node.children) {
      traverse(child);
    }
  };

  for (const log of logs) {
    traverse(log);
  }

  return { earliestStartedAt, latestFinishedAt };
};
