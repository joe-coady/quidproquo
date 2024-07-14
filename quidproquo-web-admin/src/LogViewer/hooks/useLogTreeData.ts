import { StoryResultMetadataWithChildren } from 'quidproquo-core';
import { useEffect, useState } from 'react';
import { useAuthAccessToken } from 'quidproquo-web-react';
import { getLogHierarchy } from '../logic';
import { TreeNodeDatum } from 'react-d3-tree';

const filterQpqActions = (logs: StoryResultMetadataWithChildren[]): StoryResultMetadataWithChildren[] => {
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

export type TreeDataItem = TreeNodeDatum & StoryResultMetadataWithChildren;

export type TreeApi = {
  treeData?: StoryResultMetadataWithChildren[];
  treeDataWithNoQpqActions?: StoryResultMetadataWithChildren[];
  isLoading: boolean;
  refreshTreeData: () => void;
};

export const useLogTreeData = (correlationId: string, hideQpqActions: boolean = false): TreeApi => {
  const [treeData, setTreeData] = useState<StoryResultMetadataWithChildren[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const accessToken = useAuthAccessToken();

  const refreshTreeData = async () => {
    setIsLoading(true);
    const logHierarchy = await getLogHierarchy(correlationId, true, accessToken);

    if (logHierarchy) {
      setTreeData([logHierarchy]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const fetchTreeData = async () => {
      setIsLoading(true);
      console.log('correlationId: ', correlationId);
      const logHierarchy = await getLogHierarchy(correlationId, false, accessToken);

      if (logHierarchy) {
        setTreeData([logHierarchy]);
      }

      setIsLoading(false);
    };

    if (correlationId) {
      fetchTreeData();
    }
  }, [!!correlationId]);

  const result: TreeApi = {
    isLoading,
    refreshTreeData: refreshTreeData,
    treeDataWithNoQpqActions: treeData ? filterQpqActions(treeData) : treeData,
    treeData: treeData,
  };

  return result;
};
