import { Box, CircularProgress } from '@mui/material';

import { StoryResultMetadataLog } from '../types';
import { findRootLog } from './logic';
import { LogCorrelationTree } from './LogCorrelationTree';
import { useEffect, useState } from 'react';
import { useAuthAccessToken } from '../Auth/hooks';

interface LogCorrelationsProps {
  logCorrelation: string;
  storyResultMetadatas: StoryResultMetadataLog[];
  setSelectedLogCorrelation: (logCorrelation: string) => void;
}

export const LogCorrelations = ({
  logCorrelation,
  storyResultMetadatas,
  setSelectedLogCorrelation,
}: LogCorrelationsProps) => {
  const [rootLog, setRootLog] = useState<StoryResultMetadataLog | null | undefined>(null);
  const accessToken = useAuthAccessToken();

  useEffect(() => {
    findRootLog(logCorrelation, accessToken).then((foundRoot) => {
      console.log('root: ', foundRoot);
      setRootLog(foundRoot);
    });
  }, [logCorrelation]);

  if (!rootLog) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <CircularProgress size={100} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <LogCorrelationTree
        rootStoryResultMetadata={rootLog}
        allStoryResultMetadatas={storyResultMetadatas}
        highlightCorrelation={logCorrelation}
        setSelectedLogCorrelation={setSelectedLogCorrelation}
      />
    </Box>
  );
};
