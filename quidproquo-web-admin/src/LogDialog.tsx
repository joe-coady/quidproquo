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

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

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
    dateTime: logFile.createdDateTime,
    title: `${logFile.type} - ${logFile.service} - ${logFile.path}`,
    subText: `${logFile.src}::${logFile.runtime}`,
    Dot: (
      <TimelineDot>
        <LanguageIcon />
      </TimelineDot>
    ),
    key: logFile.id,
  };

  const secondEvent = {
    dateTime: logFile.createdDateTime,
    title: 'Executed with input params of',
    subText: JSON.stringify(logFile.storyResult.input, null, 1),
    Dot: (
      <TimelineDot>
        <InputIcon />
      </TimelineDot>
    ),
    key: logFile.id + 'part_2',
  };

  const finalEvent = {
    dateTime: logFile.createdDateTime,
    title: 'Returned',
    subText: JSON.stringify(logFile.storyResult.result, null, 1),
    Dot: (
      <TimelineDot>
        <KeyboardReturnIcon />
      </TimelineDot>
    ),
    key: logFile.id + 'return',
  };

  const history = logFile.storyResult.history.map((h: any, i: number) => {
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
      dateTime: h.startedAt || new Date().toISOString(),
      timeMs: new Date(h.finishedAt).getTime() - new Date(h.startedAt).getTime(),
    };
    return message;
  });

  return [firstEvent, secondEvent, ...history, finalEvent];
};

const LogDialog = ({ logFileId, open, handleClose }: LogDialogProps) => {
  const [events, setEvents] = useState([]);
  // const events: any[] = []; // processLog(logFile);

  useEffect(() => {
    if (!open || !logFileId) {
      setEvents([]);
    } else {
      console.log('LOG LOG');
    }
  }, [logFileId, open]);

  return (
    <div>
      <Dialog
        open={open}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        maxWidth={'xl'}
        fullWidth={true}
      >
        <DialogTitle id="scroll-dialog-title">Story event details</DialogTitle>
        <DialogContent dividers={true}>
          <Timeline position="right">
            {events.map((e, i) => (
              <TimelineItem key={e.key}>
                <TimelineOppositeContent
                  sx={{ m: 'auto 0' }}
                  align="right"
                  variant="body2"
                  color="text.secondary"
                  style={{ maxWidth: '60px', paddingLeft: '60px', paddingRight: '30px' }}
                >
                  <div>
                    {new Date(e.dateTime).toLocaleTimeString('en-AU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div>{new Date(e.dateTime).toLocaleDateString('en-AU')}</div>
                  <div>{`${e.timeMs || 0} ms`}</div>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  {e.Dot}
                  {i < events.length - 1 ? <TimelineConnector /> : null}
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <pre style={{ margin: 0, padding: 0 }}>
                    <Typography variant="h6" component="span">
                      {e.title}
                    </Typography>
                    <Typography>{e.subText}</Typography>
                  </pre>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LogDialog;
