import { websocketConnectionData } from '../../data';
import { Connection } from '../../domain';

export function* askProcessOnConnect(
  id: string,
  requestTime: string,
  requestTimeEpoch: number,
  ip: string,
) {
  const newConnection: Connection = {
    id,
    requestTime,
    requestTimeEpoch,
    ip,
  };

  yield* websocketConnectionData.askUpsert(newConnection);
}
