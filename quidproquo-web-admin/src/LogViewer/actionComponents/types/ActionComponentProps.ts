import { ActionHistory } from 'quidproquo-core';

import { FC } from 'react';

export type ActionComponentProps = {
  historyItem: ActionHistory;
  expanded: boolean;
};

export type ActionComponent = FC<ActionComponentProps>;
