import { askUIEventDocExportReset } from './actionCreators/askUIEventDocExportReset';
import { askUIEventDocExportSetError } from './actionCreators/askUIEventDocExportSetError';
import { askUIEventDocExportToggleSelected } from './actionCreators/askUIEventDocExportToggleSelected';
import { askEventDocExportUiBack } from './logic/askEventDocExportUiBack';
import { askEventDocExportUiClose } from './logic/askEventDocExportUiClose';
import { askEventDocExportUiConfirm } from './logic/askEventDocExportUiConfirm';
import { askEventDocExportUiOpen } from './logic/askEventDocExportUiOpen';
import { askEventDocExportUiPreview } from './logic/askEventDocExportUiPreview';

// The whole export flow, self-contained: open (loads candidates), tick, preview the manifest, confirm.
// A host supplies only its service name and the collection's base path, and turns the returned
// download url into a saved file.
export const sharedEventDocExportUiApi = {
  askEventDocExportUiOpen,
  askUIEventDocExportToggleSelected,
  askEventDocExportUiPreview,
  askEventDocExportUiBack,
  askEventDocExportUiConfirm,
  askEventDocExportUiClose,
  askUIEventDocExportSetError,
  askUIEventDocExportReset,
};
