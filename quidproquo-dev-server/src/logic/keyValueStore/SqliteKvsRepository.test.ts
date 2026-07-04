import {
  buildTestQpqConfig,
  defineKeyValueStore,
  KvsLogicalOperatorType,
  KvsQueryOperationType,
  KvsUpdateActionType,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SqliteKvsRepository } from './SqliteKvsRepository';

const openRepos: SqliteKvsRepository[] = [];
let runtimePath: string;

const makeRepo = (settings: QPQConfig): SqliteKvsRepository => {
  const repo = new SqliteKvsRepository(runtimePath, buildTestQpqConfig(settings));
  openRepos.push(repo);
  return repo;
};

beforeEach(() => {
  runtimePath = fs.mkdtempSync(path.join(os.tmpdir(), 'qpq-kvs-'));
});

afterEach(async () => {
  while (openRepos.length) {
    await openRepos.pop()!.close();
  }
  fs.rmSync(runtimePath, { recursive: true, force: true });
});

const usersStore = () => makeRepo([defineKeyValueStore('users', { key: 'id', type: 'string' })]);
const ordersStore = () => makeRepo([defineKeyValueStore('orders', { key: 'pk', type: 'string' }, [{ key: 'sk', type: 'string' }])]);
const eventsStore = () => makeRepo([defineKeyValueStore('events', { key: 'pk', type: 'string' }, [{ key: 'sk', type: 'number' }])]);

describe('SqliteKvsRepository upsert/get/delete', () => {
  it('upserts an item then reads it back by key', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', name: 'Joe' });

    expect(await repo.get('users', 'u1')).toEqual({ id: 'u1', name: 'Joe' });
  });

  it('returns null when getting a missing item', async () => {
    const repo = usersStore();
    expect(await repo.get('users', 'missing')).toBeNull();
  });

  it('upsert overwrites an existing item', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', name: 'Joe' });
    await repo.upsert('users', { id: 'u1', name: 'Joey' });

    expect(await repo.get('users', 'u1')).toEqual({ id: 'u1', name: 'Joey' });
  });

  it('reads a composite-key item using the pk#sk key string', async () => {
    const repo = ordersStore();
    await repo.upsert('orders', { pk: 'p1', sk: 's1', total: 5 });

    expect(await repo.get('orders', 'p1#s1')).toEqual({ pk: 'p1', sk: 's1', total: 5 });
  });

  it('delete returns true for an existing item and false for a missing one', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1' });

    expect(await repo.delete('users', 'u1')).toBe(true);
    expect(await repo.delete('users', 'u1')).toBe(false);
    expect(await repo.get('users', 'u1')).toBeNull();
  });

  it('deletes a composite-key item', async () => {
    const repo = ordersStore();
    await repo.upsert('orders', { pk: 'p1', sk: 's1' });

    expect(await repo.delete('orders', 'p1#s1')).toBe(true);
  });

  it('throws when the store is not in configuration', async () => {
    const repo = usersStore();
    await expect(repo.get('nope', 'x')).rejects.toThrow("Key value store 'nope' not found");
  });
});

