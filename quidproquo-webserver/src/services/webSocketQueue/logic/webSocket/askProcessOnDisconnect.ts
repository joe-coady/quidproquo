import { webSocketConnectionData } from '../../data';

export function* askProcessOnDisconnect(id: string) {
  yield* webSocketConnectionData.askDeleteByConnectionId(id);
}
