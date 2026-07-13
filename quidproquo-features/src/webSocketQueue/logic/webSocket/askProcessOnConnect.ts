import { webSocketConnectionData } from '../../data';
import { Connection } from '../../types';

export function* askProcessOnConnect(id: string, requestTime: string, requestTimeEpoch: number, ip: string) {
  const newConnection: Connection = {
    id,
    requestTime,
    requestTimeEpoch,
    ip,
  };

  yield* webSocketConnectionData.askUpsert(newConnection);
}
