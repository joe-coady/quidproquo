import { produce } from 'immer';

// Update the signature so that for each effect type K, we extract its payload type.
export function buildMutableEffectReducer<State, E extends { type: string; payload: any }>(handlers: {
  [K in E['type']]?: (state: State, payload: Extract<E, { type: K }>['payload']) => void;
}) {
  return (state: State, effect: E): [State, boolean] => {
    const handler: any = (handlers as any)[effect.type];
    if (handler) {
      const nextState = produce(state, (draft: State) => {
        handler(draft, effect.payload);
      });
      return [nextState, true];
    }
    return [state, false];
  };
}
