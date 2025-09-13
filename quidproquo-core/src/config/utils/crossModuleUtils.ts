import { CrossModuleOwner } from '../../types';

export const convertCrossModuleOwnerToGenericResourceNameOverride = <T extends string>(
  owner?: CrossModuleOwner<T>,
): CrossModuleOwner<'resourceNameOverride'> | undefined => {
  if (!owner) {
    return undefined;
  }

  type KeyType = keyof typeof owner;
  const key: KeyType = Array.from(Object.keys(owner)).find(
    (k) => k !== 'module' && k !== 'application' && k !== 'feature' && k !== 'environment',
  ) as any as KeyType;

  const value = owner[key];

  return {
    ...owner,
    resourceNameOverride: value,
  } as any as CrossModuleOwner<'resourceNameOverride'>;
};