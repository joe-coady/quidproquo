import { getLogUrl } from './logic';

import { Dialog, DialogContent, DialogTitle, LinearProgress } from '@mui/material';

import { LogDialogContent } from './LogDialogContent';
import { LoadingBox } from '../components/LoadingBox/LoadingBox';
import { LogCorrelations } from './LogCorrelations';
import { SearchParams } from './types';

interface LogDialogProps {
  open: boolean;
  logCorrelation: string;
  handleClose: () => void;
  serviceLogEndpoints: string[];
  storyResultMetadatas: any[];
  setSelectedLogCorrelation: (logCorrelation: string) => void;
  onSearch: (searchParams?: SearchParams) => Promise<void>;
}

const LogDialog = ({
  logCorrelation,
  open,
  handleClose,
  serviceLogEndpoints,
  storyResultMetadatas,
  setSelectedLogCorrelation,
  onSearch,
}: LogDialogProps) => {
  const logUrl = getLogUrl(serviceLogEndpoints, storyResultMetadatas, logCorrelation);

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
          width: '90%', // adjust the width percentage as needed
          height: '90%', // adjust the height percentage as needed
          maxHeight: '90%',
          maxWidth: '90%',
        },
      }}
    >
      <DialogTitle id="scroll-dialog-title">Log Details</DialogTitle>
      <LoadingBox
        path={logUrl}
        renderItem={(item) => (
          <LogDialogContent
            log={item}
            handleClose={handleClose}
            storyResultMetadatas={storyResultMetadatas}
            setSelectedLogCorrelation={setSelectedLogCorrelation}
            onSearch={onSearch}
          />
        )}
        renderLoading={() => (
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
              onSearch={onSearch}
            />
            <LinearProgress />
          </DialogContent>
        )}
      />
    </Dialog>
  );
};

export default LogDialog;
