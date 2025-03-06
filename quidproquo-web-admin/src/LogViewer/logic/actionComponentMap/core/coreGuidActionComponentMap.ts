import { GuidActionType } from 'quidproquo-core';

const coreGuidActionComponentMap: Record<string, string[]> = {
  [GuidActionType.New]: ['askNewGuid'],
  [GuidActionType.NewSortable]: ['askNewSortableGuid'],
};

export default coreGuidActionComponentMap;
