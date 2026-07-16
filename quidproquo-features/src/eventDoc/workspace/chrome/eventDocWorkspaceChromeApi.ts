import { askChromeSetHelpOpen } from './logic/askChromeSetHelpOpen';
import { askChromeSetHistoryOpen } from './logic/askChromeSetHistoryOpen';
import { askChromeSetHistorySlotKey } from './logic/askChromeSetHistorySlotKey';

// The chrome slot's api surface; the factory binds it to the chrome stream.
export const eventDocWorkspaceChromeApi = {
  askChromeSetHistoryOpen,
  askChromeSetHelpOpen,
  askChromeSetHistorySlotKey,
};
