import {
  ConfigActionType,
  ContextActionType,
  DateActionType,
  GuidActionType,
  InlineFunctionActionType,
  KeyValueStoreActionType,
  KeyValueStoreUpsertErrorTypeEnum,
  KvsLogicalOperator,
  KvsLogicalOperatorType,
  KvsQueryCondition,
  KvsQueryOperation,
  KvsQueryOperationType,
  runStory,
  throwsError,
  UserDirectoryActionType,
} from 'quidproquo-core';
import { HTTPEvent } from 'quidproquo-webserver';

import { describe, expect, it } from 'vitest';

import {
  EVENT_DOC_EVENTS_STORE_NAME_GLOBAL,
  EVENT_DOC_ON_PUBLISH_GLOBAL,
  EVENT_DOC_STORE_NAME_GLOBAL,
  EVENT_DOC_TYPE_GLOBAL,
  EVENT_DOC_USER_DIRECTORY_GLOBAL,
} from '../eventDoc/constants/eventDocGlobalNames';
import { buildEventDocStore } from '../eventDoc/context/buildEventDocStore';
import { EventDocEffect, EventDocOnPublishInput } from '../eventDoc/models';
import { appendEvent } from '../eventDoc/routes/controllers/appendEvent';
import { DEFAULT_TENANT_HEADER_NAME, TENANT_HEADER_NAME_GLOBAL } from './constants/tenantGlobalNames';
import {
  TENANT_DOC_TYPE,
  TENANT_EVENTDOC_STORE,
  TENANT_ON_PUBLISH_FN,
  TENANT_RECORD_STORE,
  USER_TENANT_LINKS_STORE,
} from './constants/tenantStoreNames';
import { TenantEffect } from './fold/TenantEffect';
import { askTenantOnPublish } from './logic/askTenantOnPublish';
import { askTenantResolveActiveTenant } from './logic/askTenantResolveActiveTenant';
import { TenantStatus } from './models/TenantStatus';
import { create } from './routes/controllers/create';
import { get } from './routes/controllers/get';
import { list } from './routes/controllers/list';

// End-to-end story-level pass over the tenant feature: create links membership,
// SET_BRAND + PUBLISH materializes the record via the onPublish sync, list/get
// serve the record store, and the per-request tenant gate validates membership.

const store = buildEventDocStore({ storeName: TENANT_EVENTDOC_STORE, type: TENANT_DOC_TYPE, onPublish: TENANT_ON_PUBLISH_FN });

const globals: Record<string, string> = {
  [EVENT_DOC_STORE_NAME_GLOBAL]: store.storeName,
  [EVENT_DOC_EVENTS_STORE_NAME_GLOBAL]: store.eventsStoreName,
  [EVENT_DOC_TYPE_GLOBAL]: store.type,
  [EVENT_DOC_USER_DIRECTORY_GLOBAL]: 'test-user-directory',
  [EVENT_DOC_ON_PUBLISH_GLOBAL]: TENANT_ON_PUBLISH_FN,
  [TENANT_HEADER_NAME_GLOBAL]: DEFAULT_TENANT_HEADER_NAME,
};

const isCondition = (op: KvsQueryOperation): op is KvsQueryCondition => 'key' in op;

const matches = (item: Record<string, unknown>, op: KvsQueryOperation): boolean => {
  if (isCondition(op)) {
    const actual = item[op.key];
    switch (op.operation) {
      case KvsQueryOperationType.Equal:
        return actual === op.valueA;
      case KvsQueryOperationType.GreaterThan:
        return typeof actual === 'number' && typeof op.valueA === 'number' && actual > op.valueA;
      default:
        throw new Error(`Test KVS mock does not support operator: ${op.operation}`);
    }
  }

  const logical = op as KvsLogicalOperator;
  if (logical.operation === KvsLogicalOperatorType.And) {
    return logical.conditions.every((c) => matches(item, c));
  }
  throw new Error(`Test KVS mock does not support logical operator: ${logical.operation}`);
};

