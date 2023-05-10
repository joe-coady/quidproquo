import { useEffect, useState } from 'react';

import TimelineDot from '@mui/lab/TimelineDot';

import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';

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

import { apiRequestGet, apiRequestPost } from './logic';

interface LogDialogProps {
  open: boolean;
  logCorrelation: string;
  handleClose: () => void;
  serviceLogEndpoints: string[];
  logStoryResultMetadatas: any[];
}

const processLog = (logFile: any) => {
  if (!logFile) {
    return [];
  }

  const firstEvent = {
    dateTime: logFile.startedAt,
    title: `${logFile.runtimeType} - ${logFile.moduleName}`,
    subText: logFile.tags.join(','),
    key: logFile.id,
  };

  const secondEvent = {
    dateTime: logFile.startedAt,
    title: 'Executed with input params of',
    subText: JSON.stringify(logFile.input, null, 1),
    key: logFile.id + 'part_2',
  };

  const finalEvent = {
    dateTime: logFile.finishedAt,
    title: logFile.error ? 'Thrown Error' : 'Returned',
    subText: logFile.error
      ? JSON.stringify(logFile.error, null, 1)
      : JSON.stringify(logFile.result, null, 1),
    key: logFile.id + 'return',
  };

  const history = logFile.history.map((h: any, i: number) => {
    const message = {
      subText: `${h.act.payload ? `Input: ${JSON.stringify(h.act.payload, null, 2)}\n` : ''}${
        h.res ? `Output: ${JSON.stringify(h.res, null, 2)}` : ''
      }`,
      title: `Action: ${h.act.type.split('/').pop()}`,
      Dot: (
        <TimelineDot>
          <NotListedLocationIcon />
        </TimelineDot>
      ),
      key: logFile.id + i,
      dateTime: h.startedAt,
      timeMs: new Date(h.finishedAt).getTime() - new Date(h.startedAt).getTime(),
    };
    return message;
  });

  return [firstEvent, secondEvent, ...history, finalEvent];
};

const findServiceEndpointByLogCorrelation = (
  serviceLogEndpoints: string[],
  logStoryResultMetadatas: any[],
  logCorrelation: string,
): string | undefined => {
  const moduleName = logStoryResultMetadatas.find(
    (log: any) => log.correlation === logCorrelation,
  )?.moduleName;
  const serviceEndpoint =
    moduleName && serviceLogEndpoints.find((se: string) => se.endsWith(moduleName));

  return serviceEndpoint;
};

const LogDialog = ({
  logCorrelation,
  open,
  handleClose,
  serviceLogEndpoints,
  logStoryResultMetadatas,
}: LogDialogProps) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logFile, setLogFile] = useState(null);

  const serviceEndpoint = findServiceEndpointByLogCorrelation(
    serviceLogEndpoints,
    logStoryResultMetadatas,
    logCorrelation,
  );
  const logUrl = `/${serviceEndpoint}/log/${logCorrelation}`;

  useEffect(() => {
    if (!open || !logUrl) {
      setEvents([]);
      setLoading(false);
    } else {
      setLoading(true);
      apiRequestGet(logUrl)
        .then((log) => {
          setEvents(processLog(log));
          setLogFile(log);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [logUrl, open]);

  const handleExecute = async () => {
    if (logFile) {
      await apiRequestPost('/admin/service/log/execute', logFile);
    }
  };

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
                          subText={(e.subText || '') as string}
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
        {!loading && logFile && logFile.runtimeType === 'EXECUTE_STORY' && (
          <Button onClick={handleExecute}>Execute</Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogDialog;
