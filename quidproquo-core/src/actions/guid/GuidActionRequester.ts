import GuidActionTypeEnum from './GuidActionTypeEnum';

export function* askNewGuid(): Generator<any, string, string> {
  return yield { type: GuidActionTypeEnum.New };
}