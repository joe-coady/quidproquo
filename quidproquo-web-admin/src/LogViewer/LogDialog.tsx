import { getLogUrl } from './logic';

import { Dialog } from '@mui/material';

import { LogDialogContent } from './LogDialogContent';
import { LoadingBox } from '../components/LoadingBox/LoadingBox';

interface LogDialogProps {
  open: boolean;
  logCorrelation: string;
  handleClose: () => void;
  serviceLogEndpoints: string[];
  logStoryResultMetadatas: any[];
}

const LogDialog = ({
  logCorrelation,
  open,
  handleClose,
  serviceLogEndpoints,
  logStoryResultMetadatas,
}: LogDialogProps) => {
  const logUrl = getLogUrl(serviceLogEndpoints, logStoryResultMetadatas, logCorrelation);

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
      <LoadingBox
        path={logUrl}
        renderItem={(item) => <LogDialogContent log={item} handleClose={handleClose} />}
      />
    </Dialog>
  );
};

export default LogDialog;
