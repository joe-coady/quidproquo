// The "user code" — the file the tracer must step through and capture.
// Mirrors a qpq story: a generator that yields actions, delegates with yield*,
// calls a plain helper, branches, and loops. Everything OUTSIDE this file is
// framework code and must not appear in the trace.

function* askGuidNew() {
  const guid = yield { type: 'Guid::New' };
  return guid;
}

function* askKeyValueStoreGet(key) {
  const record = yield { type: 'KeyValueStore::Get', payload: { key } };
  return record;
}

function formatName(user) {
  const first = user.first.trim();
  const last = user.last.trim();
  return `${first} ${last}`;
}

function* askOnboardUsers(count) {
  const id = yield* askGuidNew();
  const owner = yield* askKeyValueStoreGet(`owner-${id}`);
  const ownerName = formatName(owner);

  const results = [];
  for (let i = 0; i < count; i += 1) {
    const user = yield* askKeyValueStoreGet(`user-${i}`);
    const name = formatName(user);
    if (name.length > 8) {
      results.push({ index: i, name });
    }
  }

  return { id, ownerName, total: results.length };
}

module.exports = { askOnboardUsers };
