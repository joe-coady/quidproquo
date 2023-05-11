import { DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { LogDetails } from './LogDetails';
import { apiRequestPost } from '../logic';
import { LogCorrelations } from './LogCorrelations';

interface LogDialogContentProps {
  log: any;
  handleClose: () => void;
  storyResultMetadatas: any[];
  setSelectedLogCorrelation: (logCorrelation: string) => void;
}

export const LogDialogContent = ({
  log,
  handleClose,
  storyResultMetadatas,
  setSelectedLogCorrelation,
}: LogDialogContentProps) => {
  const handleExecute = async () => {
    if (log) {
      await apiRequestPost('/admin/service/log/execute', log);
    }
  };

  return (
    <>
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '150px',
          overflowY: 'scroll',
        }}
      >
        <LogCorrelations
          logCorrelation={log.correlation}
          storyResultMetadatas={storyResultMetadatas}
          setSelectedLogCorrelation={setSelectedLogCorrelation}
        />
        <LogDetails
          log={log}
          storyResultMetadatas={storyResultMetadatas}
          setSelectedLogCorrelation={setSelectedLogCorrelation}
        />
      </DialogContent>
      <DialogActions>
        {log && log.runtimeType === 'EXECUTE_STORY' && (
          <Button onClick={handleExecute}>Execute</Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </>
  );
};
