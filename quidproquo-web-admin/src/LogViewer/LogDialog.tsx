import { getLogUrl } from './logic';

import {
  Dialog,
  LinearProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
} from '@mui/material';

import { LogCorrelations } from './LogCorrelations';
import { LogDetails } from './LogDetails';
import { LogSummary } from './LogSummary';
import { LogRawJson } from './LogRawJson'; // Add this import

import { useExternalData, usePlatformDataFromPath } from '../components/LoadingBox/hooks';
import { useIsLoading } from '../view';
import { apiRequestPost } from '../logic';
import { StoryResult } from 'quidproquo-core';
import { useState } from 'react';

interface LogDialogProps {
  open: boolean;
  logCorrelation: string;
  handleClose: () => void;
  storyResultMetadatas: any[];
  setSelectedLogCorrelation: (logCorrelation: string) => void;
}

function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  // The URL.revokeObjectURL() method releases an existing object URL
  URL.revokeObjectURL(url);
}

const LogDialog = ({
  logCorrelation,
  open,
  handleClose,
  storyResultMetadatas,
  setSelectedLogCorrelation,
}: LogDialogProps) => {
  const signedRequest = usePlatformDataFromPath<{ url: string }>(getLogUrl(logCorrelation));
  const log = useExternalData<StoryResult<any>>(signedRequest?.url);

  const isLoading = useIsLoading() || !log;

  const handleExecute = async () => {
    if (log) {
      await apiRequestPost('http://localhost:8080/admin/service/log/execute', log);
    }
  };

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Dialog
      open={open}
      scroll={'paper'}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      onClose={handleClose}
      maxWidth={false}
      fullWidth={true}
      PaperProps={{
        style: {
          width: '90%',
          height: '90%',
          maxHeight: '90%',
          maxWidth: '90%',
        },
      }}
    >
      <DialogTitle id="scroll-dialog-title">Log Details - {logCorrelation}</DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '150px',
          overflowY: 'scroll',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Log Details" />
            <Tab label="Tree View" />
            <Tab label="Summary" />
            <Tab label="Raw JSON" /> {/* Add this new tab */}
          </Tabs>
        </Box>
        {selectedTab === 0 && (
          <>
            {!isLoading && (
              <LogDetails
                log={log!}
                storyResultMetadatas={storyResultMetadatas}
                setSelectedLogCorrelation={setSelectedLogCorrelation}
              />
            )}
            {isLoading && <LinearProgress />}
          </>
        )}
        {selectedTab === 1 && (
          <LogCorrelations
            logCorrelation={logCorrelation}
            storyResultMetadatas={storyResultMetadatas}
            setSelectedLogCorrelation={setSelectedLogCorrelation}
          />
        )}
        {selectedTab === 2 && (
          <>
            {!isLoading && <LogSummary log={log!} />}
            {isLoading && <LinearProgress />}
          </>
        )}
        {selectedTab === 3 && ( // Add this new section for the Raw JSON tab
          <>
            {!isLoading && <LogRawJson log={log!} />}
            {isLoading && <LinearProgress />}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={(event) => {
            downloadJson(JSON.stringify(log, null, 2), `${log!.correlation}.json`);
            event.stopPropagation();
          }}
          disabled={isLoading}
        >
          Download
        </Button>
        {log && log.runtimeType === 'EXECUTE_STORY' && (
          <Button onClick={handleExecute} disabled={isLoading}>
            Execute
          </Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogDialog;
