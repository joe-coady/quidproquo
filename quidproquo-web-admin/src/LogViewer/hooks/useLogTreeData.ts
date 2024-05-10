import { StoryResultMetadataWithChildren } from 'quidproquo-core';
import { useEffect, useState } from 'react';
import { useAuthAccessToken } from '../../Auth/hooks';
import { createHierarchy, findRootLog, getLogHierarchy } from '../logic';

const filterQpqActions = (
  logs: StoryResultMetadataWithChildren[],
): StoryResultMetadataWithChildren[] => {
  const filteredLogs: StoryResultMetadataWithChildren[] = [];

  for (const log of logs) {
    if (!log.runtimeType.startsWith('EXECUTE_STORY')) {
      // If the log is a QPQ action, add its children to the filtered logs array
      filteredLogs.push(...filterQpqActions(log.children));
    } else {
      // If the log is not a QPQ action, add it to the filtered logs array
      // and recursively filter its children
      const filteredLog: StoryResultMetadataWithChildren = {
        ...log,
        children: filterQpqActions(log.children),
      };
      filteredLogs.push(filteredLog);
    }
  }

  return filteredLogs;
};

export const useLogTreeData = (
  correlationId: string,
  hideQpqActions: boolean = false,
): StoryResultMetadataWithChildren[] | undefined => {
  const [treeData, setTreeData] = useState<StoryResultMetadataWithChildren[]>();
  const accessToken = useAuthAccessToken();

  useEffect(() => {
    const fetchTreeData = async () => {
      console.log('correlationId: ', correlationId);
      const logHierarchy = await getLogHierarchy(correlationId, accessToken);

      if (logHierarchy) {
        setTreeData([logHierarchy]);
      }
    };

    if (correlationId) {
      fetchTreeData();
    }
  }, [correlationId]);

  if (hideQpqActions) {
    return treeData ? filterQpqActions(treeData) : treeData;
  }

  return treeData;
};
