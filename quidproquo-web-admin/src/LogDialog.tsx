import { useEffect, useState } from 'react';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';

import InputIcon from '@mui/icons-material/Input';
import TagIcon from '@mui/icons-material/Tag';
import ElevenMpIcon from '@mui/icons-material/ElevenMp';
import StorageIcon from '@mui/icons-material/Storage';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import ScannerIcon from '@mui/icons-material/Scanner';
import LanguageIcon from '@mui/icons-material/Language';
import Typography from '@mui/material/Typography';

import TruncatedText from './TruncatedText'; // Adjust the path as needed

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';

import { apiRequestGet } from './logic';

interface LogDialogProps {
  open: boolean;
  logFileId: string;
  handleClose: () => void;
}

const actionMap = {
  '@Inf/Guid/New': {
    Dot: (
      <TimelineDot>
        <TagIcon />
      </TimelineDot>
    ),
    title: 'Generated new guid',
  },
  '@Inf/Math/RandomNumber': {
    Dot: (
      <TimelineDot>
        <ElevenMpIcon />
      </TimelineDot>
    ),
    title: 'Generated random number',
  },
  '@inf/GenericDataResource/Put': {
    Dot: (
      <TimelineDot>
        <StorageIcon />
      </TimelineDot>
    ),
    title: 'Wrote to database',
  },
  '@inf/GenericDataResource/Scan': {
    Dot: (
      <TimelineDot>
        <ScannerIcon />
      </TimelineDot>
    ),
    title: 'Full scan of database',
  },
};

const processLog = (logFile: any) => {
  if (!logFile) {
    return [];
  }

  const firstEvent = {
    dateTime: logFile.startedAt,
    title: `${logFile.runtimeType} - ${logFile.moduleName}`,
    subText: logFile.tags.join(','),
    Dot: (
      <TimelineDot>
        <LanguageIcon />
      </TimelineDot>
    ),
    key: logFile.id,
  };

  const secondEvent = {
    dateTime: logFile.startedAt,
    title: 'Executed with input params of',
    subText: JSON.stringify(logFile.input, null, 1),
    Dot: (
      <TimelineDot>
        <InputIcon />
      </TimelineDot>
    ),
    key: logFile.id + 'part_2',
  };

  const finalEvent = {
    dateTime: logFile.finishedAt,
    title: 'Returned',
    subText: JSON.stringify(logFile.result, null, 1),
    Dot: (
      <TimelineDot>
        <KeyboardReturnIcon />
      </TimelineDot>
    ),
    key: logFile.id + 'return',
  };

  const history = logFile.history.map((h: any, i: number) => {
    const message = {
      subText: `${h.act.payload ? `Input: ${JSON.stringify(h.act.payload, null, 2)}\n` : ''}${
        h.res ? `Output: ${JSON.stringify(h.res, null, 2)}` : ''
      }`,
      title: `Action: ${h.act.type}`,
      Dot: (
        <TimelineDot>
          <NotListedLocationIcon />
        </TimelineDot>
      ),
      ...((actionMap as any)[h.act.type as string] || {}),
      key: logFile.id + i,
      dateTime: h.startedAt,
      timeMs: new Date(h.finishedAt).getTime() - new Date(h.startedAt).getTime(),
    };
    return message;
  });

  return [firstEvent, secondEvent, ...history, finalEvent];
};

const LogDialog = ({ logFileId, open, handleClose }: LogDialogProps) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  // const events: any[] = []; // processLog(logFile);

  useEffect(() => {
    if (!open || !logFileId) {
      setEvents([]);
      setLoading(false);
    } else {
      setLoading(true);
      apiRequestGet(`/api/card/log/${logFileId}`)
        .then((logFile) => {
          setEvents(processLog(logFile));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [logFileId, open]);

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      scroll={'paper'}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      maxWidth={'xl'}
      fullWidth={true}
      onClose={handleClose}
    >
      <DialogTitle id="scroll-dialog-title">Log Details</DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '150px',
          overflowY: 'scroll',
        }}
      >
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <CircularProgress size={100} />
          </Box>
        )}
        {!loading && (
          <Box sx={{ width: 1 }}>
            <TableContainer sx={{ overflowX: 'hidden' }}>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableBody>
                  {events.map((e, i) => (
                    <TableRow key={`${i}`}>
                      <TableCell
                        sx={{
                          width: '200px',
                          paddingRight: '30px',
                          textAlign: 'right',
                          verticalAlign: 'top',
                          whiteSpace: 'break-spaces',
                        }}
                      >
                        <div>
                          {new Date(e.dateTime).toLocaleTimeString('en-AU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div>{new Date(e.dateTime).toLocaleDateString('en-AU')}</div>
                        <div>{`${e.timeMs || 0} ms`}</div>
                      </TableCell>
                      <TableCell
                        sx={{
                          paddingLeft: '60px',
                          verticalAlign: 'top',
                          whiteSpace: 'break-spaces',
                          maxWidth: 'calc(100% - 200px - 30px - 60px)',
                        }}
                      >
                        <TruncatedText
                          title={e.title as string}
                          subText={e.subText as string}
                          maxLength={128}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogDialog;
