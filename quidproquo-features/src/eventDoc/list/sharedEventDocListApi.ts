import { askUIEventDocListAddItem } from './actionCreators/askUIEventDocListAddItem';
import { askUIEventDocListSetConfig } from './actionCreators/askUIEventDocListSetConfig';
import { askUIEventDocListSetError } from './actionCreators/askUIEventDocListSetError';
import { askUIEventDocListSetItems } from './actionCreators/askUIEventDocListSetItems';
import { askUIEventDocListSetLoading } from './actionCreators/askUIEventDocListSetLoading';
import { askEventDocListInit } from './logic/askEventDocListInit';
import { askEventDocListLoad } from './logic/askEventDocListLoad';
import { askEventDocListRefresh } from './logic/askEventDocListRefresh';
import { askEventDocListSetPage } from './logic/askEventDocListSetPage';
import { askEventDocListSetPageSize } from './logic/askEventDocListSetPageSize';

// The generic list verbs. A host app spreads this into its runtime api and adds its
// own glue on top: an init story that supplies the config (doccypoccy reads tab module
// params) and verbs like open-item / create-item that route into the host's UI.
export const sharedEventDocListApi = {
  askEventDocListInit,
  askEventDocListLoad,
  askEventDocListRefresh,
  askEventDocListSetPage,
  askEventDocListSetPageSize,
  askUIEventDocListSetConfig,
  askUIEventDocListSetItems,
  askUIEventDocListAddItem,
  askUIEventDocListSetLoading,
  askUIEventDocListSetError,
};
