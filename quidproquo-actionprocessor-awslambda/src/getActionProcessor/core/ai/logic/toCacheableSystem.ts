import type { SystemModelMessage } from 'ai';

// Bedrock only reads cache points off message objects, not the bare `system` string, so caching
// requires shaping system as a SystemModelMessage. @ai-sdk/amazon-bedrock (5.0.11) has no
// equivalent hook for the tools array, so tool definitions can't be cached this way yet.
export const toCacheableSystem = (system: string | undefined, caching: boolean | undefined): string | SystemModelMessage | undefined => {
  if (!system) {
    return undefined;
  }

  if (!caching) {
    return system;
  }

  return {
    role: 'system',
    content: system,
    providerOptions: {
      bedrock: { cachePoint: { type: 'default' } },
    },
  };
};
