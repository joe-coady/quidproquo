export function buildEffectReducer<State, Effect extends { type: string; payload: any }>(handlers: {
  [K in Effect['type']]?: (state: State, payload: Extract<Effect, { type: K }>['payload']) => State;
}) {
  return (state: State, effect: Effect): [State, boolean] => {
    const handler = handlers[effect.type as Effect['type']];
    if (handler) {
      return [handler(state, effect.payload), true];
    }
    return [state, false];
  };
}