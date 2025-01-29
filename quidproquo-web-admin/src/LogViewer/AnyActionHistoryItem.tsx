import { ActionHistory } from 'quidproquo-core';

import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import customActionsMap from './actionComponents/customActionsMap';
import actionComponentMap from './logic/actionComponentMap';
import { getGenericActionRenderer } from './actionComponents';
import { ActionHistoryItem } from './ActionHistoryItem';

interface AnyActionHistoryItemProps {
  historyItem: ActionHistory;
}

export const AnyActionHistoryItem = ({ historyItem }: AnyActionHistoryItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [legacy, setLegacy] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const toggleLegacy = () => {
    setLegacy(!legacy);
  };

  const actionComponentConfig = actionComponentMap[historyItem.act.type];
  const ActionComponent = legacy
    ? ActionHistoryItem
    : customActionsMap[historyItem.act.type]
      ? customActionsMap[historyItem.act.type]
      : actionComponentConfig
        ? getGenericActionRenderer(actionComponentConfig[0], actionComponentConfig.slice(1))
        : ActionHistoryItem;

  return (
    <>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" component="span">
          {historyItem.act.type.split('/').slice(-2).join('::')}
        </Typography>
        <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
          <IconButton size="small" onClick={toggleExpanded}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Legacy View">
          <IconButton size="small" onClick={toggleLegacy}>
            <HistoryIcon color={legacy ? 'primary' : 'inherit'} />
          </IconButton>
        </Tooltip>
      </Box>
      <ActionComponent historyItem={historyItem} expanded={expanded} />
    </>
  );
};
