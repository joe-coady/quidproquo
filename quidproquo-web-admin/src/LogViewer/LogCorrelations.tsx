import { Box } from '@mui/material';

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