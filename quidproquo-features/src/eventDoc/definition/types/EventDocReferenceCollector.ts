import { EventDocLink } from '../../models';

// A doc type's outbound references, derived from its folded view: the other docs this one
// depends on (a template -> its layout, styles and content items). Pure and synchronous, so
// it runs anywhere the view is available - a manifest walk, impact analysis, a unit test - and
// needs no story machinery. Declared on the definition next to `fold`; a leaf doc type (a
// stylesheet, a layout) declares nothing at all rather than an empty collector.
export type EventDocReferenceCollector<TView> = (view: TView) => EventDocLink[];
