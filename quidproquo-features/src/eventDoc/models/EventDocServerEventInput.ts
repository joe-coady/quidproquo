// One server-authored event in a batch append (askEventDocAppendServerEvents):
// effect type + typed data + the doc's schema version — the same args a caller
// hands askEventDocAppendServerEvent, as data. The append mints ids, stamps the
// actor/clock, and builds the envelope.
export type EventDocServerEventInput<T = unknown> = {
  type: string;
  data: T;
  version: number;
};
