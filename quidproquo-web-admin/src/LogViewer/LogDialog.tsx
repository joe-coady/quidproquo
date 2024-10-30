import { QpqRuntimeType, StoryResult } from 'quidproquo-core';
import { useBaseUrlResolvers } from 'quidproquo-web-react';

import { useState } from 'react';
import {
  AppBar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';

import { useExternalData, usePlatformDataFromPath } from '../components/LoadingBox/hooks';
import { apiRequestPost } from '../logic';
import { useIsLoading } from '../view';
import { EventTimeline } from './EventTimeline'; // Add this import
import { HelpChat } from './HelpChat';
import { useLogTreeData } from './hooks';
import { LogCorrelations } from './LogCorrelations';
import { LogDetails } from './LogDetails';
import { getLogUrl } from './logic';
import { LogRawJson } from './LogRawJson';
import { LogSummary } from './LogSummary';

const getEmptyStorySession = (correlation: string): StoryResult<any> => {
  const noStoryResult: StoryResult<any> = {
    correlation,

    finishedAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),

    history: [],
    input: ['Log cant be downloaded'],

    moduleName: correlation.split('::')[0],
    runtimeType: QpqRuntimeType.EXECUTE_STORY,
    session: {
      depth: 0,
      context: {},
    },
    tags: ['Log unable to be downloaded'],
  };

  return noStoryResult;
};

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

const useLoadedStoryResult = (logCorrelation: string) => {
  const signedRequest = usePlatformDataFromPath<{ url: string; isColdStorage: boolean }>(getLogUrl(logCorrelation));
  const log = useExternalData<StoryResult<any>>(signedRequest?.url) || getEmptyStorySession(logCorrelation);
  const isLoading = useIsLoading();

  return {
    isLoading: isLoading,
    isColdStorage: !!signedRequest?.isColdStorage,
    isOldLog: false,
    log,
  };
};

const LogDialog = ({ logCorrelation, open, handleClose, setSelectedLogCorrelation }: LogDialogProps) => {
  const asyncLog = useLoadedStoryResult(logCorrelation);

  const urlResolvers = useBaseUrlResolvers();

  const handleExecute = async () => {
    if (asyncLog) {
      await apiRequestPost('http://localhost:8080/admin/service/log/execute', asyncLog.log, urlResolvers.getApiUrl());
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
        <Tabs value={selectedTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
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
          {!asyncLog.isLoading && (
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row-reverse',
                }}
              >
                <FormControlLabel
                  control={<Checkbox checked={hideFastActions} onChange={(event) => setHideFastActions(event.target.checked)} />}
                  label="Hide Fast Actions"
                />
                <FormControlLabel
                  control={<Checkbox checked={orderByDuration} onChange={(event) => setOrderByDuration(event.target.checked)} />}
                  label="Order by Duration"
                />
              </div>
              <LogDetails log={asyncLog.log} hideFastActions={hideFastActions} orderByDuration={orderByDuration} />
            </>
          )}
          {asyncLog.isLoading && <LinearProgress />}
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
          {!asyncLog.isLoading && <LogSummary log={asyncLog.log} />}
          {asyncLog.isLoading && <LinearProgress />}
        </div>
        <div style={getTabStyle(selectedTab, 4)}>
          {!asyncLog.isLoading && <LogRawJson log={asyncLog.log} />}
          {asyncLog.isLoading && <LinearProgress />}
        </div>
        <div style={getTabStyle(selectedTab, 5)}>
          <HelpChat logCorrelation={logCorrelation} />
        </div>
      </DialogContent>

      <DialogActions>
        <Button style={getTabStyle(selectedTab, 1)} onClick={(event) => treeApi.refreshTreeData()} disabled={asyncLog.isLoading}>
          Refresh Tree
        </Button>
        <Button style={getTabStyle(selectedTab, 2)} onClick={(event) => treeApi.refreshTreeData()} disabled={asyncLog.isLoading}>
          Refresh Timeline
        </Button>
        <Button
          onClick={(event) => {
            if (asyncLog.log) {
              downloadJson(JSON.stringify(asyncLog.log, null, 2), `${asyncLog.log.correlation}.json`);
            }
            event.stopPropagation();
          }}
          disabled={asyncLog.isLoading}
        >
          Download
        </Button>
        {asyncLog.log && (
          <Button onClick={handleExecute} disabled={asyncLog.isLoading}>
            Execute
          </Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogDialog;
