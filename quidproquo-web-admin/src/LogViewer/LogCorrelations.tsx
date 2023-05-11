import { Box, Typography } from '@mui/material';
import { StoryResultLog, StoryResultMetadataLog } from '../types';
import { findRootLog } from './logic';
import { LogCorrelationTree } from './LogCorrelationTree';

interface LogCorrelationsProps {
  log: StoryResultLog;
  storyResultMetadatas: StoryResultMetadataLog[];
  setSelectedLogCorrelation: (logCorrelation: string) => void;
}

export const LogCorrelations = ({
  log,
  storyResultMetadatas,
  setSelectedLogCorrelation,
}: LogCorrelationsProps) => {
  const rootLog = findRootLog(
    storyResultMetadatas.find((l) => l.correlation === log.correlation)!,
    storyResultMetadatas,
  );

  return (
    <Box
      sx={{
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Correlation
      </Typography>
      <LogCorrelationTree
        rootStoryResultMetadata={rootLog}
        allStoryResultMetadatas={storyResultMetadatas}
        highlightCorrelation={log.correlation}
        setSelectedLogCorrelation={setSelectedLogCorrelation}
      />
    </Box>
  );
};