const buildMocks = () => {
  const tables: Record<string, Record<string, unknown>[]> = {};
  const inlinePayloads: EventDocOnPublishInput[] = [];
  let guidCounter = 0;
  let clock = Date.parse('2026-07-11T00:00:00.000Z');

  // Row identity per store: the events store keys pk/sk, the summary store id,
  // the record store tenantId, the links store userId.
  const sameRow = (item: Record<string, unknown>) => (row: Record<string, unknown>) => {
    if ('pk' in item && 'sk' in item) return row.pk === item.pk && row.sk === item.sk;
    if ('tenantId' in item) return row.tenantId === item.tenantId;
    if ('userId' in item) return row.userId === item.userId;
    return row.id === item.id;
  };

  const mocks = {
    [ConfigActionType.GetGlobal]: (action: { payload: { globalName: string } }) => globals[action.payload.globalName] ?? '',

    [UserDirectoryActionType.ReadAccessToken]: { userId: 'user-1', username: 'joe', exp: 0, userDirectory: 'test-user-directory', wasValid: true },

    [DateActionType.Now]: () => new Date((clock += 1000)).toISOString(),
    [GuidActionType.New]: () => `guid-${++guidCounter}`,

    [InlineFunctionActionType.Execute]: (action: { payload: { functionName: string; payload: EventDocOnPublishInput } }) => {
      inlinePayloads.push(action.payload.payload);
      return undefined;
    },

    [KeyValueStoreActionType.Get]: (action: { payload: { keyValueStoreName: string; key: string } }) => {
      const table = tables[action.payload.keyValueStoreName] ?? [];
      return table.find((row) => row.tenantId === action.payload.key || row.userId === action.payload.key || row.id === action.payload.key) ?? null;
    },

    [KeyValueStoreActionType.Upsert]: (action: {
      payload: { keyValueStoreName: string; item: Record<string, unknown>; options?: { ifNotExists?: boolean } };
    }) => {
      const { keyValueStoreName, item, options } = action.payload;
      const table = (tables[keyValueStoreName] ??= []);
      const existingIndex = table.findIndex(sameRow(item));

      if (options?.ifNotExists && existingIndex >= 0) {
        return throwsError(KeyValueStoreUpsertErrorTypeEnum.Conflict, `Item already exists in ${keyValueStoreName}`);
      }

      if (existingIndex >= 0) {
        table[existingIndex] = item;
      } else {
        table.push(item);
      }

      return undefined;
    },

    [KeyValueStoreActionType.Query]: (action: {
      payload: { keyValueStoreName: string; keyCondition: KvsQueryOperation; options?: { sortAscending?: boolean; limit?: number } };
    }) => {
      const { keyValueStoreName, keyCondition, options } = action.payload;
      const table = tables[keyValueStoreName] ?? [];

      let items = table.filter((item) => matches(item, keyCondition));

      if ('sk' in (items[0] ?? {})) {
        items = [...items].sort((a, b) => ((a.sk as number) - (b.sk as number)) * (options?.sortAscending === false ? -1 : 1));
      }

      if (options?.limit !== undefined) {
        items = items.slice(0, options.limit);
      }

      return { items, nextPageKey: undefined };
    },
  };

  return { mocks, tables, inlinePayloads };
};

const httpEvent = (body: unknown, headers: Record<string, string> = {}): HTTPEvent => ({
  path: '/tenants',
  query: {},
  body: JSON.stringify(body),
  headers,
  method: 'POST',
  correlation: 'test-correlation',
  sourceIp: '127.0.0.1',
  isBase64Encoded: false,
});

