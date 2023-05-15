import { getLogUrl } from './logic';

import {
  Dialog,
  LinearProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import { LogCorrelations } from './LogCorrelations';
import { LogDetails } from './LogDetails';

import { StoryResultMetadataLog } from '../types';
import { useDataFromPath } from '../components/LoadingBox/hooks';
import { useIsLoading } from '../view';
import { apiRequestPost } from '../logic';

interface LogDialogProps {
  open: boolean;
  logCorrelation: string;
  handleClose: () => void;
  serviceLogEndpoints: string[];
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
  serviceLogEndpoints,
  storyResultMetadatas,
  setSelectedLogCorrelation,
}: LogDialogProps) => {
  const logUrl = getLogUrl(serviceLogEndpoints, storyResultMetadatas, logCorrelation);
  const log = useDataFromPath<StoryResultMetadataLog>(logUrl);
  const isLoading = useIsLoading();

  const handleExecute = async () => {
    if (log) {
      await apiRequestPost('/admin/service/log/execute', log);
    }
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
        <LogCorrelations
          logCorrelation={logCorrelation}
          storyResultMetadatas={storyResultMetadatas}
          setSelectedLogCorrelation={setSelectedLogCorrelation}
        />
        {!isLoading && (
          <LogDetails
            log={log}
            storyResultMetadatas={storyResultMetadatas}
            setSelectedLogCorrelation={setSelectedLogCorrelation}
          />
        )}
        {isLoading && <LinearProgress />}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={(event) => {
            downloadJson(JSON.stringify(log, null, 2), `${log.correlation}.json`);
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
