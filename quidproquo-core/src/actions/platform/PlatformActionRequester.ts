import PlatformActionTypeEnum from "./PlatformActionTypeEnum";

export function* askDelay(timeMs: number): Generator<any, void, unknown> {
  yield { type: PlatformActionTypeEnum.Delay, payload: { timeMs } };
}
