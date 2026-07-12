import { ConfigActionType, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askEventDocStoreRead } from '../context/askEventDocStoreRead';
import { buildEventDocStore } from '../context/buildEventDocStore';
import { askEventDocProvideStoreFromGlobals } from './askEventDocProvideStoreFromGlobals';
import { buildEventDocStoreGlobals } from './buildEventDocStoreGlobals';

// Drift guard: the bridge reads its globals UNCONDITIONALLY (askConfigGetGlobal
// throws on a missing one), so buildEventDocStoreGlobals must provide every
// global the bridge asks for. This runs the REAL bridge against the REAL
// builder's output - a new store field wired into the bridge but not the
// builder fails here instead of at request time in every definer that
// hand-rolled its globals (the exact bug this builder replaced).
describe('buildEventDocStoreGlobals', () => {
  it('provides every global askEventDocProvideStoreFromGlobals reads', () => {
    const store = buildEventDocStore({
      storeName: 'widgets',
      type: 'widget',
      eventValidator: 'validateWidget',
      eventRenderer: 'renderWidget',
      onPublish: 'syncWidget',
      scopeResolver: 'resolveWidgetScope',
    });

    const globals = buildEventDocStoreGlobals(store);

    const resolved = runStory(askEventDocProvideStoreFromGlobals(askEventDocStoreRead()), {
      [ConfigActionType.GetGlobal]: (action: { payload: { globalName: string } }) => {
        if (!(action.payload.globalName in globals)) {
          throw new Error(`Global config ${action.payload.globalName} not found`);
        }
        return globals[action.payload.globalName];
      },
    });

    expect(resolved).toEqual(store);
  });
});
