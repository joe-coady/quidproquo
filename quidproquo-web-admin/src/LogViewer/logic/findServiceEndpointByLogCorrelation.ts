export const findServiceEndpointByLogCorrelation = (
  serviceLogEndpoints: string[],
  storyResultMetadatas: any[],
  logCorrelation: string,
): string | undefined => {
  const moduleName = storyResultMetadatas.find(
    (log: any) => log.correlation === logCorrelation,
  )?.moduleName;
  const serviceEndpoint =
    moduleName && serviceLogEndpoints.find((se: string) => se.endsWith(moduleName));

  return serviceEndpoint;
};
