import { AskResponse } from 'quidproquo-core';

import { EventDocWorkspaceSlotBinding } from '../types/EventDocWorkspaceSlotBinding';
import { EventDocWorkspaceStoryApi } from '../types/EventDocWorkspaceStoryApi';
import { askRunInEventDocWorkspaceSlot } from './askRunInEventDocWorkspaceSlot';

// Wraps one scope-blind verb so every call runs under the slot's override.
const bindVerb = (binding: EventDocWorkspaceSlotBinding, verb: (...args: any[]) => AskResponse<any>) =>
  function* boundVerb(...args: any[]): AskResponse<any> {
    return yield* askRunInEventDocWorkspaceSlot(binding, verb(...args));
  };

// Signature-identical api where every verb's commits land in the bound slot. The same
// domain api can be mounted at n slot keys; the leaf verbs never know.
export const bindEventDocWorkspaceApi = <TApi extends EventDocWorkspaceStoryApi>(binding: EventDocWorkspaceSlotBinding, api: TApi): TApi =>
  Object.fromEntries(Object.entries(api).map(([verbName, verb]) => [verbName, bindVerb(binding, verb)])) as TApi;
