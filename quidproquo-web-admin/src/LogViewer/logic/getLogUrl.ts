import { findServiceEndpointByLogCorrelation } from './findServiceEndpointByLogCorrelation';

export const getLogUrl = (
  serviceLogEndpoints: string[],
  logStoryResultMetadatas: any[],
  logCorrelation: string,
): string => {
  const serviceEndpoint = findServiceEndpointByLogCorrelation(
    serviceLogEndpoints,
    logStoryResultMetadatas,
    logCorrelation,
  );

  const logUrl = `/${serviceEndpoint}/log/${logCorrelation}`;

  return logUrl;
};
