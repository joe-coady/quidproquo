// Recovers a slot's concrete folded-view type from its config (see the note on
// EventDocWorkspaceSlotConfig for why the union itself is typed with `any`).
export type EventDocWorkspaceSlotViewOf<TSlot> = TSlot extends { createInitialViewState: () => infer TView } ? TView : never;
