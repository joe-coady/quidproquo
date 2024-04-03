import { Typography } from '@mui/material';

interface ActionHistoryItemTimeStampProps {
  startedAt: string;
  finishedAt: string;
}

export const ActionHistoryItemTimeStamp = ({
  startedAt,
  finishedAt,
}: ActionHistoryItemTimeStampProps) => {
  const startDate = new Date(startedAt);
  const endDate = new Date(finishedAt);
  const executionTime = endDate.getTime() - startDate.getTime();

  return (
    <div>
      <Typography variant="body2">
        {startDate.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </Typography>
      <Typography variant="body2">{startDate.toLocaleDateString('en-AU')}</Typography>
      <Typography variant="body2">{`${executionTime} ms`}</Typography>
    </div>
  );
};
