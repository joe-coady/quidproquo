import { FC } from 'react';
import { ActionHistory } from 'quidproquo-core';

export type ActionComponentProps = {
  historyItem: ActionHistory;
  expanded: boolean;
};

export type ActionComponent = FC<ActionComponentProps>;
