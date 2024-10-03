import {
  AskResponse,
  ErrorTypeEnum,
  GraphCypherResponse,
  GraphDatabaseExecuteOpenCypherQueryActionPayload,
  askNetworkRequest,
  askThrowError,
  GraphDatabaseInstanceType,
} from 'quidproquo-core';
import { askGraphDatabaseForNeptuneGetEndpoints } from '../customActions';
import { NeptuneCypherRequest, NeptuneCypherResponse } from './types';
import { askConvertNeptuneCypherResponseToCypherResponse } from './converters/askConvertNeptuneCypherResponseToCypherResponse';

export function* askRunNeptuneOpenCypherQuery({
  graphDatabaseName,
  openCypherQuery,
  params,
  instance,
}: GraphDatabaseExecuteOpenCypherQueryActionPayload): AskResponse<GraphCypherResponse> {
  const graphEndpoints = yield* askGraphDatabaseForNeptuneGetEndpoints(graphDatabaseName);
  const graphEndpoint = instance === GraphDatabaseInstanceType.Read ? graphEndpoints.readEndpoint : graphEndpoints.writeEndpoint;

  if (!graphEndpoint) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `No [${instance}] endpoint found`);
  }

  const response = yield* askNetworkRequest<NeptuneCypherRequest, NeptuneCypherResponse>('POST', `${graphEndpoint}/openCypher`, {
    body: { query: openCypherQuery, parameters: params },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, 'Unable to query database');
  }

  return yield* askConvertNeptuneCypherResponseToCypherResponse(response.data);
}
