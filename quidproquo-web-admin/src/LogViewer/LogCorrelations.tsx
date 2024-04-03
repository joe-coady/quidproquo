import { Box } from '@mui/material';

import { LogCorrelationTree } from './LogCorrelationTree';

interface LogCorrelationsProps {
  logCorrelation: string;
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  isVisible: boolean;
}

export const LogCorrelations = ({
  logCorrelation,
  setSelectedLogCorrelation,
  isVisible,
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
      />
    </Box>
  );
};
