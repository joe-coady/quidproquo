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
  AppBar,
  useTheme,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import { LogCorrelations } from './LogCorrelations';
import { LogDetails } from './LogDetails';
import { LogSummary } from './LogSummary';
import { LogRawJson } from './LogRawJson';
import { HelpChat } from './HelpChat';
import { EventTimeline } from './EventTimeline'; // Add this import

import { useExternalData, usePlatformDataFromPath } from '../components/LoadingBox/hooks';
import { useIsLoading } from '../view';
import { apiRequestPost } from '../logic';
import { StoryResult } from 'quidproquo-core';
import { useState } from 'react';
import { useLogTreeData } from './hooks';

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

const getTabStyle = (tabIndex: number, selectedTab: number) => ({
  display: selectedTab === tabIndex ? 'block' : 'none',
  height: '100%',
});

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
  const [hideFastActions, setHideFastActions] = useState(false);
  const [orderByDuration, setOrderByDuration] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const theme = useTheme();

  const treeApi = useLogTreeData(logCorrelation, false);

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
      <AppBar position="sticky" color="primary">
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Log Details" />
          <Tab label="Tree" />
          <Tab label="Timeline" />
          <Tab label="Notes" />
          <Tab label="Raw JSON" />
          <Tab label="Help" />
        </Tabs>
      </AppBar>
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '150px',
          overflowY: 'scroll',
        }}
      >
        <div style={getTabStyle(selectedTab, 0)}>
          {!isLoading && (
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row-reverse',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hideFastActions}
                      onChange={(event) => setHideFastActions(event.target.checked)}
                    />
                  }
                  label="Hide Fast Actions"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={orderByDuration}
                      onChange={(event) => setOrderByDuration(event.target.checked)}
                    />
                  }
                  label="Order by Duration"
                />
              </div>
              <LogDetails
                log={log!}
                hideFastActions={hideFastActions}
                orderByDuration={orderByDuration}
              />
            </>
          )}
          {isLoading && <LinearProgress />}
        </div>
        <div style={getTabStyle(selectedTab, 1)}>
          <LogCorrelations
            logCorrelation={logCorrelation}
            setSelectedLogCorrelation={setSelectedLogCorrelation}
            isVisible={selectedTab === 1}
            treeApi={treeApi}
          />
        </div>
        <div style={getTabStyle(selectedTab, 2)}>
          <EventTimeline
            logCorrelation={logCorrelation}
            setSelectedLogCorrelation={setSelectedLogCorrelation}
            isVisible={selectedTab === 2}
            treeApi={treeApi}
          />
        </div>
        <div style={getTabStyle(selectedTab, 3)}>
          {!isLoading && <LogSummary log={log!} />}
          {isLoading && <LinearProgress />}
        </div>
        <div style={getTabStyle(selectedTab, 4)}>
          {!isLoading && <LogRawJson log={log!} />}
          {isLoading && <LinearProgress />}
        </div>
        <div style={getTabStyle(selectedTab, 5)}>
          <HelpChat logCorrelation={logCorrelation} />
        </div>
      </DialogContent>

      <DialogActions>
        <Button
          style={getTabStyle(selectedTab, 1)}
          onClick={(event) => treeApi.refreshTreeData()}
          disabled={isLoading}
        >
          Refresh Tree
        </Button>
        <Button
          style={getTabStyle(selectedTab, 2)}
          onClick={(event) => treeApi.refreshTreeData()}
          disabled={isLoading}
        >
          Refresh Timeline
        </Button>
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
