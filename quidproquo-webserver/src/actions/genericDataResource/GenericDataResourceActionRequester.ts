import GenericDataResourceActionTypeEnum from './GenericDataResourceActionTypeEnum';

export function* askPutGenericDataResource(tableName: string, item: object): Generator<any, object, object> {
  return yield { type: GenericDataResourceActionTypeEnum.Put, payload: { tableName, item } };
}

export function* askScanGenericDataResource(tableName: string, maxItems: number): Generator<any, Array<object>, Array<object>> {
  return yield { type: GenericDataResourceActionTypeEnum.Scan, payload: { tableName, maxItems } };
}