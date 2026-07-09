import { awsPlatformDriver } from './aws';
import { dockerPlatformDriver } from './docker';
import { QpqDeployPlatform, QpqPlatformDriver } from './types';

const platformDrivers: Record<string, QpqPlatformDriver> = {
  [QpqDeployPlatform.aws]: awsPlatformDriver,
  [QpqDeployPlatform.docker]: dockerPlatformDriver,
};

// Lenient lookup for best-effort paths (local dev priming) — undefined when
// the platform isn't known, never exits.
export const findPlatformDriver = (platform: string): QpqPlatformDriver | undefined => platformDrivers[platform];

export const getPlatformDriver = (platform: string): QpqPlatformDriver => {
  const driver = findPlatformDriver(platform);

  if (!driver) {
    console.error(`Unknown deploy platform '${platform}'. Supported platforms: ${Object.keys(platformDrivers).join(', ')}`);
    process.exit(1);
  }

  return driver;
};

export * from './types';
