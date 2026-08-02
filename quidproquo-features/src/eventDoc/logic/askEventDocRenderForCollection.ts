import { AskResponse, createDynamicFunctionCaller } from 'quidproquo-core';

import { eventDocFunctionsName } from '../constants/eventDocFunctionsName';
import { askEventDocProvideStore } from '../context/askEventDocProvideStore';
import { EventDocInvokableFunctions } from '../definition/types/EventDocInvokableFunctions';
import { EventDocRenderInput, EventDocRenderResult } from '../models';

// Render a doc of ANOTHER collection in-process, addressed by identity alone — the
// in-lambda twin of the render route, for cross-collection composition (a template
// resolving its layout/content links). Provides the target collection's store context so
// the renderer's own reads (blob-drive assets, linked docs) resolve against the right
// stores; the caller resolves WHICH events to render first. Unlike the render route,
// nothing is soft here: the caller names a specific collection expecting a renderer, so a
// missing registration or render member propagates as its dynamic-functions error.
export function* askEventDocRenderForCollection(storeName: string, type: string, input: EventDocRenderInput): AskResponse<EventDocRenderResult> {
  const functionsCaller = createDynamicFunctionCaller<EventDocInvokableFunctions>(eventDocFunctionsName(storeName, type));

  return yield* askEventDocProvideStore({ storeName, type }, functionsCaller.render(input));
}
