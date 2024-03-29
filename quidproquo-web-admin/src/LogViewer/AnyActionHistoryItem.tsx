import { ActionHistoryLog } from '../types';
import { Typography, IconButton, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

import { ActionHistoryItem } from './ActionHistoryItem';
import { actionComponentMap } from './logic/actionComponentMap';

interface AnyActionHistoryItemProps {
  historyItem: ActionHistoryLog;
}

export const AnyActionHistoryItem = ({ historyItem }: AnyActionHistoryItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const ActionComponent = actionComponentMap[historyItem.act.type];

  return (
    <>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" component="span">
          {historyItem.act.type.split('/').slice(-2).join('::')}
        </Typography>
        <IconButton size="small" onClick={toggleExpanded}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      {ActionComponent ? (
        <ActionComponent historyItem={historyItem} expanded={expanded} />
      ) : (
        <ActionHistoryItem historyItem={historyItem} expanded={expanded} />
      )}
    </>
  );
};
