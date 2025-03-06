import { Action, ActionProcessorResult, actionResult, resolveActionResult, SystemActionType, SystemBatchActionPayload } from 'quidproquo-core';

import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { ActionComponent, ActionComponentProps, AnyVariableView, genericFunctionRendererStyles, getGenericActionRenderer } from '../actionComponents';
import customActionsMap from '../actionComponents/customActionsMap';
import { ActionHistoryItem } from '../ActionHistoryItem';
import actionComponentMap from '../logic/actionComponentMap';

interface AnyActionHistoryItemProps {
  action: Action<any>;
  result: ActionProcessorResult<any>;
}

interface ActionRenderProps {
  action: Action<any>;
  result: any;
  isLegacy: boolean;
  expanded: boolean;
}

export const CoreBatchCustomAction: ActionComponent<SystemBatchActionPayload, any[]> = ({ action, expanded, result }) => {
  if (!action.payload) {
    return null;
  }

  return (
    <div style={{ borderLeft: 'thin dashed black', background: '#0400ff29', padding: '1px 10px 10px 10px' }}>
      <Box sx={{ width: '100%', my: 1 }}>
        {action.payload.actions.map((action, index) => (
          <AnyActionHistoryItem key={index} action={action} result={actionResult(resolveActionResult(result)[index])} />
        ))}
      </Box>
    </div>
  );
};

export const AnyCustomAction: ActionComponent = ({ action, result, expanded }: ActionComponentProps) => {
  if (!action.payload) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <pre style={genericFunctionRendererStyles.pre}>
        <AnyVariableView expanded={expanded} value={action.payload} />
      </pre>
    </Box>
  );
};

export const ActionRender = ({ action, result, isLegacy, expanded }: ActionRenderProps) => {
  const actionComponentConfig = actionComponentMap[action.type];

  if (!isLegacy && action.type === SystemActionType.Batch) {
    return <CoreBatchCustomAction action={action} result={result} expanded={expanded} />;
  }

  const ActionComponent = isLegacy
    ? ActionHistoryItem
    : customActionsMap[action.type]
      ? customActionsMap[action.type]
      : actionComponentConfig
        ? getGenericActionRenderer(actionComponentConfig[0], actionComponentConfig.slice(1))
        : AnyCustomAction;

  return (
    <>
      <ActionComponent action={action} result={result} expanded={expanded} />
    </>
  );
};

export const AnyActionHistoryItem = ({ action, result }: AnyActionHistoryItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [legacy, setLegacy] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const toggleLegacy = () => {
    setLegacy(!legacy);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" component="span">
          {action.type.split('/').slice(-2).join('::')}
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
      <ActionRender action={action} result={result} isLegacy={legacy} expanded={expanded} />
    </>
  );
};
