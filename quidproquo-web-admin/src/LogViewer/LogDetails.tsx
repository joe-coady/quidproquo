import { StoryResult } from 'quidproquo-core';
import ConsoleLogViewer from './ConsoleLogViewer';

import { ActionHistoryItemTimeStamp } from './ActionHistoryItemTimeStamp';
import { LogSummaryDetails } from './LogSummaryDetails';
import { LogSummaryReturn } from './LogSummaryReturn';

import { Table, TableBody, TableCell, TableRow, Box, Typography } from '@mui/material';
import { AnyActionHistoryItem } from './AnyActionHistoryItem';

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
  return (
    <Box sx={{ width: 1 }}>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableBody>
          <TableRow>
            <TableCell sx={leftTableCell}>
              <ActionHistoryItemTimeStamp startedAt={log.startedAt} finishedAt={log.startedAt} />
            </TableCell>
            <TableCell sx={rightTableCell}>
              <LogSummaryDetails log={log} />
            </TableCell>
          </TableRow>

          {log.history.map((historyItem, index) => (
            <TableRow key={`${index}`}>
              <TableCell sx={leftTableCell}>
                <ActionHistoryItemTimeStamp
                  startedAt={historyItem.startedAt}
                  finishedAt={historyItem.finishedAt}
                />
              </TableCell>
              <TableCell sx={rightTableCell}>
                <AnyActionHistoryItem historyItem={historyItem} />
              </TableCell>
            </TableRow>
          ))}

          <TableRow>
            <TableCell sx={leftTableCell}>
              <ActionHistoryItemTimeStamp startedAt={log.finishedAt} finishedAt={log.finishedAt} />
            </TableCell>
            <TableCell sx={rightTableCell}>
              <LogSummaryReturn log={log} />
            </TableCell>
          </TableRow>

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
    </Box>
  );
};
