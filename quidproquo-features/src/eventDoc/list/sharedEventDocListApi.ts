import { askUIEventDocListAddItem } from './actionCreators/askUIEventDocListAddItem';
import { askUIEventDocListSetConfig } from './actionCreators/askUIEventDocListSetConfig';
import { askUIEventDocListSetError } from './actionCreators/askUIEventDocListSetError';
import { askUIEventDocListSetLoading } from './actionCreators/askUIEventDocListSetLoading';
import { askUIEventDocListPageLoaded } from './actionCreators/askUIEventDocListPageLoaded';
import { askEventDocListInit } from './logic/askEventDocListInit';
import { askEventDocListLoad } from './logic/askEventDocListLoad';
import { askEventDocListNextPage } from './logic/askEventDocListNextPage';
import { askEventDocListPreviousPage } from './logic/askEventDocListPreviousPage';
import { askEventDocListRefresh } from './logic/askEventDocListRefresh';
import { askEventDocListSetPageSize } from './logic/askEventDocListSetPageSize';

// The generic list verbs. A host app spreads this into its runtime api and adds its
// own glue on top: an init story that supplies the config (doccypoccy reads tab module
// params) and verbs like open-item / create-item that route into the host's UI.
//
// Paging is a WALK (next/previous), not a jump to a numbered page: the store hands back an opaque
// continue-from-here cursor rather than an offset, so there is no addressing page 7 and no total count
// without reading the whole collection — which is exactly the cost this avoids.
export const sharedEventDocListApi = {
  askEventDocListInit,
  askEventDocListLoad,
  askEventDocListRefresh,
  askEventDocListNextPage,
  askEventDocListPreviousPage,
  askEventDocListSetPageSize,
  askUIEventDocListSetConfig,
  askUIEventDocListPageLoaded,
  askUIEventDocListAddItem,
  askUIEventDocListSetLoading,
  askUIEventDocListSetError,
};
