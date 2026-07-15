// The routes defineEventDocRoutes can mount, by name (each name is also its
// controller's file + function name). Naming them lets a collection omit one it
// must own itself — see EventDocRoutesOptions.excludeRoutes.
export type EventDocRouteName = 'list' | 'get' | 'listEvents' | 'render' | 'create' | 'appendEvent' | 'createAsset' | 'getAsset' | 'remove';
