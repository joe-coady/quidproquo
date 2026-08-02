// Events per history-panel page (newest-first, walking backwards on demand). Large
// enough that most documents load their whole history in one page; small enough that a
// thousand-event log costs nothing until someone actually walks it.
export const EVENT_DOC_WORKSPACE_HISTORY_PAGE_SIZE = 50;
