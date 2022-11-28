import DateActionTypeEnum from "./DateActionTypeEnum";

export function* askDateNow(): Generator<any, string, string> {
  return yield { type: DateActionTypeEnum.Now };
}