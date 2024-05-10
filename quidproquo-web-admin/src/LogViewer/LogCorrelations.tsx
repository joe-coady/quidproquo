import { Box } from '@mui/material';

import { LogCorrelationTree } from './LogCorrelationTree';
import { StoryResultMetadataWithChildren } from 'quidproquo-core';

interface LogCorrelationsProps {
  logCorrelation: string;
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  isVisible: boolean;
  timelineData?: StoryResultMetadataWithChildren[];
}

export const LogCorrelations = ({
  logCorrelation,
  setSelectedLogCorrelation,
  isVisible,
  timelineData,
}: LogCorrelationsProps) => {
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
        correlationId={logCorrelation}
        highlightCorrelationId={logCorrelation}
        setSelectedLogCorrelation={setSelectedLogCorrelation}
        isVisible={isVisible}
        timelineData={timelineData}
      />
    </Box>
  );
};
