import { askUIEventDocImportReset } from './actionCreators/askUIEventDocImportReset';
import { askUIEventDocImportSetError } from './actionCreators/askUIEventDocImportSetError';
import { askEventDocImportUiApply } from './logic/askEventDocImportUiApply';
import { askEventDocImportUiClear } from './logic/askEventDocImportUiClear';
import { askEventDocImportUiLoad } from './logic/askEventDocImportUiLoad';

// The generic import-screen verbs. A host app spreads this into its runtime api and supplies its own
// service name plus the file picker.
export const sharedEventDocImportUiApi = {
  askEventDocImportUiLoad,
  askEventDocImportUiApply,
  askEventDocImportUiClear,
  askUIEventDocImportSetError,
  askUIEventDocImportReset,
};
