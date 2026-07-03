// INIT_STATE payload — the document's identity, seeded by the backend at create. `id`
// is the modelId (set here once, never again); `code`/`name` are the create-time values.
export type EventDocInitData = {
  id: string;
  code: string;
  name: string;
};
