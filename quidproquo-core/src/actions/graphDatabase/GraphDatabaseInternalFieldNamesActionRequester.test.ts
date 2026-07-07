import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { askGraphDatabaseInternalFieldNames } from './GraphDatabaseInternalFieldNamesActionRequester';

describe('askGraphDatabaseInternalFieldNames', () => {
  it('yields an InternalFieldNames action with no payload', () => {
    const { action } = captureRequester(askGraphDatabaseInternalFieldNames());

    expect(action).toEqual({
      type: GraphDatabaseActionType.InternalFieldNames,
    });
  });

  it('returns the field names the runtime resolves', () => {
    const fieldNames = ['id', 'createdAt'];
    const { returned } = captureRequester(askGraphDatabaseInternalFieldNames(), fieldNames);

    expect(returned).toBe(fieldNames);
  });
});
