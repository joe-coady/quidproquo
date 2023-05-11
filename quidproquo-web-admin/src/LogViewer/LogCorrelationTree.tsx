import { Box, IconButton, Typography } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { StoryResultMetadataLog } from '../types';
import { findLogDirectChildren } from './logic';

interface LogCorrelationTreeProps {
  rootStoryResultMetadata: StoryResultMetadataLog;
  allStoryResultMetadatas: StoryResultMetadataLog[];
  highlightCorrelation: string;
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  depth?: number;
}

export const LogCorrelationTree = ({
  rootStoryResultMetadata,
  allStoryResultMetadatas,
  highlightCorrelation,
  setSelectedLogCorrelation,
  depth = 0,
}: LogCorrelationTreeProps) => {
  const childrenLogs: StoryResultMetadataLog[] = findLogDirectChildren(
    rootStoryResultMetadata,
    allStoryResultMetadatas,
  );

  const rootBackgroundColor =
    rootStoryResultMetadata.correlation === highlightCorrelation
      ? '#e1e1e1'
      : !!rootStoryResultMetadata.error
      ? '#ffb1b1'
      : 'white';

  return (
    <Box
      sx={{ width: 1 }}
      style={{
        border: 'thin solid black',
        backgroundColor: rootBackgroundColor,
        paddingLeft: `${depth * 20}px`,
      }}
      onClick={(event) => {
        event.stopPropagation();
        setSelectedLogCorrelation(rootStoryResultMetadata.correlation);
      }}
    >
      <Box display="flex" alignItems="center">
        <IconButton size="small">
          <FolderOpenIcon />
        </IconButton>
        <Typography>
          {rootStoryResultMetadata.moduleName}::{rootStoryResultMetadata.runtimeType}
        </Typography>
      </Box>
      {childrenLogs.map((storyResultMetadata, i) => (
        <Box display="flex" alignItems="center">
          <IconButton size="small">
            <ArrowForwardIosIcon />
          </IconButton>
          <LogCorrelationTree
            rootStoryResultMetadata={storyResultMetadata}
            allStoryResultMetadatas={allStoryResultMetadatas}
            highlightCorrelation={highlightCorrelation}
            setSelectedLogCorrelation={setSelectedLogCorrelation}
            depth={depth + 1}
          />
        </Box>
      ))}
    </Box>
  );
};
