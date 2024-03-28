import { FC } from 'react';
import { ActionHistoryLog } from '../../../types';

export type ActionComponentProps = {
  historyItem: ActionHistoryLog;
  expanded: boolean;
};

export type ActionComponent = FC<ActionComponentProps>;
