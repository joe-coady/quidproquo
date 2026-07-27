import { AskResponse } from 'quidproquo-core';

import { EventDocBundle, EventDocTransferPlanRow, EventDocTransferRegistry } from '../models';
import { askEventDocBundlePlanDoc } from './askEventDocBundlePlanDoc';
import { askEventDocTransferProvideCollection } from './askEventDocTransferProvideCollection';

/**
 * What importing this bundle would do, doc by doc, writing nothing. The review gate: the UI shows
 * these rows and the operator confirms before anything lands. Rows come back in bundle order (which
 * is leaves-first, the order an apply uses) so the plan and the result read the same way.
 */
export function* askEventDocBundlePlan(registry: EventDocTransferRegistry, bundle: EventDocBundle): AskResponse<EventDocTransferPlanRow[]> {
  const rows: EventDocTransferPlanRow[] = [];

  for (const doc of bundle.docs) {
    rows.push(yield* askEventDocTransferProvideCollection(registry, doc, askEventDocBundlePlanDoc(doc)));
  }

  return rows;
}
