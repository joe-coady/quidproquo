export const urlPathLength = (path: string) => {
  return path.replace(/\{[^}]+\}/g, '').length;
};

interface PathObject {
  path: string;
}

export const sortPathMatchConfigs = <T extends PathObject>(objects: T[]): T[] => {
  return [...objects].sort((a, b) => {
    return urlPathLength(a.path) - urlPathLength(b.path);
  });
};
