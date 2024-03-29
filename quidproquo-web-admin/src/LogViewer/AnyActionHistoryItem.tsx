import { ActionHistoryLog } from '../types';
import { Typography, IconButton, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

import { getGenericActionRenderer } from './actionComponents';
import { ActionComponent } from './actionComponents/types';
import { ActionHistoryItem } from './ActionHistoryItem';

const ActionComponentMap: Record<string, ActionComponent> = {
  ['@quidproquo-webserver/Websocket/SendMessage']: getGenericActionRenderer(
    'askWebsocketSendMessage',
    ['websocketApiName', 'connectionId', 'payload'],
  ),
  ['@quidproquo-core/UserDirectory/RefreshToken']: getGenericActionRenderer(
    'askUserDirectoryRefreshToken',
    ['userDirectoryName', 'refreshToken'],
  ),
  ['@quidproquo-core/UserDirectory/DecodeAccessToken']: getGenericActionRenderer(
    'askUserDirectoryDecodeAccessToken',
    ['userDirectoryName', 'ignoreExpiration', 'accessToken', 'serviceOverride'],
  ),
  ['@quidproquo-core/KeyValueStore/Query']: getGenericActionRenderer(
    'askKeyValueStoreQuery',
    ['keyValueStoreName', 'keyCondition', 'options'],
    [
      'keyValueStoreName: string',
      'keyCondition: KvsQueryOperation',
      'options?: KeyValueStoreQueryOptions',
    ],
  ),
};

interface AnyActionHistoryItemProps {
  historyItem: ActionHistoryLog;
}

export const AnyActionHistoryItem = ({ historyItem }: AnyActionHistoryItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const ActionComponent = ActionComponentMap[historyItem.act.type];

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
