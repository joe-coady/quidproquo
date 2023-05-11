import { Table, TableBody, TableCell, TableContainer, TableRow, Box } from '@mui/material';
import { StoryResultMetadataLog } from '../types';
import { findLogDirectChildren } from './logic';

interface LogCorrelationTreeProps {
  rootStoryResultMetadata: StoryResultMetadataLog;
  allStoryResultMetadatas: StoryResultMetadataLog[];
  highlightCorrelation: string;
}

export const LogCorrelationTree = ({
  rootStoryResultMetadata,
  allStoryResultMetadatas,
  highlightCorrelation,
}: LogCorrelationTreeProps) => {
  const childrenLogs: StoryResultMetadataLog[] = findLogDirectChildren(
    rootStoryResultMetadata,
    allStoryResultMetadatas,
  );

  const highlightRoot = rootStoryResultMetadata.correlation === highlightCorrelation;

  return (
    <Box
      sx={{ width: 1 }}
      style={{
        border: 'thin solid black',
        backgroundColor: highlightRoot ? '#e1e1e1' : 'white',
      }}
    >
      <TableContainer sx={{ overflowX: 'hidden' }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableBody>
            <TableRow>
              <TableCell>
                <div>
                  {rootStoryResultMetadata.moduleName}::{rootStoryResultMetadata.runtimeType}
                </div>
                <div>{rootStoryResultMetadata.generic}</div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableBody>
            <TableRow>
              {childrenLogs.map((storyResultMetadata, i) => (
                <TableCell key={storyResultMetadata.correlation}>
                  <LogCorrelationTree
                    rootStoryResultMetadata={storyResultMetadata}
                    allStoryResultMetadatas={allStoryResultMetadatas}
                    highlightCorrelation={highlightCorrelation}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