describe('tenant feature', () => {
  it('creates a tenant, links membership, materializes the record on publish, and serves it back', () => {
    const { mocks, tables, inlinePayloads } = buildMocks();

    // Create: the caller becomes the first member.
    const createResponse = runStory(create(httpEvent({ name: 'credit-corp' })), mocks);
    expect(createResponse.status).toBe(200);
    const summary = JSON.parse(createResponse.body!);

    const links = tables[USER_TENANT_LINKS_STORE];
    expect(links).toEqual([{ userId: 'user-1', tenantIds: [summary.id] }]);

    // The list serves the created tenant IMMEDIATELY (summary store, drafts
    // included) - a never-published tenant must be reopenable to finish setup.
    const draftListResponse = runStory(list(), mocks);
    const draftList = JSON.parse(draftListResponse.body!);
    expect(draftList).toHaveLength(1);
    expect(draftList[0]).toMatchObject({ id: summary.id, name: 'credit-corp' });

    // Brand it, then publish (through the generic eventDoc append route).
    const brandResponse = runStory(
      appendEvent(
        httpEvent({
          type: TenantEffect.setBrand,
          payload: { data: { brandColors: { primary: '#123456' }, logoUrl: 'logo.png' }, metadata: { version: 1, clientMessageId: 'msg-1' } },
        }),
        { id: summary.id },
      ),
      mocks,
    );
    expect(brandResponse.status).toBe(200);

    const publishResponse = runStory(
      appendEvent(
        httpEvent({
          type: EventDocEffect.Publish,
          payload: { data: { effectiveFrom: '2026-07-11T00:00:00.000Z' }, metadata: { version: 1, clientMessageId: 'msg-2' } },
        }),
        { id: summary.id },
      ),
      mocks,
    );
    expect(publishResponse.status).toBe(200);

    // The hook fired through the inline-function boundary; run the real sync
    // with the exact payload it received. In production the inline function
    // executes inside the append's session, so the store context is inherited;
    // here the runStory harness needs the context read mocked to the store.
    expect(inlinePayloads).toHaveLength(1);
    runStory(askTenantOnPublish(inlinePayloads[0]), {
      ...mocks,
      [ContextActionType.Read]: () => store,
    });

    const records = tables[TENANT_RECORD_STORE];
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      tenantId: summary.id,
      name: 'credit-corp',
      brandColors: { primary: '#123456' },
      logoUrl: 'logo.png',
      createdByUserId: 'user-1',
      status: TenantStatus.active,
    });

    // The list serves EventDocSummary rows; get serves the materialized record.
    const listResponse = runStory(list(), mocks);
    const listed = JSON.parse(listResponse.body!);
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({ id: summary.id, name: 'credit-corp' });
    expect(listed[0].versions).toBeDefined();

    const getResponse = runStory(get(httpEvent(undefined), { id: summary.id }), mocks);
    expect(JSON.parse(getResponse.body!).name).toBe('credit-corp');
  });

  it('excludes soft-deleted tenants from the list', () => {
    const { mocks, tables } = buildMocks();

    const createResponse = runStory(create(httpEvent({ name: 'credit-corp' })), mocks);
    const summary = JSON.parse(createResponse.body!);

    // Soft-delete the summary row directly (the remove route folds to the same shape).
    const summaryRow = tables[TENANT_EVENTDOC_STORE].find((row) => row.id === summary.id)!;
    summaryRow.deletedAt = '2026-07-11T01:00:00.000Z';

    const listResponse = runStory(list(), mocks);
    expect(JSON.parse(listResponse.body!)).toEqual([]);
  });

  it('gates requests on membership of the claimed tenant header', () => {
    const { mocks, tables } = buildMocks();
    tables[USER_TENANT_LINKS_STORE] = [{ userId: 'user-1', tenantIds: ['tenant-a'] }];

    const resolved = runStory(askTenantResolveActiveTenant(httpEvent(undefined, { [DEFAULT_TENANT_HEADER_NAME]: 'tenant-a' })), mocks);
    expect(resolved).toBe('tenant-a');

    expect(() => runStory(askTenantResolveActiveTenant(httpEvent(undefined, { [DEFAULT_TENANT_HEADER_NAME]: 'tenant-b' })), mocks)).toThrow(
      /not a member/,
    );

    expect(() => runStory(askTenantResolveActiveTenant(httpEvent(undefined)), mocks)).toThrow(/Missing tenant header/);
  });

  it('denies get for a tenant the user is not a member of', () => {
    const { mocks, tables } = buildMocks();
    tables[USER_TENANT_LINKS_STORE] = [{ userId: 'user-1', tenantIds: ['tenant-a'] }];

    expect(() => runStory(get(httpEvent(undefined), { id: 'tenant-b' }), mocks)).toThrow(/not a member/);
  });
});
