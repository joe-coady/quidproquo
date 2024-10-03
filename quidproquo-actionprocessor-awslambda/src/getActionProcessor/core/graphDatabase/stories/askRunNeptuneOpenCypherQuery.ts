import {
  AskResponse,
  ErrorTypeEnum,
  GraphCypherResponse,
  GraphDatabaseExecuteOpenCypherQueryActionPayload,
  askNetworkRequest,
  askThrowError,
} from 'quidproquo-core';
import { askGraphDatabaseForNeptuneGetEndpoints } from '../customActions';
import { NeptuneCypherRequest, NeptuneCypherResponse } from './types';
import { askConvertNeptuneCypherResponseToCypherResponse } from './converters/askConvertNeptuneCypherResponseToCypherResponse';

export function* askRunNeptuneOpenCypherQuery({
  graphDatabaseName,
  openCypherQuery,
  params,
}: GraphDatabaseExecuteOpenCypherQueryActionPayload): AskResponse<GraphCypherResponse> {
  const graphEndpoints = yield* askGraphDatabaseForNeptuneGetEndpoints(graphDatabaseName);

  if (!graphEndpoints.writeEndpoint) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, 'No write endpoint found');
  }

  const endpoint = `${graphEndpoints.writeEndpoint}/openCypher`;

  const response = yield* askNetworkRequest<NeptuneCypherRequest, NeptuneCypherResponse>('POST', endpoint, {
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
