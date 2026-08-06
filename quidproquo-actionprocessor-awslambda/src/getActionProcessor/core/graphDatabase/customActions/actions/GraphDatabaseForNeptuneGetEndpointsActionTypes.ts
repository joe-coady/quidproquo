import { GraphDatabaseForNeptuneActionType } from './GraphDatabaseForNeptuneActionType';

export type GraphDatabaseEndpoints = {
  readEndpoint?: string;
  writeEndpoint?: string;
};

// Payload
export interface GraphDatabaseForNeptuneGetEndpointsActionPayload {
  graphDatabaseName: string;
}
