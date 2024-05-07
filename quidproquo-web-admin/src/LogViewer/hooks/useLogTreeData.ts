import { StoryResultMetadataWithChildren } from 'quidproquo';
import { useEffect, useState } from 'react';
import { useAuthAccessToken } from '../../Auth/hooks';
import { createHierarchy, findRootLog } from '../logic';

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
): StoryResultMetadataWithChildren[] | null => {
  const [treeData, setTreeData] = useState<any>(null);
  const accessToken = useAuthAccessToken();

  useEffect(() => {
    const fetchTreeData = async () => {
      const rootLog = await findRootLog(correlationId, accessToken);

      if (rootLog) {
        const data = await createHierarchy(rootLog, accessToken);

        console.log('treeData: ', data);
        setTreeData([data]);
      }
    };

    fetchTreeData();
  }, [correlationId]);

  if (hideQpqActions) {
    return treeData ? filterQpqActions(treeData) : treeData;
  }

  return treeData;
};
