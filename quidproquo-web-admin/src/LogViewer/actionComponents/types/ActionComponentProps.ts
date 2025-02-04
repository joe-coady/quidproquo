import { ActionHistory } from 'quidproquo-core';

import { FC } from 'react';

export type ActionComponentProps<T = any> = {
  historyItem: ActionHistory<T>;
  expanded: boolean;
};

export type ActionComponent<T = any> = FC<ActionComponentProps<T>>;
