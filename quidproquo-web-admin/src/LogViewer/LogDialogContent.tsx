import { DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { LogDetails } from './LogDetails';
import { apiRequestPost } from '../logic';

interface LogDialogContentProps {
  log: any;
  handleClose: () => void;
}

export const LogDialogContent = ({ log, handleClose }: LogDialogContentProps) => {
  const handleExecute = async () => {
    if (log) {
      await apiRequestPost('/admin/service/log/execute', log);
    }
  };

  return (
    <>
      <DialogTitle id="scroll-dialog-title">Log Details</DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '150px',
          overflowY: 'scroll',
        }}
      >
        <LogDetails log={log} />
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
