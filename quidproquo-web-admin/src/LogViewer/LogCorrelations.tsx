import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { StoryResultMetadataLog } from '../types';
import { findRootLog } from './logic';
import { LogCorrelationTree } from './LogCorrelationTree';
import { SearchParams } from './types';

interface LogCorrelationsProps {
  logCorrelation: string;
  storyResultMetadatas: StoryResultMetadataLog[];
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  onSearch: () => Promise<void>;
}

export const LogCorrelations = ({
  logCorrelation,
  storyResultMetadatas,
  setSelectedLogCorrelation,
  onSearch,
}: LogCorrelationsProps) => {
  const rootLog = findRootLog(
    storyResultMetadatas,
    storyResultMetadatas.find((l) => l.correlation === logCorrelation)!,
  );

  if (!rootLog) {
    return null;
  }

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
      <LogCorrelationTree
        rootStoryResultMetadata={rootLog}
        allStoryResultMetadatas={storyResultMetadatas}
        highlightCorrelation={logCorrelation}
        setSelectedLogCorrelation={setSelectedLogCorrelation}
        renderCustom={() => (
          <IconButton
            sx={{
              position: 'absolute',
              top: '0',
              right: '0',
              color: 'primary.main', // Change color as you need
            }}
            onClick={(event) => {
              /* Your click handler function */

              onSearch();

              event.stopPropagation();
            }}
          >
            <RefreshIcon />
          </IconButton>
        )}
      />
    </Box>
  );
};
