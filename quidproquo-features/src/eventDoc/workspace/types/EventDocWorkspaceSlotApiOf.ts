// Recovers a slot's concrete api type from its config (see the note on
// EventDocWorkspaceSlotConfig for why the union itself is typed with `any`).
export type EventDocWorkspaceSlotApiOf<TSlot> = TSlot extends { api: infer TApi } ? TApi : never;
