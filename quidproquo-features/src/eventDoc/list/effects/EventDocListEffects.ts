import type { EventDocListAddItemEffect } from './EventDocListAddItemEffect';
import type { EventDocListSetConfigEffect } from './EventDocListSetConfigEffect';
import type { EventDocListSetErrorEffect } from './EventDocListSetErrorEffect';
import type { EventDocListSetItemsEffect } from './EventDocListSetItemsEffect';
import type { EventDocListSetLoadingEffect } from './EventDocListSetLoadingEffect';
import type { EventDocListSetPageEffect } from './EventDocListSetPageEffect';
import type { EventDocListSetPageSizeEffect } from './EventDocListSetPageSizeEffect';

export type EventDocListEffects =
  | EventDocListSetConfigEffect
  | EventDocListSetItemsEffect
  | EventDocListAddItemEffect
  | EventDocListSetLoadingEffect
  | EventDocListSetErrorEffect
  | EventDocListSetPageEffect
  | EventDocListSetPageSizeEffect;
