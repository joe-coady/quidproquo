import { useState } from 'react';
import { Box, IconButton } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { StoryResultMetadataLog } from '../types';
import { findRootLog } from './logic';
import { LogCorrelationTree } from './LogCorrelationTree';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const rootLog = findRootLog(
    storyResultMetadatas,
    storyResultMetadatas.find((l) => l.correlation === logCorrelation)!,
  );

  if (!rootLog) {
    return null;
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      sx={{
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: isExpanded ? '80%' : '120px',
        position: 'relative',
      }}
    >
      <LogCorrelationTree
        rootStoryResultMetadata={rootLog}
        allStoryResultMetadatas={storyResultMetadatas}
        highlightCorrelation={logCorrelation}
        setSelectedLogCorrelation={setSelectedLogCorrelation}
      />
      <IconButton
        onClick={toggleExpand}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}
      >
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Box>
  );
};
