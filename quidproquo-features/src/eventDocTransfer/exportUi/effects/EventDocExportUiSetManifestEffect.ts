import { Effect } from 'quidproquo-core';

import { EventDocManifestItem } from '../../models';
import { EventDocExportUiEffect } from './EventDocExportUiEffect';

export type EventDocExportUiSetManifestPayload = {
  items: EventDocManifestItem[];
};

export type EventDocExportUiSetManifestEffect = Effect<EventDocExportUiEffect.SetManifest, EventDocExportUiSetManifestPayload>;
