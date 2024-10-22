import { KvsUpdateActionType, KvsAdvancedDataType, KvsUpdateAction } from '../types';
import { KvsAttributePath } from '../types/KvsAttributePath';
export const kvsSet = (attributePath: KvsAttributePath, value: KvsAdvancedDataType): KvsUpdateAction => ({
  attributePath,
  action: KvsUpdateActionType.Set,
  value,
});

export const kvsRemove = (attributePath: KvsAttributePath): KvsUpdateAction => ({
  attributePath,
  action: KvsUpdateActionType.Remove,
});

export const kvsAdd = (attributePath: KvsAttributePath, value: KvsAdvancedDataType): KvsUpdateAction => ({
  attributePath,
  action: KvsUpdateActionType.Add,
  value,
});

export const kvsDelete = (attributePath: KvsAttributePath, value: KvsAdvancedDataType): KvsUpdateAction => ({
  attributePath,
  action: KvsUpdateActionType.Delete,
  value,
});

export const kvsUpdate = (actions: KvsUpdateAction[]): KvsUpdateAction[] => actions;
