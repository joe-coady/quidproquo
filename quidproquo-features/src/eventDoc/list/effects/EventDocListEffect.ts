export enum EventDocListEffect {
  SetConfig = 'EventDocList/SetConfig',
  // One page arrived: its rows plus the cursor for the page after it.
  PageLoaded = 'EventDocList/PageLoaded',
  AddItem = 'EventDocList/AddItem',
  SetLoading = 'EventDocList/SetLoading',
  SetError = 'EventDocList/SetError',
  // Move the walk to a page, carrying the cursor that loads it.
  SetPageIndex = 'EventDocList/SetPageIndex',
  SetPageSize = 'EventDocList/SetPageSize',
}