describe('SqliteKvsRepository update', () => {
  it('creates a base item from keys when updating a missing row', async () => {
    const repo = usersStore();
    await repo.update('users', 'u1', undefined, [{ attributePath: 'name', action: KvsUpdateActionType.Set, value: 'Joe' }]);

    expect(await repo.get('users', 'u1')).toEqual({ id: 'u1', name: 'Joe' });
  });

  it('applies Set to an existing item', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', name: 'Joe' });
    await repo.update('users', 'u1', undefined, [{ attributePath: 'name', action: KvsUpdateActionType.Set, value: 'Joey' }]);

    expect((await repo.get('users', 'u1')).name).toBe('Joey');
  });

  it('Increment seeds from defaultValue then adds when attribute is missing', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1' });
    await repo.update('users', 'u1', undefined, [{ attributePath: 'count', action: KvsUpdateActionType.Increment, value: 3, defaultValue: 10 }]);

    expect((await repo.get('users', 'u1')).count).toBe(13);
  });

  it('Add increments an existing number', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', count: 1 });
    await repo.update('users', 'u1', undefined, [{ attributePath: 'count', action: KvsUpdateActionType.Add, value: 4 }]);

    expect((await repo.get('users', 'u1')).count).toBe(5);
  });

  it('Add unions array values', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', tags: ['a', 'b'] });
    await repo.update('users', 'u1', undefined, [{ attributePath: 'tags', action: KvsUpdateActionType.Add, value: ['b', 'c'] }]);

    expect((await repo.get('users', 'u1')).tags).toEqual(['a', 'b', 'c']);
  });

  it('Remove deletes an attribute', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', temp: 'x', keep: 'y' });
    await repo.update('users', 'u1', undefined, [{ attributePath: 'temp', action: KvsUpdateActionType.Remove }]);

    expect(await repo.get('users', 'u1')).toEqual({ id: 'u1', keep: 'y' });
  });

  it('Delete removes elements from an array', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', tags: ['a', 'b', 'c'] });
    await repo.update('users', 'u1', undefined, [{ attributePath: 'tags', action: KvsUpdateActionType.Delete, value: ['b'] }]);

    expect((await repo.get('users', 'u1')).tags).toEqual(['a', 'c']);
  });

  it('SetIfNotExists only sets when the attribute is absent', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', name: 'Joe' });
    await repo.update('users', 'u1', undefined, [
      { attributePath: 'name', action: KvsUpdateActionType.SetIfNotExists, value: 'Other' },
      { attributePath: 'nick', action: KvsUpdateActionType.SetIfNotExists, value: 'JJ' },
    ]);

    const item = await repo.get('users', 'u1');
    expect(item.name).toBe('Joe');
    expect(item.nick).toBe('JJ');
  });

  it('sets a nested attribute via a dotted path', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1' });
    await repo.update('users', 'u1', undefined, [{ attributePath: 'profile.city', action: KvsUpdateActionType.Set, value: 'NYC' }]);

    expect((await repo.get('users', 'u1')).profile).toEqual({ city: 'NYC' });
  });

  it('updates an existing composite-key item', async () => {
    const repo = ordersStore();
    await repo.upsert('orders', { pk: 'p1', sk: 's1', total: 1 });
    await repo.update('orders', 'p1', 's1', [{ attributePath: 'total', action: KvsUpdateActionType.Set, value: 9 }]);

    expect((await repo.get('orders', 'p1#s1')).total).toBe(9);
  });
});

describe('SqliteKvsRepository query', () => {
  const seedEvents = async (repo: SqliteKvsRepository) => {
    await repo.upsert('events', { pk: 'p', sk: 1, kind: 'a' });
    await repo.upsert('events', { pk: 'p', sk: 2, kind: 'b' });
    await repo.upsert('events', { pk: 'p', sk: 10, kind: 'a' });
  };

  it('orders numeric sort keys numerically, not lexically', async () => {
    const repo = eventsStore();
    await seedEvents(repo);

    const result = await repo.query('events', {
      key: 'pk',
      operation: KvsQueryOperationType.Equal,
      valueA: 'p',
    });

    expect(result.items.map((i) => i.sk)).toEqual([1, 2, 10]);
  });

  it('sorts descending when requested', async () => {
    const repo = eventsStore();
    await seedEvents(repo);

    const result = await repo.query(
      'events',
      { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'p' },
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    );

    expect(result.items.map((i) => i.sk)).toEqual([10, 2, 1]);
  });

  it('filters with a logical AND across a key range and a data field', async () => {
    const repo = eventsStore();
    await seedEvents(repo);

    const result = await repo.query(
      'events',
      {
        operation: KvsLogicalOperatorType.And,
        conditions: [
          { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'p' },
          { key: 'sk', operation: KvsQueryOperationType.GreaterThan, valueA: 1 },
        ],
      },
      { key: 'kind', operation: KvsQueryOperationType.Equal, valueA: 'a' },
    );

    expect(result.items.map((i) => i.sk)).toEqual([10]);
  });

  it('supports Between on a numeric sort key', async () => {
    const repo = eventsStore();
    await seedEvents(repo);

    const result = await repo.query('events', {
      operation: KvsLogicalOperatorType.And,
      conditions: [
        { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'p' },
        { key: 'sk', operation: KvsQueryOperationType.Between, valueA: 2, valueB: 10 },
      ],
    });

    expect(result.items.map((i) => i.sk)).toEqual([2, 10]);
  });

  it('supports In on a numeric sort key', async () => {
    const repo = eventsStore();
    await seedEvents(repo);

    const result = await repo.query('events', {
      operation: KvsLogicalOperatorType.And,
      conditions: [
        { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'p' },
        { key: 'sk', operation: KvsQueryOperationType.In, valueA: [1, 10] },
      ],
    });

    expect(result.items.map((i) => i.sk)).toEqual([1, 10]);
  });

  it('supports BeginsWith on a string sort key', async () => {
    const repo = ordersStore();
    await repo.upsert('orders', { pk: 'p', sk: '2024-01' });
    await repo.upsert('orders', { pk: 'p', sk: '2025-01' });

    const result = await repo.query('orders', {
      operation: KvsLogicalOperatorType.And,
      conditions: [
        { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'p' },
        { key: 'sk', operation: KvsQueryOperationType.BeginsWith, valueA: '2024' },
      ],
    });

    expect(result.items.map((i) => i.sk)).toEqual(['2024-01']);
  });

  it('supports an OR of data-field conditions', async () => {
    const repo = eventsStore();
    await seedEvents(repo);

    const result = await repo.query(
      'events',
      { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'p' },
      {
        operation: KvsLogicalOperatorType.Or,
        conditions: [
          { key: 'kind', operation: KvsQueryOperationType.Equal, valueA: 'b' },
          { key: 'sk', operation: KvsQueryOperationType.Equal, valueA: 10 },
        ],
      },
    );

    expect(result.items.map((i) => i.sk)).toEqual([2, 10]);
  });

  it('paginates results across pages using nextPageKey', async () => {
    const repo = eventsStore();
    await seedEvents(repo);

    const keyCondition = { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'p' };
    const collected: number[] = [];
    let nextPageKey: string | undefined;

    do {
      const page = await repo.query('events', keyCondition, undefined, nextPageKey, undefined, 1);
      collected.push(...page.items.map((i) => i.sk));
      nextPageKey = page.nextPageKey;
    } while (nextPageKey);

    expect(collected).toEqual([1, 2, 10]);
  });

  it('throws on an unsupported query operation', async () => {
    const repo = eventsStore();
    await seedEvents(repo);

    await expect(repo.query('events', { key: 'pk', operation: 'Nope' as KvsQueryOperationType, valueA: 'p' })).rejects.toThrow(
      'Unsupported query operation',
    );
  });
});

