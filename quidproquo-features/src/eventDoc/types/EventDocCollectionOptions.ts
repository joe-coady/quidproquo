import { EventDocRoutesOptions } from './EventDocRoutesOptions';

// The definition-form options for defineEventDoc: identity (storeName/type) comes off the
// live EventDocFunctions object, so the options carry only placement and seams.
export type EventDocCollectionOptions = Omit<EventDocRoutesOptions, 'storeName' | 'type'>;
