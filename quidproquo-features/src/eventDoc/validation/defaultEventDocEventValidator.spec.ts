import { describe, expect, it } from 'vitest';

import { EventDocEffect, EventDocEvent } from '../models';
import { defaultEventDocEventValidator } from './defaultEventDocEventValidator';

const { InitState, CreateDraft, Publish } = EventDocEffect;

let seq = 0;
const ev = (type: string, data: unknown = {}): EventDocEvent => ({
  type,
  payload: {
    data,
    metadata: {
      version: 1,
      clientMessageId: `m${seq}`,
      createdBy: { userId: 'u', userDisplayName: 'U' },
      createdAt: '2026-01-01T00:00:00.000Z',
      index: seq++,
    },
  },
});

const init = () => ev(InitState, { id: 'd1', code: 'FOO', name: 'Foo' });

// The default gate: no per-collection reducer, status folded from the log with
// foldEventDocBase. A domain event ('ADD_NODE') stands in for any collection edit.
describe('defaultEventDocEventValidator', () => {
  it('allows domain edits on an open draft', () => {
    expect(defaultEventDocEventValidator(ev('ADD_NODE'), [init()])).toBeNull();
  });

  it('rejects a domain edit once the document is published', () => {
    const published = [init(), ev(Publish)];
    expect(defaultEventDocEventValidator(ev('ADD_NODE'), published)).toBeTruthy();
    expect(defaultEventDocEventValidator(ev('REMOVE_NODE'), published)).toBeTruthy();
    expect(defaultEventDocEventValidator(ev('MOVE_NODE'), published)).toBeTruthy();
  });

  it('allows only CREATE_DRAFT to branch a new draft off a published document', () => {
    const published = [init(), ev(Publish)];
    expect(defaultEventDocEventValidator(ev(CreateDraft), published)).toBeNull();
  });

  it('re-allows edits after a new draft is branched', () => {
    const branched = [init(), ev(Publish), ev(CreateDraft)];
    expect(defaultEventDocEventValidator(ev('ADD_NODE'), branched)).toBeNull();
  });
});
