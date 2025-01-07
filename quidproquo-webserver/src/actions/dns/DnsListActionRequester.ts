import { DnsActionType } from './DnsActionType';
import { DnsListActionRequester } from './DnsListActionTypes';

export function* askDnsList(): DnsListActionRequester {
  return yield {
    type: DnsActionType.List,
  };
}
