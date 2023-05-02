export const getServiceEntry = (serviceName: string, entryType: string, src: string): string => {
  return `@QpqService/${serviceName}/entry/${entryType}/${src}`;
};
