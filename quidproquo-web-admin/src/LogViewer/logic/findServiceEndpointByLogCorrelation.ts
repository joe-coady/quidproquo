export const findServiceEndpointByLogCorrelation = (
  serviceLogEndpoints: string[],
  storyResultMetadatas: any[],
  logCorrelation: string,
): string | undefined => {
  // const metadata = storyResultMetadatas.find(
  //   (log: any) => log.correlation === logCorrelation,
  // );

  const moduleName = (logCorrelation || '').split('::')[0];

  const serviceEndpoint =
    moduleName && serviceLogEndpoints.find((se: string) => se.endsWith(moduleName));

  return serviceEndpoint;
};