describe('SqliteKvsRepository scan', () => {
  it('scans all items in a store', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1' });
    await repo.upsert('users', { id: 'u2' });

    const result = await repo.scan('users');

    expect(result.items.map((i) => i.id).sort()).toEqual(['u1', 'u2']);
  });

  it('scans with a filter on a data field', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1', active: true });
    await repo.upsert('users', { id: 'u2', active: false });

    const result = await repo.scan('users', {
      key: 'active',
      operation: KvsQueryOperationType.Equal,
      valueA: true,
    });

    expect(result.items.map((i) => i.id)).toEqual(['u1']);
  });

  it('paginates a scan across pages', async () => {
    const repo = usersStore();
    await repo.upsert('users', { id: 'u1' });
    await repo.upsert('users', { id: 'u2' });
    await repo.upsert('users', { id: 'u3' });

    const collected: string[] = [];
    let nextPageKey: string | undefined;
    do {
      const page = await repo.scan('users', undefined, nextPageKey, 1);
      collected.push(...page.items.map((i) => i.id));
      nextPageKey = page.nextPageKey;
    } while (nextPageKey);

    expect(collected.sort()).toEqual(['u1', 'u2', 'u3']);
  });
});

describe('SqliteKvsRepository indexes', () => {
  const indexedStore = () =>
    makeRepo([
      defineKeyValueStore('people', { key: 'id', type: 'string' }, [], {
        indexes: [{ partitionKey: { key: 'email', type: 'string' }, sortKey: { key: 'age', type: 'number' } }],
      }),
    ]);

  it('maintains the index table across upsert, update and delete', async () => {
    const repo = indexedStore();
    await repo.upsert('people', { id: 'u1', email: 'a@x.com', age: 30 });
    await repo.update('people', 'u1', undefined, [{ attributePath: 'email', action: KvsUpdateActionType.Set, value: 'b@x.com' }]);
    expect((await repo.get('people', 'u1')).email).toBe('b@x.com');

    expect(await repo.delete('people', 'u1')).toBe(true);
    expect(await repo.get('people', 'u1')).toBeNull();
  });

  it('maintains an index without a sort key', async () => {
    const repo = makeRepo([
      defineKeyValueStore('accounts', { key: 'id', type: 'string' }, [], {
        indexes: [{ partitionKey: { key: 'email', type: 'string' } }],
      }),
    ]);

    await repo.upsert('accounts', { id: 'a1', email: 'a@x.com' });
    await repo.delete('accounts', 'a1');

    expect(await repo.get('accounts', 'a1')).toBeNull();
  });
});
