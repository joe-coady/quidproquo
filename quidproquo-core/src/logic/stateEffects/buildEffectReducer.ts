export function buildEffectReducer<State, Effect extends { type: string }>(handlers: {
  [K in Effect['type']]?: (state: State, effect: Extract<Effect, { type: K }>) => State;
}) {
  return (state: State, effect: Effect): [State, boolean] => {
    const handler = handlers[effect.type as Effect['type']];
    if (handler) {
      return [handler(state, (effect as any).payload), true];
    }
    return [state, false];
  };
}
