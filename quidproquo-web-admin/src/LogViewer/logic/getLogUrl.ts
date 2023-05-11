import { findServiceEndpointByLogCorrelation } from './findServiceEndpointByLogCorrelation';

export const getLogUrl = (
  serviceLogEndpoints: string[],
  storyResultMetadatas: any[],
  logCorrelation: string,
): string => {
  const serviceEndpoint = findServiceEndpointByLogCorrelation(
    serviceLogEndpoints,
    storyResultMetadatas,
    logCorrelation,
  );

  const logUrl = `/${serviceEndpoint}/log/${logCorrelation}`;

  return logUrl;
};
