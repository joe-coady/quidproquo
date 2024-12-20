import { StoryResultMetadataWithChildren } from 'quidproquo-core';

import { Box } from '@mui/material';

import { TreeApi } from './hooks';
import { LogCorrelationTree } from './LogCorrelationTree';

interface LogCorrelationsProps {
  logCorrelation: string;
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  isVisible: boolean;
  treeApi: TreeApi;
}

export const LogCorrelations = ({ logCorrelation, setSelectedLogCorrelation, isVisible, treeApi }: LogCorrelationsProps) => {
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
        treeApi={treeApi}
      />
    </Box>
  );
};
