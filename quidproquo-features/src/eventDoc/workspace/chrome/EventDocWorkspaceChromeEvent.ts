// Event types on the workspace's default chrome stream: a local slot, session-only,
// LWW-coalesced per type by default so toggles don't accumulate.
export enum EventDocWorkspaceChromeEvent {
  setHistoryOpen = 'workspaceChromeSetHistoryOpen',
  setHelpOpen = 'workspaceChromeSetHelpOpen',
  setHistorySlotKey = 'workspaceChromeSetHistorySlotKey',
}
