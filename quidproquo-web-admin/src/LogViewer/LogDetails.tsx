import { StoryResult } from 'quidproquo-core';
import ConsoleLogViewer from './ConsoleLogViewer';
import TruncatedText from './TruncatedText';
import { useLogEvents } from './hooks';

import { Table, TableBody, TableCell, TableRow, Box, Typography, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

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
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleEventExpanded = (key: string) => {
    setExpandedEvents((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  return (
    <Box sx={{ width: 1 }}>
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
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" component="span">
                    {e.title as string}
                  </Typography>
                  <IconButton size="small" onClick={() => toggleEventExpanded(e.key)}>
                    {expandedEvents[e.key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Typography variant="body1" gutterBottom>
                  {e.subText}
                </Typography>
                {e.input && (
                  <TruncatedText title="Input" text={e.input} expanded={expandedEvents[e.key]} />
                )}
                {e.output && (
                  <TruncatedText title="Output" text={e.output} expanded={expandedEvents[e.key]} />
                )}
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
    </Box>
  );
};
