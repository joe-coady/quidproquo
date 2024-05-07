import { ActionHistory } from 'quidproquo';
import { FC } from 'react';

export type ActionComponentProps = {
  historyItem: ActionHistory;
  expanded: boolean;
};

export type ActionComponent = FC<ActionComponentProps>;
