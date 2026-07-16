import { Nullable } from 'quidproquo-core';

export type EventDocWorkspaceChromeState = {
  historyOpen: boolean;
  helpOpen: boolean;
  // Which slot the History panel is scoped to: per-slot history with a picker.
  historySlotKey: Nullable<string>;
};

export const createInitialEventDocWorkspaceChromeState = (): EventDocWorkspaceChromeState => ({
  historyOpen: false,
  helpOpen: false,
  historySlotKey: null,
});
