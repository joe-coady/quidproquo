import { AskResponse } from 'quidproquo-core';

import { askEventDocReadState } from '../actions/eventDocEvent/EventDocReadStateActionRequester';

// Mints a doc type's typed read verb — the ONE home of the unknown→TView assertion:
//
//   export const askReadTemplate = createEventDocStateReader<TemplateState>();
//
// Minted in its own file, NOT on the doc's definition object: the definition imports
// the doc's api verbs, and the verbs call this reader, so hanging it off the
// definition would recreate the import cycle this whole design removes. Standalone,
// the graph stays linear: reader ← verbs ← api ← definition.
export const createEventDocStateReader = <TView>() =>
  function* askReadState(): AskResponse<TView> {
    return (yield* askEventDocReadState()) as TView;
  };
