export const findServiceEndpointByLogCorrelation = (
  serviceLogEndpoints: string[],
  logStoryResultMetadatas: any[],
  logCorrelation: string,
): string | undefined => {
  const moduleName = logStoryResultMetadatas.find(
    (log: any) => log.correlation === logCorrelation,
  )?.moduleName;
  const serviceEndpoint =
    moduleName && serviceLogEndpoints.find((se: string) => se.endsWith(moduleName));

  return serviceEndpoint;
};
