import { askChromeSetHelpOpen } from './actionCreators/askChromeSetHelpOpen';
import { askChromeSetHistoryOpen } from './actionCreators/askChromeSetHistoryOpen';
import { askChromeSetHistorySlotKey } from './actionCreators/askChromeSetHistorySlotKey';

// The chrome slot's api surface; the factory binds it to the chrome stream.
export const eventDocWorkspaceChromeApi = {
  askChromeSetHistoryOpen,
  askChromeSetHelpOpen,
  askChromeSetHistorySlotKey,
};
