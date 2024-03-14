import { StoryResult } from 'quidproquo-core';
import ConsoleLogViewer from './ConsoleLogViewer';
import TruncatedText from './TruncatedText'; // Adjust the path as needed
import { useLogEvents } from './hooks';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Box,
  Typography,
} from '@mui/material';

interface LogDetailsProps {
  log: StoryResult<any>;
  storyResultMetadatas: any[];
  setSelectedLogCorrelation: (logCorrelation: string) => void;
}

const leftTableCell = {
  width: '200px',
  paddingRight: '30px',
  textAlign: 'right',
  verticalAlign: 'top',
  whiteSpace: 'break-spaces',
};

const rightTableCell = {
  paddingLeft: '60px',
  verticalAlign: 'top',
  whiteSpace: 'break-spaces',
  maxWidth: 'calc(100% - 200px - 30px - 60px)',
};

export const LogDetails = ({
  log,
  storyResultMetadatas,
  setSelectedLogCorrelation,
}: LogDetailsProps) => {
  const events = useLogEvents(log);

  return (
    <Box sx={{ width: 1 }}>
      <TableContainer sx={{ overflowX: 'hidden' }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableBody>
            {events.map((e, i) => (
              <TableRow key={`${i}`}>
                <TableCell sx={leftTableCell}>
                  <div>
                    {new Date(e.dateTime).toLocaleTimeString('en-AU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div>{new Date(e.dateTime).toLocaleDateString('en-AU')}</div>
                  <div>{`${e.timeMs || 0} ms`}</div>
                </TableCell>
                <TableCell sx={rightTableCell}>
                  <TruncatedText
                    title={e.title as string}
                    subText={(e.subText || '') as string}
                    maxLength={128}
                  />
                </TableCell>
              </TableRow>
            ))}

            {log?.logs && (
              <TableRow>
                <TableCell colSpan={2} style={{ width: '100%' }}>
                  <div style={{ paddingBottom: '10px' }}>
                    <Typography variant="h6" component="span">
                      Caught console.log events
                    </Typography>
                  </div>
                  <ConsoleLogViewer logs={log?.logs} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
