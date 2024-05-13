import { websocketConnectionData } from '../../data';

export function* askProcessOnDisconnect(id: string) {
  yield* websocketConnectionData.askDeleteByConnectionId(id);
}
